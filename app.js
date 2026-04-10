// ===== Examiner — Main Application =====
// All computation runs client-side. No server required.

(function () {
  'use strict';

  // ===== State =====
  let selectedCourseIds = [];
  let currentView = 'landing';
  const STORAGE_KEY = 'examiner_courses';
  const FIRST_VISIT_KEY = 'examiner_visited';
  const STUDY_RANK_KEY = 'examiner_study_ranks';
  const STUDY_HOURS_KEY = 'examiner_study_hours';
  const STUDY_CUSTOM_KEY = 'examiner_study_custom';
  let studyPlanData = null;

  // ===== Cookie Helpers =====
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    const nameEq = name + '=';
    const parts = document.cookie.split(';');
    for (let i = 0; i < parts.length; i++) {
      const c = parts[i].trim();
      if (c.indexOf(nameEq) === 0) return decodeURIComponent(c.substring(nameEq.length));
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  }

  // ===== Init =====
  document.addEventListener('DOMContentLoaded', () => {
    buildLegend();
    buildCourseDropdown();
    loadSavedCourses();
    setupSearch();
    setupNavigation();

    const visited = localStorage.getItem(FIRST_VISIT_KEY);
    if (visited) {
      // Returning user — check if they have saved courses
      if (selectedCourseIds.length > 0) {
        showView('my');
        generatePersonalCalendar();
      } else {
        showView('landing');
      }
    } else {
      showView('landing');
    }
    localStorage.setItem(FIRST_VISIT_KEY, '1');
  });

  function setupNavigation() {
    // Generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
      generatePersonalCalendar();
      showView('my');
    });

    // Export buttons
    document.getElementById('btn-export-svg').addEventListener('click', () => exportSVG());
    document.getElementById('btn-export-google').addEventListener('click', () => exportICS('google'));
    document.getElementById('btn-export-outlook').addEventListener('click', () => exportICS('outlook'));
    document.getElementById('btn-export-csv').addEventListener('click', () => exportCSV());
    document.getElementById('btn-copy-link').addEventListener('click', () => copyShareLink());

    // Nav links
    document.querySelectorAll('.nav-links a[data-view]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showView(a.dataset.view);
      });
    });

    // Landing buttons
    document.querySelectorAll('.landing-actions a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = a.getAttribute('href');
        if (hash === '#/calendar') showView('calendar');
        else if (hash === '#/select') showView('select');
        else if (hash === '#/study') showView('study');
      });
    });

    // Edit subjects link
    document.querySelectorAll('.edit-subjects-bar a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showView('select');
      });
    });

    // Brand link -> landing
    document.querySelector('.nav-brand').addEventListener('click', (e) => {
      e.preventDefault();
      showView('landing');
    });

    // Study plan
    document.getElementById('generate-study-btn').addEventListener('click', generateStudyPlan);
    document.getElementById('study-select-link').addEventListener('click', (e) => {
      e.preventDefault();
      showView('select');
    });
  }

  // ===== View Management =====
  window.showView = function (viewId) {
    currentView = viewId;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById(viewId);
    if (el) el.classList.add('active');

    // Update nav active state
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.view === viewId);
    });

    // Show nav links when not on landing
    document.getElementById('nav-links').style.display = viewId === 'landing' ? 'none' : '';

    // Build calendar when showing full calendar
    if (viewId === 'calendar') {
      buildFullCalendar();
    }

    // Init study view when showing it
    if (viewId === 'study') {
      initStudyView();
    }
  };

  window.showLanding = function () {
    showView('landing');
  };

  // ===== Legend =====
  function buildLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    for (const [key, g] of Object.entries(SUBJECT_GROUPS)) {
      const item = document.createElement('div');
      item.className = 'legend-item';
      const shapeClass = key === 'ap' ? 'legend-dot dot-ap' : 'legend-dot';
      item.innerHTML = `<span class="${shapeClass}" style="background:${g.color}"></span>${g.label}`;
      legend.appendChild(item);
    }
  }

  // ===== Calendar Building =====
  function buildCalendar(containerId, exams, highlightQuery, conflictDates) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Calendar range: April 20 to May 24, 2026 (to show full weeks around the exam period)
    const startDate = new Date(2026, 3, 20); // Mon Apr 20
    const endDate = new Date(2026, 4, 24);   // Sun May 24

    // Day headers
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(d => {
      const header = document.createElement('div');
      header.className = 'calendar-header';
      header.textContent = d;
      container.appendChild(header);
    });

    // Build day cells
    const current = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      const dateStr = formatDate(current);
      const dayOfWeek = (current.getDay() + 6) % 7; // Mon=0

      const dayExams = exams.filter(e => e.date === dateStr);
      const morningExams = dayExams.filter(e => e.session === 'morning');
      const afternoonExams = dayExams.filter(e => e.session === 'afternoon');

      const cell = document.createElement('div');
      cell.className = 'calendar-day';

      const cellDate = new Date(current);
      cellDate.setHours(0, 0, 0, 0);
      if (cellDate.getTime() === today.getTime()) cell.classList.add('today');

      // Check if outside exam period or weekend with no exams
      if (dayExams.length === 0 && (dayOfWeek >= 5 || dateStr < '2026-04-24' || dateStr > '2026-05-20')) {
        if (dayOfWeek >= 5) {
          cell.classList.add('no-exams');
        }
      }

      // Day number
      const dayNum = document.createElement('div');
      dayNum.className = 'day-number';
      const dayLabel = current.toLocaleDateString('en-US', { weekday: 'short' });
      dayNum.innerHTML = `<span class="day-label">${dayLabel}</span>${current.getDate()}`;
      cell.appendChild(dayNum);

      // Month label for first of month
      if (current.getDate() === 1) {
        const monthLabel = document.createElement('div');
        monthLabel.style.cssText = 'font-size:0.6rem;color:var(--text-muted);margin-bottom:2px;';
        monthLabel.textContent = current.toLocaleDateString('en-US', { month: 'short' });
        cell.insertBefore(monthLabel, dayNum);
      }

      // Exam dots
      if (dayExams.length > 0) {
        // Morning session
        if (morningExams.length > 0) {
          const sessionLabel = document.createElement('div');
          sessionLabel.className = 'day-session-label';
          sessionLabel.textContent = 'AM';
          cell.appendChild(sessionLabel);
          cell.appendChild(buildSessionDots(morningExams, highlightQuery));
        }

        // Afternoon session
        if (afternoonExams.length > 0) {
          const sessionLabel = document.createElement('div');
          sessionLabel.className = 'day-session-label';
          sessionLabel.textContent = 'PM';
          cell.appendChild(sessionLabel);
          cell.appendChild(buildSessionDots(afternoonExams, highlightQuery));
        }

        // Check if any exam matches highlight
        if (highlightQuery) {
          const anyMatch = dayExams.some(e => e.name.toLowerCase().includes(highlightQuery.toLowerCase()));
          if (anyMatch) cell.classList.add('highlighted');
        }

        // Conflict highlighting
        if (conflictDates && conflictDates.has(dateStr)) {
          cell.classList.add('has-conflict');
        }

        // Tooltip on hover
        cell.addEventListener('mouseenter', (ev) => showTooltip(ev, dateStr, dayExams));
        cell.addEventListener('mousemove', (ev) => positionTooltip(ev));
        cell.addEventListener('mouseleave', hideTooltip);
      }

      container.appendChild(cell);
      current.setDate(current.getDate() + 1);
    }
  }

  function buildFullCalendar(query) {
    buildCalendar('calendar-grid', EXAMS, query);
  }

  // Build dots/pills for a session's exams. Same-course multi-paper exams become a pill.
  function buildSessionDots(sessionExams, highlightQuery) {
    const dots = document.createElement('div');
    dots.className = 'day-dots';

    // Group exams that share a courseId — those are multi-paper sessions
    const used = new Set();
    const groups = [];
    for (let i = 0; i < sessionExams.length; i++) {
      if (used.has(i)) continue;
      const exam = sessionExams[i];
      const siblings = [];
      for (let j = i + 1; j < sessionExams.length; j++) {
        if (used.has(j)) continue;
        const other = sessionExams[j];
        // Same group + share at least one courseId = multi-paper
        if (other.group === exam.group &&
            exam.courseIds.some(id => other.courseIds.includes(id))) {
          siblings.push(j);
        }
      }
      if (siblings.length > 0) {
        const allIndices = [i, ...siblings];
        allIndices.forEach(idx => used.add(idx));
        groups.push(allIndices.map(idx => sessionExams[idx]));
      } else {
        used.add(i);
        groups.push([exam]);
      }
    }

    groups.forEach(exams => {
      const exam = exams[0];
      const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
      const isPill = exams.length > 1;

      const el = document.createElement('div');
      if (isPill) {
        el.className = 'day-pill';
      } else {
        el.className = exam.group === 'ap' ? 'day-dot dot-ap' : 'day-dot';
      }
      el.style.backgroundColor = color;
      el.style.color = color;

      if (highlightQuery) {
        const anyMatch = exams.some(e => e.name.toLowerCase().includes(highlightQuery.toLowerCase()));
        el.classList.add(anyMatch ? 'highlighted-dot' : 'dimmed');
      }

      dots.appendChild(el);
    });

    return dots;
  }

  // ===== Tooltip =====
  const tooltip = document.getElementById('tooltip');

  function showTooltip(ev, dateStr, dayExams) {
    const date = new Date(dateStr + 'T00:00:00');
    const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    let html = `<div class="tooltip-date">${dateLabel}</div>`;

    const morningExams = dayExams.filter(e => e.session === 'morning');
    const afternoonExams = dayExams.filter(e => e.session === 'afternoon');

    if (morningExams.length > 0) {
      html += `<div class="tooltip-session">Morning Session</div>`;
      morningExams.forEach(exam => {
        const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
        const dotClass = exam.group === 'ap' ? 't-dot dot-ap' : 't-dot';
        html += `<div class="tooltip-exam">
          <span class="${dotClass}" style="background:${sanitize(color)}"></span>
          <span class="t-name">${sanitize(exam.name)}</span>
          <span class="t-dur">${formatDuration(exam.duration)}</span>
        </div>`;
      });
    }

    if (afternoonExams.length > 0) {
      html += `<div class="tooltip-session">Afternoon Session</div>`;
      afternoonExams.forEach(exam => {
        const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
        const dotClass = exam.group === 'ap' ? 't-dot dot-ap' : 't-dot';
        html += `<div class="tooltip-exam">
          <span class="${dotClass}" style="background:${sanitize(color)}"></span>
          <span class="t-name">${sanitize(exam.name)}</span>
          <span class="t-dur">${formatDuration(exam.duration)}</span>
        </div>`;
      });
    }

    tooltip.innerHTML = html;
    tooltip.classList.add('visible');
    positionTooltip(ev);
  }

  function positionTooltip(ev) {
    const pad = 16;
    let x = ev.clientX + pad;
    let y = ev.clientY + pad;
    const rect = tooltip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = ev.clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight) y = ev.clientY - rect.height - pad;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  // ===== Search =====
  function setupSearch() {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');
    let debounce;

    input.addEventListener('input', () => {
      clearTimeout(debounce);
      const q = input.value.trim();
      clearBtn.classList.toggle('visible', q.length > 0);
      debounce = setTimeout(() => {
        buildFullCalendar(q || undefined);
      }, 200);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('visible');
      buildFullCalendar();
    });
  }

  // ===== Course Selector (Searchable Dropdown) =====

  // Exclusion groups: selecting any course in a group hides the others.
  // HL/SL pairs for same subject, plus all math variants are mutually exclusive.
  // Sciences are NOT mutually exclusive across subjects (only HL/SL of same subject).
  const EXCLUSION_GROUPS = [
    // Mathematics — only one math course
    ['math_aa_hl', 'math_aa_sl', 'math_ai_hl', 'math_ai_sl'],
    // HL/SL pairs for each IB subject
    ['physics_hl', 'physics_sl'],
    ['chemistry_hl', 'chemistry_sl'],
    ['biology_hl', 'biology_sl'],
    ['computer_science_hl', 'computer_science_sl'],
    ['design_technology_hl', 'design_technology_sl'],
    ['sports_exercise_health_hl', 'sports_exercise_health_sl'],
    ['ess_hl', 'ess_sl'],
    ['history_hl', 'history_sl'],
    ['geography_hl', 'geography_sl'],
    ['economics_hl', 'economics_sl'],
    ['psychology_hl', 'psychology_sl'],
    ['philosophy_hl', 'philosophy_sl'],
    ['social_cultural_anthropology_hl', 'social_cultural_anthropology_sl'],
    ['global_politics_hl', 'global_politics_sl'],
    ['business_management_hl', 'business_management_sl'],
    ['digital_society_hl', 'digital_society_sl'],
    ['english_a_lit_hl', 'english_a_lit_sl'],
    ['english_a_langlit_hl', 'english_a_langlit_sl'],
    ['french_a_lit_hl', 'french_a_lit_sl'],
    ['french_a_langlit_hl', 'french_a_langlit_sl'],
    ['spanish_a_lit_hl', 'spanish_a_lit_sl'],
    ['spanish_a_langlit_hl', 'spanish_a_langlit_sl'],
    ['lang_a_lit_hl_other', 'lang_a_lit_sl_other'],
    ['lang_a_langlit_hl_other', 'lang_a_langlit_sl_other'],
    ['english_b_hl', 'english_b_sl'],
    ['french_b_hl', 'french_b_sl'],
    ['spanish_b_hl', 'spanish_b_sl'],
    ['lang_b_hl_other', 'lang_b_sl_other'],
    ['latin_hl', 'latin_sl'],
    ['classical_greek_hl', 'classical_greek_sl'],
  ];

  function getExcludedIds(selectedIds) {
    const excluded = new Set();
    for (const id of selectedIds) {
      for (const group of EXCLUSION_GROUPS) {
        if (group.includes(id)) {
          group.forEach(gid => { if (gid !== id) excluded.add(gid); });
        }
      }
    }
    return excluded;
  }

  // Acronym/alias map — searched invisibly alongside course name
  const COURSE_ALIASES = {
    // IB Math
    math_aa_hl: ['aa', 'aa hl', 'analysis approaches', 'math aa'],
    math_aa_sl: ['aa', 'aa sl', 'analysis approaches', 'math aa'],
    math_ai_hl: ['ai', 'ai hl', 'applications interpretation', 'math ai'],
    math_ai_sl: ['ai', 'ai sl', 'applications interpretation', 'math ai'],
    // IB Sciences
    computer_science_hl: ['cs', 'cs hl', 'compsci'],
    computer_science_sl: ['cs', 'cs sl', 'compsci'],
    ess_hl: ['ess', 'ess hl', 'environmental'],
    ess_sl: ['ess', 'ess sl', 'environmental'],
    sports_exercise_health_hl: ['sehs', 'sehs hl', 'sports science'],
    sports_exercise_health_sl: ['sehs', 'sehs sl', 'sports science'],
    design_technology_hl: ['dt', 'dt hl', 'design tech'],
    design_technology_sl: ['dt', 'dt sl', 'design tech'],
    // IB Individuals & Societies
    business_management_hl: ['bm', 'bm hl', 'business'],
    business_management_sl: ['bm', 'bm sl', 'business'],
    global_politics_hl: ['gp', 'gp hl', 'glopol'],
    global_politics_sl: ['gp', 'gp sl', 'glopol'],
    digital_society_hl: ['ds', 'digsoc', 'digital soc'],
    digital_society_sl: ['ds', 'digsoc', 'digital soc'],
    social_cultural_anthropology_hl: ['sca', 'anthro', 'anthropology'],
    social_cultural_anthropology_sl: ['sca', 'anthro', 'anthropology'],
    economics_hl: ['econ', 'econ hl'],
    economics_sl: ['econ', 'econ sl'],
    psychology_hl: ['psych', 'psych hl'],
    psychology_sl: ['psych', 'psych sl'],
    philosophy_hl: ['philo', 'phil'],
    philosophy_sl: ['philo', 'phil'],
    geography_hl: ['geo', 'geo hl', 'geog'],
    geography_sl: ['geo', 'geo sl', 'geog'],
    history_hl: ['hist', 'hist hl'],
    history_sl: ['hist', 'hist sl'],
    // IB Language
    english_a_lit_hl: ['eng lit', 'english lit'],
    english_a_lit_sl: ['eng lit', 'english lit'],
    english_a_langlit_hl: ['eng langlit', 'eng lang lit', 'english langlit'],
    english_a_langlit_sl: ['eng langlit', 'eng lang lit', 'english langlit'],
    english_b_hl: ['eng b'],
    english_b_sl: ['eng b'],
    lit_performance_sl: ['litperf', 'lit perf'],
    lang_culture_sl: ['lang culture'],
    sbs_sl: ['sbs', 'school based'],
    // AP
    ap_csa: ['csa', 'computer science a', 'cs a', 'compsci a'],
    ap_csp: ['csp', 'computer science principles', 'cs principles', 'compsci p'],
    ap_calculus_ab: ['calc ab', 'calcab'],
    ap_calculus_bc: ['calc bc', 'calcbc'],
    ap_precalculus: ['precalc'],
    ap_statistics: ['stats', 'stat'],
    ap_us_history: ['apush', 'us history', 'us hist'],
    ap_world_history: ['ap world', 'world hist', 'whap'],
    ap_european_history: ['ap euro', 'euro hist'],
    ap_us_gov: ['ap gov', 'us gov', 'usgov', 'apgov'],
    ap_comp_gov: ['comp gov', 'comparative gov'],
    ap_human_geography: ['aphug', 'human geo', 'hug'],
    ap_english_lit: ['ap lit', 'eng lit ap'],
    ap_english_lang: ['ap lang', 'eng lang ap'],
    ap_microeconomics: ['micro', 'ap micro'],
    ap_macroeconomics: ['macro', 'ap macro'],
    ap_physics_1: ['phys 1', 'physics 1'],
    ap_physics_2: ['phys 2', 'physics 2'],
    ap_physics_c_mech: ['phys c mech', 'physics c mech', 'ap mech'],
    ap_physics_c_em: ['phys c em', 'physics c em', 'ap em', 'e&m'],
    ap_environmental_science: ['apes', 'ap enviro', 'ap env'],
    ap_african_american_studies: ['apaas', 'aas'],
    ap_art_design: ['ap art', 'ap design'],
    ap_art_history: ['ap art hist'],
    ap_music_theory: ['ap music'],
    ap_psychology: ['ap psych'],
    ap_biology: ['ap bio'],
    ap_chemistry: ['ap chem'],
    ap_french: ['ap french'],
    ap_spanish_lang: ['ap spanish'],
    ap_spanish_lit: ['ap span lit'],
    ap_seminar: ['ap sem'],
    ap_research: ['ap res'],
  };

  function getAliasString(courseId) {
    return (COURSE_ALIASES[courseId] || []).join(' ');
  }
  const COURSE_GROUPS = {
    'IB Language & Literature': c =>
      c.id.startsWith('lang_a_') || c.id.startsWith('english_a_') ||
      c.id.startsWith('french_a_') || c.id.startsWith('spanish_a_') ||
      c.id === 'lit_performance_sl',
    'IB Language Acquisition': c =>
      c.id.startsWith('lang_b_') || c.id.startsWith('lang_ab_') ||
      c.id.startsWith('english_b_') || c.id.startsWith('english_ab_') ||
      c.id.startsWith('french_b_') || c.id.startsWith('french_ab_') ||
      c.id.startsWith('spanish_b_') || c.id.startsWith('spanish_ab_') ||
      c.id.startsWith('latin_') || c.id.startsWith('classical_greek_'),
    'IB Individuals & Societies': c => c.group === 'individuals',
    'IB Sciences': c => c.group === 'sciences',
    'IB Mathematics': c => c.group === 'mathematics',
    'IB Interdisciplinary': c => c.group === 'interdisciplinary',
    'AP Exams': c => c.group === 'ap',
  };

  function getCourseGroupLabel(course) {
    for (const [label, fn] of Object.entries(COURSE_GROUPS)) {
      if (fn(course)) return label;
    }
    return 'Other';
  }

  function buildCourseDropdown() {
    const input = document.getElementById('course-search-input');
    const listEl = document.getElementById('dropdown-list');
    const wrapper = document.getElementById('searchable-dropdown');

    function renderDropdownList(query) {
      listEl.innerHTML = '';
      const q = (query || '').toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);
      const excludedIds = getExcludedIds(selectedCourseIds);

      // Build grouped list
      for (const [groupLabel, filterFn] of Object.entries(COURSE_GROUPS)) {
        let courses = COURSES.filter(filterFn);

        // Filter by search query — match all words against name, group label, category, level, and aliases
        if (words.length > 0) {
          courses = courses.filter(c => {
            const haystack = [
              c.name,
              groupLabel,
              c.category || '',
              c.level || '',
              c.group,
              getAliasString(c.id)
            ].join(' ').toLowerCase();
            return words.every(w => haystack.includes(w));
          });
        }

        // Exclude already selected and mutually exclusive courses
        courses = courses.filter(c => !selectedCourseIds.includes(c.id) && !excludedIds.has(c.id));

        if (courses.length === 0) continue;

        const header = document.createElement('div');
        header.className = 'dropdown-group-header';
        header.textContent = groupLabel;
        listEl.appendChild(header);

        courses.forEach(c => {
          const item = document.createElement('div');
          item.className = 'dropdown-item';
          item.dataset.id = c.id;
          const color = SUBJECT_GROUPS[c.group]?.color || '#888';
          const dotClass = c.group === 'ap' ? 'dropdown-dot dot-ap' : 'dropdown-dot';
          item.innerHTML = `<span class="${dotClass}" style="background:${sanitize(color)}"></span>${sanitize(c.name)}`;
          item.addEventListener('click', () => {
            addCourseById(c.id);
            input.value = '';
            listEl.classList.remove('visible');
          });
          listEl.appendChild(item);
        });
      }

      if (listEl.children.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'dropdown-empty';
        empty.textContent = 'No matching subjects found';
        listEl.appendChild(empty);
      }
    }

    input.addEventListener('focus', () => {
      renderDropdownList(input.value);
      listEl.classList.add('visible');
    });

    input.addEventListener('input', () => {
      renderDropdownList(input.value);
      listEl.classList.add('visible');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        listEl.classList.remove('visible');
      }
    });
  }

  function addCourseById(id) {
    if (!id || selectedCourseIds.includes(id)) return;
    selectedCourseIds.push(id);
    saveCourses();
    renderSelectedCourses();
  }

  function removeCourse(id) {
    selectedCourseIds = selectedCourseIds.filter(c => c !== id);
    saveCourses();
    renderSelectedCourses();
    // Hide personal result if courses change
    document.getElementById('personal-result').style.display = 'none';
  }

  function renderSelectedCourses() {
    const container = document.getElementById('selected-courses');
    container.innerHTML = '';

    selectedCourseIds.forEach(id => {
      const course = getCourse(id);
      if (!course) return;
      const color = SUBJECT_GROUPS[course.group]?.color || '#888';
      const tag = document.createElement('span');
      tag.className = 'course-tag';
      tag.style.borderColor = color;
      tag.style.color = color;
      tag.innerHTML = `${sanitize(course.name)} <button class="remove-course" title="Remove">&times;</button>`;
      tag.querySelector('.remove-course').addEventListener('click', () => removeCourse(id));
      container.appendChild(tag);
    });

    document.getElementById('generate-btn').disabled = selectedCourseIds.length === 0;
  }

  function saveCourses() {
    setCookie(STORAGE_KEY, JSON.stringify(selectedCourseIds), 365);
  }

  function loadSavedCourses() {
    try {
      // Try cookie first, fall back to localStorage for migration
      let saved = getCookie(STORAGE_KEY);
      if (!saved) {
        saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCookie(STORAGE_KEY, saved, 365);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      if (saved) {
        selectedCourseIds = JSON.parse(saved);
        renderSelectedCourses();
      }
    } catch (e) {
      selectedCourseIds = [];
    }
  }

  // ===== Conflict Detection =====
  function detectConflicts(myExams) {
    const conflicts = [];
    // Group exams by date + session
    const bySlot = {};
    myExams.forEach(exam => {
      const key = `${exam.date}|${exam.session}`;
      if (!bySlot[key]) bySlot[key] = [];
      bySlot[key].push(exam);
    });

    // Same-slot conflicts (same date + same session)
    // Exams from the same course (sharing a courseId) in the same slot are normal dual-paper sessions, not conflicts
    for (const [key, exams] of Object.entries(bySlot)) {
      if (exams.length > 1) {
        // Group exams by their courseIds to find actual cross-subject conflicts
        const uniqueCourses = new Set();
        exams.forEach(e => e.courseIds.forEach(cid => uniqueCourses.add(cid)));

        // Check if all exams belong to the same single course
        const allSameCourse = exams.every(e =>
          e.courseIds.length === 1 && e.courseIds[0] === exams[0].courseIds[0]
        );

        if (!allSameCourse && uniqueCourses.size > 1) {
          const [date, session] = key.split('|');
          conflicts.push({
            type: 'same-session',
            date,
            session,
            exams: exams.map(e => e.name),
            severity: 'high'
          });
        }
      }
    }

    // Same-day heavy load (3+ exams in one day)
    const byDate = {};
    myExams.forEach(exam => {
      if (!byDate[exam.date]) byDate[exam.date] = [];
      byDate[exam.date].push(exam);
    });
    for (const [date, exams] of Object.entries(byDate)) {
      if (exams.length >= 3) {
        conflicts.push({
          type: 'heavy-day',
          date,
          session: null,
          exams: exams.map(e => e.name),
          severity: 'medium'
        });
      }
    }

    // Back-to-back days with high total duration
    const sortedDates = Object.keys(byDate).sort();
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const d1 = sortedDates[i];
      const d2 = sortedDates[i + 1];
      const date1 = new Date(d1 + 'T00:00:00');
      const date2 = new Date(d2 + 'T00:00:00');
      const diffDays = (date2 - date1) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        const totalMins = [...byDate[d1], ...byDate[d2]].reduce((s, e) => s + e.duration, 0);
        if (totalMins >= 360) { // 6+ hours across consecutive days
          conflicts.push({
            type: 'consecutive-heavy',
            date: d1,
            session: null,
            exams: [...byDate[d1], ...byDate[d2]].map(e => e.name),
            severity: 'low'
          });
        }
      }
    }

    return conflicts;
  }

  function getConflictDates(conflicts) {
    const dates = new Set();
    conflicts.forEach(c => {
      if (c.type === 'same-session' || c.type === 'heavy-day') {
        dates.add(c.date);
      }
    });
    return dates;
  }

  function renderConflictBanner(conflicts) {
    const banner = document.getElementById('conflict-banner');
    if (conflicts.length === 0) {
      banner.style.display = 'none';
      return;
    }

    const highConflicts = conflicts.filter(c => c.severity === 'high');
    const medConflicts = conflicts.filter(c => c.severity === 'medium');
    const lowConflicts = conflicts.filter(c => c.severity === 'low');

    let html = '<h4>⚠ Schedule Conflicts Detected</h4><ul>';

    highConflicts.forEach(c => {
      const dateObj = new Date(c.date + 'T00:00:00');
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      html += `<li><strong>Time conflict</strong> on ${label} (${c.session}): ${c.exams.map(e => sanitize(e)).join(', ')}</li>`;
    });

    medConflicts.forEach(c => {
      const dateObj = new Date(c.date + 'T00:00:00');
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      html += `<li><strong>Heavy day</strong> on ${label}: ${c.exams.length} exams scheduled</li>`;
    });

    lowConflicts.forEach(c => {
      const dateObj = new Date(c.date + 'T00:00:00');
      const d2 = new Date(new Date(c.date + 'T00:00:00').getTime() + 86400000);
      const label1 = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const label2 = d2.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      html += `<li><strong>Heavy stretch</strong> ${label1} – ${label2}: ${c.exams.length} exams, high total duration</li>`;
    });

    html += '</ul>';
    banner.innerHTML = html;
    banner.style.display = 'block';
  }

  // ===== Personal Calendar =====
  window.generatePersonalCalendar = function () {
    if (selectedCourseIds.length === 0) return;

    const myExams = getExamsForCourses(selectedCourseIds);
    myExams.sort((a, b) => a.date.localeCompare(b.date) || (a.session === 'morning' ? -1 : 1));

    // Detect conflicts
    const conflicts = detectConflicts(myExams);
    const conflictDates = getConflictDates(conflicts);

    // Build calendar with conflict info
    buildCalendar('personal-calendar-grid', myExams, undefined, conflictDates);

    // Show conflict banner
    renderConflictBanner(conflicts);

    // Build stats
    buildStats(myExams);

    // Build exam list with conflict highlights
    buildExamList(myExams, conflicts);

    // Show result
    document.getElementById('personal-result').style.display = 'block';

    // Scroll to result
    const scrollTarget = conflicts.length > 0 ? document.getElementById('conflict-banner') : document.getElementById('stats-panel');
    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function buildStats(myExams) {
    const panel = document.getElementById('stats-panel');
    panel.innerHTML = '';

    const totalExams = myExams.length;
    const totalMinutes = myExams.reduce((sum, e) => sum + e.duration, 0);

    // Time per subject (group by course)
    const perSubject = {};
    myExams.forEach(exam => {
      const relevantCourses = exam.courseIds.filter(id => selectedCourseIds.includes(id));
      relevantCourses.forEach(cid => {
        const course = getCourse(cid);
        if (!course) return;
        if (!perSubject[cid]) {
          perSubject[cid] = { course, totalMinutes: 0, examCount: 0, firstExamDate: exam.date };
        }
        perSubject[cid].totalMinutes += exam.duration;
        perSubject[cid].examCount++;
        if (exam.date < perSubject[cid].firstExamDate) {
          perSubject[cid].firstExamDate = exam.date;
        }
      });
    });

    // Card 1: Total exams
    panel.innerHTML += `
      <div class="stat-card">
        <div class="stat-label">Total Exams</div>
        <div class="stat-value">${totalExams}</div>
        <div class="stat-detail">across ${Object.keys(perSubject).length} subject${Object.keys(perSubject).length !== 1 ? 's' : ''}</div>
      </div>
    `;

    // Card 2: Total exam time
    panel.innerHTML += `
      <div class="stat-card">
        <div class="stat-label">Total Exam Time</div>
        <div class="stat-value">${formatDuration(totalMinutes)}</div>
        <div class="stat-detail">${Math.round(totalMinutes / 60 * 10) / 10} hours total</div>
      </div>
    `;

    // Card 3: First exam countdown
    const now = new Date();
    const firstDate = myExams[0] ? new Date(myExams[0].date + 'T00:00:00') : null;
    let countdownText = '-';
    if (firstDate) {
      const diffMs = firstDate - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      countdownText = diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''}` : (diffDays === 0 ? 'Today' : 'Passed');
    }
    panel.innerHTML += `
      <div class="stat-card">
        <div class="stat-label">Until First Exam</div>
        <div class="stat-value">${countdownText}</div>
        <div class="stat-detail">${firstDate ? firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</div>
      </div>
    `;

    // Card 4: Time per subject breakdown
    let breakdownHtml = '<div class="stat-breakdown">';
    for (const [cid, data] of Object.entries(perSubject)) {
      const color = SUBJECT_GROUPS[data.course.group]?.color || '#888';
      const sbClass = data.course.group === 'ap' ? 'sb-dot dot-ap' : 'sb-dot';
      breakdownHtml += `
        <div class="stat-breakdown-item">
          <span class="${sbClass}" style="background:${sanitize(color)}"></span>
          <span class="sb-name">${sanitize(data.course.name)}</span>
          <span class="sb-val">${data.examCount} exam${data.examCount !== 1 ? 's' : ''} · ${formatDuration(data.totalMinutes)}</span>
        </div>`;
    }
    breakdownHtml += '</div>';

    panel.innerHTML += `
      <div class="stat-card" style="grid-column: 1 / -1;">
        <div class="stat-label">Breakdown by Subject</div>
        ${breakdownHtml}
      </div>
    `;

    // Card 5: Study time remaining per subject
    let studyHtml = '<div class="stat-breakdown">';
    for (const [cid, data] of Object.entries(perSubject)) {
      const color = SUBJECT_GROUPS[data.course.group]?.color || '#888';
      const examDate = new Date(data.firstExamDate + 'T00:00:00');
      const daysUntil = Math.max(0, Math.ceil((examDate - now) / (1000 * 60 * 60 * 24)));
      const sbClass2 = data.course.group === 'ap' ? 'sb-dot dot-ap' : 'sb-dot';
      studyHtml += `
        <div class="stat-breakdown-item">
          <span class="${sbClass2}" style="background:${sanitize(color)}"></span>
          <span class="sb-name">${sanitize(data.course.name)}</span>
          <span class="sb-val">${daysUntil} day${daysUntil !== 1 ? 's' : ''} until first paper</span>
        </div>`;
    }
    studyHtml += '</div>';

    panel.innerHTML += `
      <div class="stat-card" style="grid-column: 1 / -1;">
        <div class="stat-label">Study Time Remaining</div>
        ${studyHtml}
      </div>
    `;
  }

  function buildExamList(myExams, conflicts) {
    const container = document.getElementById('personal-exam-list');
    container.innerHTML = '';

    // Build a set of conflict slots for quick lookup
    const conflictSlots = new Set();
    if (conflicts) {
      conflicts.filter(c => c.type === 'same-session').forEach(c => {
        conflictSlots.add(`${c.date}|${c.session}`);
      });
    }

    const byDate = {};
    myExams.forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });

    for (const [date, exams] of Object.entries(byDate)) {
      const dateObj = new Date(date + 'T00:00:00');
      const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

      const group = document.createElement('div');
      group.className = 'exam-list-day';
      group.innerHTML = `<div class="exam-list-date">${dateLabel}</div>`;

      exams.sort((a, b) => (a.session === 'morning' ? -1 : 1));
      exams.forEach(exam => {
        const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
        const isConflict = conflictSlots.has(`${exam.date}|${exam.session}`);
        const elDotClass = exam.group === 'ap' ? 'el-dot dot-ap' : 'el-dot';
        const item = document.createElement('div');
        item.className = 'exam-list-item' + (isConflict ? ' conflict-item' : '');
        item.innerHTML = `
          <span class="${elDotClass}" style="background:${sanitize(color)}"></span>
          <span class="el-session">${exam.session === 'morning' ? 'AM' : 'PM'}</span>
          <span class="el-name">${sanitize(exam.name)}${isConflict ? ' <span style="color:#ff6b6b;font-size:0.75rem;">⚠ conflict</span>' : ''}</span>
          <span class="el-dur">${formatDuration(exam.duration)}</span>
        `;
        group.appendChild(item);
      });

      container.appendChild(group);
    }
  }

  // ===== Exports =====

  // SVG Export
  window.exportSVG = function () {
    const myExams = getExamsForCourses(selectedCourseIds);
    myExams.sort((a, b) => a.date.localeCompare(b.date) || (a.session === 'morning' ? -1 : 1));

    const padding = 40;
    const dayWidth = 160;
    const dayHeight = 28;
    const headerHeight = 50;
    const titleHeight = 60;

    // Group by date
    const byDate = {};
    myExams.forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });

    const dates = Object.keys(byDate).sort();
    let maxExamsPerDay = 0;
    dates.forEach(d => { if (byDate[d].length > maxExamsPerDay) maxExamsPerDay = byDate[d].length; });

    const svgWidth = padding * 2 + dayWidth + 500;
    const svgHeight = titleHeight + headerHeight + dates.length * (dayHeight * (maxExamsPerDay + 1) + 20) + padding * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
    svg += `<rect width="100%" height="100%" fill="#000"/>`;
    svg += `<text x="${svgWidth / 2}" y="${padding + 24}" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="20" font-weight="700" fill="#fff">May 2026 — My Exam Schedule</text>`;

    let y = titleHeight + padding;
    dates.forEach(dateStr => {
      const dateObj = new Date(dateStr + 'T00:00:00');
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      svg += `<text x="${padding}" y="${y + 18}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="13" font-weight="600" fill="#999">${escapeXml(label)}</text>`;
      y += 28;

      byDate[dateStr].forEach(exam => {
        const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
        const isAP = exam.group === 'ap';
        if (isAP) {
          svg += `<polygon points="${padding + 8},${y + 4} ${padding + 4},${y + 14} ${padding + 12},${y + 14}" fill="${color}"/>`;
        } else {
          svg += `<circle cx="${padding + 8}" cy="${y + 10}" r="4" fill="${color}"/>`;
        }
        svg += `<text x="${padding + 20}" y="${y + 14}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="12" fill="#ccc">${escapeXml(exam.name)}</text>`;
        svg += `<text x="${svgWidth - padding}" y="${y + 14}" text-anchor="end" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="11" fill="#666">${exam.session === 'morning' ? 'AM' : 'PM'} · ${formatDuration(exam.duration)}</text>`;
        y += dayHeight;
      });
      y += 12;
    });

    svg += `</svg>`;

    downloadFile('exam-schedule.svg', svg, 'image/svg+xml');
  };

  // ICS Export (Google Calendar & Outlook)
  window.exportICS = function (type) {
    const myExams = getExamsForCourses(selectedCourseIds);
    myExams.sort((a, b) => a.date.localeCompare(b.date));

    if (type === 'google') {
      // Open Google Calendar event creation for each exam
      // For multiple exams, open the first and download ICS as backup
      myExams.forEach(exam => {
        const startDate = new Date(exam.date + (exam.session === 'morning' ? 'T09:00:00' : 'T14:00:00'));
        const endDate = new Date(startDate.getTime() + exam.duration * 60000);
        const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: exam.name,
          dates: fmt(startDate) + '/' + fmt(endDate),
          details: 'Exam — ' + exam.name + ' (' + formatDuration(exam.duration) + ')'
        });
        window.open('https://calendar.google.com/calendar/render?' + params.toString(), '_blank');
      });
      return;
    }

    if (type === 'outlook') {
      // Build ICS and open Outlook web import
      const ics = buildICS(myExams);
      const blob = new Blob([ics], { type: 'text/calendar' });
      const dataUrl = URL.createObjectURL(blob);

      // Download the ICS first so the user has it
      downloadFile('exams-outlook.ics', ics, 'text/calendar');

      // Open Outlook calendar — the user can import the downloaded file
      window.open('https://outlook.live.com/calendar/0/addevent', '_blank');
      return;
    }
  };

  function buildICS(myExams) {
    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Examiner//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';

    myExams.forEach(exam => {
      const dateClean = exam.date.replace(/-/g, '');
      const startHour = exam.session === 'morning' ? '090000' : '140000';
      const startDate = new Date(exam.date + (exam.session === 'morning' ? 'T09:00:00' : 'T14:00:00'));
      const endDate = new Date(startDate.getTime() + exam.duration * 60000);
      const endHour = String(endDate.getHours()).padStart(2, '0') + String(endDate.getMinutes()).padStart(2, '0') + '00';

      const uid = `exam-${dateClean}-${startHour}-${hashCode(exam.name)}@examiner`;

      ics += 'BEGIN:VEVENT\r\n';
      ics += `DTSTART:${dateClean}T${startHour}\r\n`;
      ics += `DTEND:${dateClean}T${endHour}\r\n`;
      ics += `SUMMARY:${icsEscape(exam.name)}\r\n`;
      ics += `DESCRIPTION:${icsEscape('Exam — ' + exam.name + ' (' + formatDuration(exam.duration) + ')')}\r\n`;
      ics += `UID:${uid}\r\n`;
      ics += 'END:VEVENT\r\n';
    });

    ics += 'END:VCALENDAR\r\n';
    return ics;
  }

  // CSV Export
  window.exportCSV = function () {
    const myExams = getExamsForCourses(selectedCourseIds);
    myExams.sort((a, b) => a.date.localeCompare(b.date) || (a.session === 'morning' ? -1 : 1));

    let csv = 'Date,Day,Session,Subject,Duration (minutes),Duration\n';
    myExams.forEach(exam => {
      const dateObj = new Date(exam.date + 'T00:00:00');
      const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      csv += `"${dateFormatted}","${day}","${exam.session}","${exam.name.replace(/"/g, '""')}",${exam.duration},"${formatDuration(exam.duration)}"\n`;
    });

    downloadFile('exam-schedule.csv', csv, 'text/csv');
  };

  // Share Link
  window.copyShareLink = function () {
    const params = new URLSearchParams();
    params.set('courses', selectedCourseIds.join(','));
    const url = window.location.origin + window.location.pathname + '?' + params.toString();
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('btn-copy-link');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {
      // Clipboard API may be unavailable
      prompt('Copy this link:', url);
    });
  };

  // ===== Study Planner =====

  function initStudyView() {
    const noCourses = document.getElementById('study-no-courses');
    const config = document.getElementById('study-config');
    const result = document.getElementById('study-result');

    if (selectedCourseIds.length === 0) {
      noCourses.style.display = 'block';
      config.style.display = 'none';
      result.style.display = 'none';
      return;
    }

    noCourses.style.display = 'none';
    config.style.display = 'block';

    let ranks = null;
    try {
      const saved = getCookie(STUDY_RANK_KEY);
      if (saved) ranks = JSON.parse(saved);
    } catch (e) { ranks = null; }

    // Validate saved ranks match current courses
    if (!ranks || !selectedCourseIds.every(id => ranks.includes(id)) || !ranks.every(id => selectedCourseIds.includes(id))) {
      ranks = [...selectedCourseIds];
    }

    const savedHours = getCookie(STUDY_HOURS_KEY);
    if (savedHours) document.getElementById('daily-hours-input').value = savedHours;

    buildRankingList(ranks);
  }

  function buildRankingList(ranks) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';

    ranks.forEach((courseId, i) => {
      const course = getCourse(courseId);
      if (!course) return;
      const color = SUBJECT_GROUPS[course.group]?.color || '#888';
      const dotClass = course.group === 'ap' ? 'rank-dot dot-ap' : 'rank-dot';

      const item = document.createElement('div');
      item.className = 'rank-item';
      item.dataset.id = courseId;

      const num = document.createElement('span');
      num.className = 'rank-number';
      num.textContent = i + 1;

      const arrows = document.createElement('span');
      arrows.className = 'rank-arrows';

      const upBtn = document.createElement('button');
      upBtn.className = 'rank-arrow';
      upBtn.textContent = '\u25B2';
      upBtn.title = 'Move up (harder)';
      upBtn.disabled = i === 0;
      upBtn.addEventListener('click', () => moveRankItem(courseId, -1));

      const downBtn = document.createElement('button');
      downBtn.className = 'rank-arrow';
      downBtn.textContent = '\u25BC';
      downBtn.title = 'Move down (easier)';
      downBtn.disabled = i === ranks.length - 1;
      downBtn.addEventListener('click', () => moveRankItem(courseId, 1));

      arrows.appendChild(upBtn);
      arrows.appendChild(downBtn);

      const dot = document.createElement('span');
      dot.className = dotClass;
      dot.style.background = color;

      const name = document.createElement('span');
      name.className = 'rank-name';
      name.textContent = course.name;

      const diff = document.createElement('span');
      diff.className = 'rank-difficulty';
      diff.textContent = getDiffLabel(i, ranks.length);

      item.appendChild(num);
      item.appendChild(arrows);
      item.appendChild(dot);
      item.appendChild(name);
      item.appendChild(diff);
      list.appendChild(item);
    });
  }

  function getDiffLabel(index, total) {
    if (total <= 1) return '';
    const r = index / (total - 1);
    if (r <= 0.2) return 'Hardest';
    if (r <= 0.4) return 'Hard';
    if (r <= 0.6) return 'Medium';
    if (r <= 0.8) return 'Easier';
    return 'Easiest';
  }

  function moveRankItem(courseId, direction) {
    const items = Array.from(document.querySelectorAll('#ranking-list .rank-item'));
    const ranks = items.map(el => el.dataset.id);
    const idx = ranks.indexOf(courseId);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= ranks.length) return;
    [ranks[idx], ranks[newIdx]] = [ranks[newIdx], ranks[idx]];
    setCookie(STUDY_RANK_KEY, JSON.stringify(ranks), 365);
    buildRankingList(ranks);
  }

  function getCurrentRanks() {
    const items = document.querySelectorAll('#ranking-list .rank-item');
    return Array.from(items).map(el => el.dataset.id);
  }

  function generateStudyPlan() {
    const ranks = getCurrentRanks();
    if (ranks.length === 0) return;

    const dailyHours = parseFloat(document.getElementById('daily-hours-input').value) || 6;
    setCookie(STUDY_HOURS_KEY, String(dailyHours), 365);
    setCookie(STUDY_RANK_KEY, JSON.stringify(ranks), 365);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const N = ranks.length;
    const courseData = ranks.map((courseId, rankIndex) => {
      const course = getCourse(courseId);
      const exams = EXAMS.filter(e => e.courseIds.includes(courseId));
      const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
      const firstExam = sorted[0];
      const examDate = firstExam ? new Date(firstExam.date + 'T00:00:00') : new Date('2026-05-20T00:00:00');
      const daysUntil = Math.max(1, Math.ceil((examDate - today) / 86400000));
      const diffWeight = N - rankIndex; // index 0 = hardest = highest weight
      return { courseId, course, examDate, daysUntil, rankIndex, diffWeight, totalHours: 0 };
    });

    // Load custom hour overrides
    let customHours = null;
    try {
      const saved = getCookie(STUDY_CUSTOM_KEY);
      if (saved) customHours = JSON.parse(saved);
    } catch (e) { customHours = null; }

    // Compute total hours per subject
    const maxDays = Math.max(...courseData.map(c => c.daysUntil));

    if (customHours && Object.keys(customHours).length > 0) {
      courseData.forEach(c => {
        c.totalHours = customHours[c.courseId] !== undefined ? customHours[c.courseId] : 0;
      });
    } else {
      // Score = diffWeight * sqrt(daysUntil) — harder subjects + more prep time = more hours
      courseData.forEach(c => { c.score = c.diffWeight * Math.sqrt(c.daysUntil); });
      const totalScore = courseData.reduce((s, c) => s + c.score, 0);
      const totalAvail = maxDays * dailyHours;
      courseData.forEach(c => {
        c.totalHours = Math.round((c.score / totalScore) * totalAvail * 2) / 2;
      });
    }

    // Generate daily schedule
    const schedule = [];
    for (let d = 0; d < maxDays; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = formatDate(date);

      const active = courseData.filter(c => Math.ceil((c.examDate - date) / 86400000) > 0);
      if (active.length === 0) continue;

      // Weight = totalHours / sqrt(daysLeft) — subjects with more total hours and closer exams get priority
      const weights = active.map(c => {
        const daysLeft = Math.max(1, Math.ceil((c.examDate - date) / 86400000));
        return { courseId: c.courseId, weight: Math.max(0.01, c.totalHours) / Math.sqrt(daysLeft) };
      });

      const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
      if (totalWeight === 0) continue;

      const allocations = weights.map(w => ({
        courseId: w.courseId,
        hours: Math.round((w.weight / totalWeight) * dailyHours * 4) / 4
      })).filter(a => a.hours >= 0.25);

      // Clamp total to daily limit
      const allocTotal = allocations.reduce((s, a) => s + a.hours, 0);
      if (allocTotal > dailyHours + 0.25) {
        const scale = dailyHours / allocTotal;
        allocations.forEach(a => {
          a.hours = Math.max(0.25, Math.round(a.hours * scale * 4) / 4);
        });
      }

      if (allocations.length > 0) schedule.push({ date: dateStr, allocations });
    }

    studyPlanData = { courseData, schedule, dailyHours };
    renderStudyPlan();
  }

  function renderStudyPlan() {
    if (!studyPlanData) return;
    const { courseData, schedule, dailyHours } = studyPlanData;

    const resultEl = document.getElementById('study-result');
    resultEl.style.display = 'block';

    // --- Summary: hours per subject with editable inputs ---
    const summaryEl = document.getElementById('study-summary');
    let sHtml = '<h3>Study Hour Allocation</h3>';
    sHtml += '<p class="selector-hint">Adjust total hours per subject, then regenerate.</p>';
    sHtml += '<div class="study-alloc-list">';

    courseData.forEach(c => {
      const color = SUBJECT_GROUPS[c.course.group]?.color || '#888';
      const dotClass = c.course.group === 'ap' ? 'sa-dot dot-ap' : 'sa-dot';
      sHtml += '<div class="study-alloc-row">';
      sHtml += '<span class="' + dotClass + '" style="background:' + sanitize(color) + '"></span>';
      sHtml += '<span class="sa-name">' + sanitize(c.course.name) + '</span>';
      sHtml += '<span class="sa-meta">' + c.daysUntil + 'd left</span>';
      sHtml += '<input type="number" class="sa-input" data-course="' + sanitize(c.courseId) + '" value="' + c.totalHours + '" min="0" max="999" step="0.5">';
      sHtml += '<span class="sa-unit">hrs</span>';
      sHtml += '</div>';
    });

    sHtml += '</div>';
    sHtml += '<button class="btn btn-secondary btn-sm" id="regenerate-study-btn">Regenerate with Custom Hours</button> ';
    sHtml += '<button class="btn btn-secondary btn-sm" id="reset-study-btn">Reset to Auto</button>';
    summaryEl.innerHTML = sHtml;

    document.getElementById('regenerate-study-btn').addEventListener('click', () => {
      const inputs = summaryEl.querySelectorAll('.sa-input');
      const custom = {};
      inputs.forEach(inp => { custom[inp.dataset.course] = parseFloat(inp.value) || 0; });
      setCookie(STUDY_CUSTOM_KEY, JSON.stringify(custom), 365);
      generateStudyPlan();
    });

    document.getElementById('reset-study-btn').addEventListener('click', () => {
      deleteCookie(STUDY_CUSTOM_KEY);
      generateStudyPlan();
    });

    // --- Daily schedule grouped by week ---
    const scheduleEl = document.getElementById('study-schedule');
    let dHtml = '<h3>Daily Study Plan</h3>';

    // Group by week (Monday start)
    const weeks = {};
    schedule.forEach(day => {
      const d = new Date(day.date + 'T00:00:00');
      const dow = (d.getDay() + 6) % 7; // Mon=0
      const weekStart = new Date(d);
      weekStart.setDate(weekStart.getDate() - dow);
      const weekKey = formatDate(weekStart);
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(day);
    });

    for (const [weekStart, days] of Object.entries(weeks)) {
      const ws = new Date(weekStart + 'T00:00:00');
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      const weekLabel = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' \u2013 ' + we.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      dHtml += '<div class="study-week">';
      dHtml += '<div class="study-week-header">' + weekLabel + '</div>';

      days.forEach(day => {
        const dateObj = new Date(day.date + 'T00:00:00');
        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const totalDayHours = day.allocations.reduce((s, a) => s + a.hours, 0);

        dHtml += '<div class="study-day">';
        dHtml += '<div class="study-day-header"><span class="study-day-date">' + dayLabel + '</span><span class="study-day-total">' + totalDayHours + 'h</span></div>';

        day.allocations.forEach(a => {
          const course = getCourse(a.courseId);
          if (!course) return;
          const color = SUBJECT_GROUPS[course.group]?.color || '#888';
          const pct = Math.min(100, (a.hours / dailyHours) * 100);
          const dotClass = course.group === 'ap' ? 'sd-dot dot-ap' : 'sd-dot';

          dHtml += '<div class="study-subject-row">';
          dHtml += '<span class="' + dotClass + '" style="background:' + sanitize(color) + '"></span>';
          dHtml += '<span class="sd-name">' + sanitize(course.name) + '</span>';
          dHtml += '<span class="sd-hours">' + a.hours + 'h</span>';
          dHtml += '<div class="sd-bar-track"><div class="sd-bar" style="width:' + pct + '%;background:' + sanitize(color) + '"></div></div>';
          dHtml += '</div>';
        });

        dHtml += '</div>';
      });

      dHtml += '</div>';
    }

    scheduleEl.innerHTML = dHtml;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== Utilities =====

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function sanitize(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  function icsEscape(str) {
    return str.replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n');
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

})();
