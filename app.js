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
  const STUDY_MAXSUB_KEY = 'examiner_study_maxsub';
  const STUDY_SUBJECTS_KEY = 'examiner_study_subjects';
  const STUDY_NOEXAM_KEY = 'examiner_study_noexam';
  let studyPlanData = null;
  let studySubjectIds = [];

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
    document.getElementById('btn-copy-calendar').addEventListener('click', () => copyCalendarText());

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
        else if (hash === '#/guide') showView('guide');
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
    document.getElementById('go-study-btn').addEventListener('click', (e) => {
      e.preventDefault();
      showView('study');
    });

    // Guide back button
    const guideBack = document.querySelector('.guide-back a');
    if (guideBack) {
      guideBack.addEventListener('click', (e) => {
        e.preventDefault();
        showView('landing');
      });
    }

    // Landing how-to link
    const howtoLink = document.querySelector('.landing-howto-link');
    if (howtoLink) {
      howtoLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView('guide');
      });
    }
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

    // Show nav links when not on landing; hide landing permanently once user leaves
    const navLinks = document.getElementById('nav-links');
    const landingEl = document.getElementById('landing');
    if (viewId === 'landing') {
      navLinks.style.display = 'none';
      if (landingEl) landingEl.style.display = '';
    } else {
      navLinks.style.display = '';
      if (landingEl) landingEl.style.display = 'none';
    }

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

    const morningExams = dayExams.filter(e => e.session === 'morning');
    const afternoonExams = dayExams.filter(e => e.session === 'afternoon');

    let html = `<div class="tooltip-date">${dateLabel}</div>`;
    html += '<div class="tooltip-split">';

    // AM column (left)
    html += '<div class="tooltip-col">';
    html += '<div class="tooltip-session">AM</div>';
    if (morningExams.length > 0) {
      morningExams.forEach(exam => {
        const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
        const dotClass = exam.group === 'ap' ? 't-dot dot-ap' : 't-dot';
        html += `<div class="tooltip-exam">
          <span class="${dotClass}" style="background:${sanitize(color)}"></span>
          <span class="t-name">${sanitize(exam.name)}</span>
          <span class="t-dur">${formatDuration(exam.duration)}</span>
        </div>`;
      });
    } else {
      html += '<div class="tooltip-empty">No exams</div>';
    }
    html += '</div>';

    // PM column (right)
    html += '<div class="tooltip-col">';
    html += '<div class="tooltip-session">PM</div>';
    if (afternoonExams.length > 0) {
      afternoonExams.forEach(exam => {
        const color = SUBJECT_GROUPS[exam.group]?.color || '#888';
        const dotClass = exam.group === 'ap' ? 't-dot dot-ap' : 't-dot';
        html += `<div class="tooltip-exam">
          <span class="${dotClass}" style="background:${sanitize(color)}"></span>
          <span class="t-name">${sanitize(exam.name)}</span>
          <span class="t-dur">${formatDuration(exam.duration)}</span>
        </div>`;
      });
    } else {
      html += '<div class="tooltip-empty">No exams</div>';
    }
    html += '</div>';

    html += '</div>';

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
    // Exams from the same subject (sharing a courseId) in the same slot are normal multi-paper sessions, not conflicts
    for (const [key, exams] of Object.entries(bySlot)) {
      if (exams.length > 1) {
        // Two exams are a real conflict only if they share NO courseIds (truly different subjects)
        let hasRealConflict = false;
        for (let i = 0; i < exams.length && !hasRealConflict; i++) {
          for (let j = i + 1; j < exams.length && !hasRealConflict; j++) {
            const sharesAnyCourseId = exams[i].courseIds.some(cid => exams[j].courseIds.includes(cid));
            if (!sharesAnyCourseId) {
              hasRealConflict = true;
            }
          }
        }

        if (hasRealConflict) {
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

    return conflicts;
  }

  function getConflictDates(conflicts) {
    const dates = new Set();
    conflicts.forEach(c => {
      if (c.type === 'same-session') {
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

    // If there are actual time conflicts, offer email-to-counselor link
    if (highConflicts.length > 0) {
      const conflictLines = highConflicts.map(c => {
        const dateObj = new Date(c.date + 'T00:00:00');
        const label = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const session = c.session === 'morning' ? 'Morning' : 'Afternoon';
        return `• ${label} (${session} session): ${c.exams.join(', ')}`;
      });

      const body = [
        'Dear Counselor,',
        '',
        'I hope this email finds you well. I am writing to bring to your attention a scheduling conflict in my upcoming May 2026 examination timetable that I would appreciate your guidance on.',
        '',
        'After reviewing my exam schedule, I have identified the following overlap(s) where two or more of my subjects are scheduled in the same session:',
        '',
        ...conflictLines,
        '',
        'As these exams are set for the same time slot, I will not be able to sit for all of them as currently scheduled. I would be grateful if you could advise me on the process for requesting an alternative session or any other arrangements that may be available.',
        '',
        'Please let me know if you need any additional information from my end. I am happy to meet at your earliest convenience to discuss this further.',
        '',
        'Thank you for your time and support.',
        '',
        'Kind regards'
      ].join('\n');

      const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&body=' + encodeURIComponent(body);
      html += '<p class="conflict-email-prompt">If you haven\'t already resolved this, <a href="' + gmailUrl + '" target="_blank" rel="noopener">click here to email your counselor</a> about the conflict.</p>';
    }

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

  // Copy plaintext calendar
  window.copyCalendarText = function () {
    const myExams = getExamsForCourses(selectedCourseIds);
    myExams.sort((a, b) => a.date.localeCompare(b.date) || (a.session === 'morning' ? -1 : 1));

    let currentDate = '';
    let text = 'My Exam Calendar — Examiner\n';
    text += '='.repeat(34) + '\n\n';

    myExams.forEach(exam => {
      const dateObj = new Date(exam.date + 'T00:00:00');
      const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (exam.date !== currentDate) {
        currentDate = exam.date;
        text += `${day}, ${dateFormatted}\n`;
      }
      const session = exam.session === 'morning' ? 'AM' : 'PM';
      text += `  [${session}] ${exam.name} (${formatDuration(exam.duration)})\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-copy-calendar');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => {
      prompt('Copy your calendar:', text);
    });
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

  const TIERS = ['hard', 'medium', 'easy'];
  const TIER_LABELS = { hard: 'Hard', medium: 'Medium', easy: 'Easy' };

  function initStudyView() {
    const config = document.getElementById('study-config');
    const result = document.getElementById('study-result');

    // Load study subjects: independent list, seeded from selectedCourseIds if empty
    loadStudySubjects();

    config.style.display = 'block';
    buildStudySubjectDropdown();
    renderStudySubjects();

    if (studySubjectIds.length === 0) {
      document.getElementById('ranking-list').innerHTML = '';
      result.style.display = 'none';
      return;
    }

    // Load saved tiered ranks: { hard: [...ids], medium: [...ids], easy: [...ids] }
    let tieredRanks = null;
    try {
      const saved = getCookie(STUDY_RANK_KEY);
      if (saved) tieredRanks = JSON.parse(saved);
    } catch (e) { tieredRanks = null; }

    // Validate: must be object with exactly our study subjects across all tiers
    if (tieredRanks && typeof tieredRanks === 'object' && tieredRanks.hard) {
      const allSaved = [].concat(tieredRanks.hard || [], tieredRanks.medium || [], tieredRanks.easy || []);
      const valid = studySubjectIds.every(id => allSaved.includes(id)) &&
                    allSaved.every(id => studySubjectIds.includes(id)) &&
                    allSaved.length === studySubjectIds.length;
      if (!valid) tieredRanks = null;
    } else {
      tieredRanks = null;
    }

    if (!tieredRanks) {
      // Default: sort by group priority (math > sciences > rest), then distribute across tiers
      const GROUP_PRIORITY = { mathematics: 0, sciences: 1 };
      const ids = [...studySubjectIds].sort((a, b) => {
        const ca = getCourse(a), cb = getCourse(b);
        const pa = GROUP_PRIORITY[ca?.group] !== undefined ? GROUP_PRIORITY[ca.group] : 2;
        const pb = GROUP_PRIORITY[cb?.group] !== undefined ? GROUP_PRIORITY[cb.group] : 2;
        return pa - pb;
      });
      const third = Math.ceil(ids.length / 3);
      tieredRanks = {
        hard: ids.slice(0, third),
        medium: ids.slice(third, third * 2),
        easy: ids.slice(third * 2)
      };
    }

    const savedHours = getCookie(STUDY_HOURS_KEY);
    if (savedHours) document.getElementById('daily-hours-input').value = savedHours;

    const savedMax = getCookie(STUDY_MAXSUB_KEY);
    if (savedMax) document.getElementById('max-subjects-input').value = savedMax;

    const savedNoExam = getCookie(STUDY_NOEXAM_KEY);
    document.getElementById('no-exam-day-study').checked = savedNoExam !== '0';

    buildRankingList(tieredRanks);
  }

  function loadStudySubjects() {
    try {
      const saved = getCookie(STUDY_SUBJECTS_KEY);
      if (saved) {
        studySubjectIds = JSON.parse(saved).filter(id => getCourse(id));
        return;
      }
    } catch (e) {}
    // Seed from scheduler's selected courses on first use
    if (selectedCourseIds.length > 0) {
      studySubjectIds = [...selectedCourseIds];
      saveStudySubjects();
    } else {
      studySubjectIds = [];
    }
  }

  function saveStudySubjects() {
    setCookie(STUDY_SUBJECTS_KEY, JSON.stringify(studySubjectIds), 365);
  }

  function addStudySubject(id) {
    if (!id || studySubjectIds.includes(id)) return;
    studySubjectIds.push(id);
    saveStudySubjects();
    // Reset ranks since subject list changed
    deleteCookie(STUDY_RANK_KEY);
    deleteCookie(STUDY_CUSTOM_KEY);
    initStudyView();
  }

  function removeStudySubject(id) {
    studySubjectIds = studySubjectIds.filter(s => s !== id);
    saveStudySubjects();
    deleteCookie(STUDY_RANK_KEY);
    deleteCookie(STUDY_CUSTOM_KEY);
    initStudyView();
  }

  function renderStudySubjects() {
    const container = document.getElementById('study-selected-courses');
    container.innerHTML = '';
    studySubjectIds.forEach(id => {
      const course = getCourse(id);
      if (!course) return;
      const color = SUBJECT_GROUPS[course.group]?.color || '#888';
      const tag = document.createElement('span');
      tag.className = 'course-tag';
      tag.style.borderColor = color;
      tag.style.color = color;
      tag.innerHTML = sanitize(course.name) + ' <button class="remove-course" title="Remove">&times;</button>';
      tag.querySelector('.remove-course').addEventListener('click', () => removeStudySubject(id));
      container.appendChild(tag);
    });
  }

  function buildStudySubjectDropdown() {
    const input = document.getElementById('study-course-search');
    const listEl = document.getElementById('study-dropdown-list');
    const wrapper = document.getElementById('study-searchable-dropdown');

    // Remove old listeners by replacing node
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('input', () => {
      const q = newInput.value.trim().toLowerCase();
      if (q.length === 0) { listEl.classList.remove('visible'); listEl.innerHTML = ''; return; }
      const available = COURSES.filter(c => !studySubjectIds.includes(c.id));
      const words = q.split(/\s+/).filter(Boolean);
      const matches = available.filter(c => {
        const haystack = [c.name, c.group, c.category || '', c.level || '', getAliasString(c.id)].join(' ').toLowerCase();
        return words.every(w => haystack.includes(w));
      }).slice(0, 15);
      listEl.innerHTML = '';
      if (matches.length === 0) {
        listEl.classList.remove('visible');
        return;
      }
      matches.forEach(c => {
        const color = SUBJECT_GROUPS[c.group]?.color || '#888';
        const opt = document.createElement('div');
        opt.className = 'dropdown-option';
        const dotClass = c.group === 'ap' ? 'dropdown-dot dot-ap' : 'dropdown-dot';
        opt.innerHTML = '<span class="' + dotClass + '" style="background:' + sanitize(color) + '"></span>' + sanitize(c.name);
        opt.addEventListener('click', () => {
          addStudySubject(c.id);
          newInput.value = '';
          listEl.classList.remove('visible');
        });
        listEl.appendChild(opt);
      });
      listEl.classList.add('visible');
    });

    newInput.addEventListener('focus', () => { if (newInput.value.trim()) newInput.dispatchEvent(new Event('input')); });
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) listEl.classList.remove('visible');
    });
  }

  function buildRankingList(tieredRanks) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';

    TIERS.forEach(tier => {
      const ids = tieredRanks[tier] || [];
      const section = document.createElement('div');
      section.className = 'rank-tier';
      section.dataset.tier = tier;

      const header = document.createElement('div');
      header.className = 'rank-tier-header rank-tier-' + tier;
      header.textContent = TIER_LABELS[tier];
      section.appendChild(header);

      if (ids.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'rank-tier-empty';
        empty.textContent = 'No subjects';
        section.appendChild(empty);
      }

      ids.forEach((courseId, i) => {
        const course = getCourse(courseId);
        if (!course) return;
        const color = SUBJECT_GROUPS[course.group]?.color || '#888';
        const dotClass = course.group === 'ap' ? 'rank-dot dot-ap' : 'rank-dot';

        const item = document.createElement('div');
        item.className = 'rank-item';
        item.dataset.id = courseId;
        item.dataset.tier = tier;
        item.draggable = true;

        // Drag handle on the left
        const dragHandle = document.createElement('span');
        dragHandle.className = 'rank-drag material-symbols-rounded';
        dragHandle.textContent = 'drag_indicator';
        dragHandle.title = 'Drag to reorder';

        const num = document.createElement('span');
        num.className = 'rank-number';
        num.textContent = i + 1;

        const dot = document.createElement('span');
        dot.className = dotClass;
        dot.style.background = color;

        const name = document.createElement('span');
        name.className = 'rank-name';
        name.textContent = course.name;

        // Arrow buttons on the right, visible on hover
        const arrows = document.createElement('span');
        arrows.className = 'rank-arrows';

        const upBtn = document.createElement('button');
        upBtn.className = 'rank-arrow material-symbols-rounded';
        upBtn.textContent = 'arrow_upward';
        upBtn.title = i === 0 ? 'Move to tier above' : 'Move up';
        const isTopOfFirst = tier === 'hard' && i === 0;
        upBtn.disabled = isTopOfFirst;
        upBtn.addEventListener('click', () => moveRankItem(courseId, -1));

        const downBtn = document.createElement('button');
        downBtn.className = 'rank-arrow material-symbols-rounded';
        downBtn.textContent = 'arrow_downward';
        downBtn.title = i === ids.length - 1 ? 'Move to tier below' : 'Move down';
        const isBottomOfLast = tier === 'easy' && i === ids.length - 1;
        downBtn.disabled = isBottomOfLast;
        downBtn.addEventListener('click', () => moveRankItem(courseId, 1));

        arrows.appendChild(upBtn);
        arrows.appendChild(downBtn);

        item.appendChild(dragHandle);
        item.appendChild(num);
        item.appendChild(dot);
        item.appendChild(name);
        item.appendChild(arrows);
        section.appendChild(item);
      });

      list.appendChild(section);
    });

    // Set up drag-and-drop
    setupRankDragDrop();
  }

  function setupRankDragDrop() {
    let draggedEl = null;
    const list = document.getElementById('ranking-list');

    list.addEventListener('dragstart', e => {
      const item = e.target.closest('.rank-item');
      if (!item) return;
      draggedEl = item;
      item.classList.add('rank-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.id);
    });

    list.addEventListener('dragend', e => {
      if (draggedEl) draggedEl.classList.remove('rank-dragging');
      draggedEl = null;
      list.querySelectorAll('.rank-drop-above').forEach(el => el.classList.remove('rank-drop-above'));
      list.querySelectorAll('.rank-drop-below').forEach(el => el.classList.remove('rank-drop-below'));
    });

    list.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest('.rank-item');
      if (!target || target === draggedEl) return;
      // Clear all indicators
      list.querySelectorAll('.rank-drop-above,.rank-drop-below').forEach(el => {
        el.classList.remove('rank-drop-above', 'rank-drop-below');
      });
      const rect = target.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        target.classList.add('rank-drop-above');
      } else {
        target.classList.add('rank-drop-below');
      }
    });

    list.addEventListener('dragleave', e => {
      const target = e.target.closest('.rank-item');
      if (target) {
        target.classList.remove('rank-drop-above', 'rank-drop-below');
      }
    });

    list.addEventListener('drop', e => {
      e.preventDefault();
      const target = e.target.closest('.rank-item');
      if (!target || !draggedEl || target === draggedEl) return;
      const draggedId = draggedEl.dataset.id;
      const targetId = target.dataset.id;
      const targetTier = target.dataset.tier;

      const tieredRanks = getCurrentRanks();

      // Remove from source
      for (const tier of TIERS) {
        const idx = tieredRanks[tier].indexOf(draggedId);
        if (idx >= 0) { tieredRanks[tier].splice(idx, 1); break; }
      }

      // Insert at target position
      const rect = target.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const insertIdx = tieredRanks[targetTier].indexOf(targetId);
      if (e.clientY < mid) {
        tieredRanks[targetTier].splice(insertIdx, 0, draggedId);
      } else {
        tieredRanks[targetTier].splice(insertIdx + 1, 0, draggedId);
      }

      saveTieredRanks(tieredRanks);
      buildRankingList(tieredRanks);
    });
  }

  function moveRankItem(courseId, direction) {
    const tieredRanks = getCurrentRanks();
    // Find which tier and index
    let fromTier = null, fromIdx = -1;
    for (const tier of TIERS) {
      const idx = tieredRanks[tier].indexOf(courseId);
      if (idx >= 0) { fromTier = tier; fromIdx = idx; break; }
    }
    if (!fromTier) return;

    const tierArr = tieredRanks[fromTier];
    if (direction === -1) {
      if (fromIdx > 0) {
        // Move up within tier
        [tierArr[fromIdx], tierArr[fromIdx - 1]] = [tierArr[fromIdx - 1], tierArr[fromIdx]];
      } else {
        // At top of tier — promote to tier above (append to bottom)
        const tierIdx = TIERS.indexOf(fromTier);
        if (tierIdx <= 0) return;
        const aboveTier = TIERS[tierIdx - 1];
        tierArr.splice(fromIdx, 1);
        tieredRanks[aboveTier].push(courseId);
      }
    } else {
      if (fromIdx < tierArr.length - 1) {
        // Move down within tier
        [tierArr[fromIdx], tierArr[fromIdx + 1]] = [tierArr[fromIdx + 1], tierArr[fromIdx]];
      } else {
        // At bottom of tier — demote to tier below (prepend to top)
        const tierIdx = TIERS.indexOf(fromTier);
        if (tierIdx >= TIERS.length - 1) return;
        const belowTier = TIERS[tierIdx + 1];
        tierArr.splice(fromIdx, 1);
        tieredRanks[belowTier].unshift(courseId);
      }
    }

    saveTieredRanks(tieredRanks);
    buildRankingList(tieredRanks);
  }

  function getCurrentRanks() {
    const result = { hard: [], medium: [], easy: [] };
    TIERS.forEach(tier => {
      const items = document.querySelectorAll('.rank-item[data-tier="' + tier + '"]');
      items.forEach(el => result[tier].push(el.dataset.id));
    });
    return result;
  }

  function saveTieredRanks(tieredRanks) {
    setCookie(STUDY_RANK_KEY, JSON.stringify(tieredRanks), 365);
  }

  function generateStudyPlan() {
    const tieredRanks = getCurrentRanks();
    const allIds = [].concat(tieredRanks.hard, tieredRanks.medium, tieredRanks.easy);
    if (allIds.length === 0) return;

    const dailyHours = parseFloat(document.getElementById('daily-hours-input').value) || 6;
    const maxSubjects = parseInt(document.getElementById('max-subjects-input').value) || 5;
    const noExamDayStudy = document.getElementById('no-exam-day-study').checked;
    setCookie(STUDY_HOURS_KEY, String(dailyHours), 365);
    setCookie(STUDY_MAXSUB_KEY, String(maxSubjects), 365);
    setCookie(STUDY_NOEXAM_KEY, noExamDayStudy ? '1' : '0', 365);
    saveTieredRanks(tieredRanks);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build course data with tier info
    // Tier weights: hard items get more, medium moderate, easy minimal
    const TIER_WEIGHT = { hard: 3, medium: 1.5, easy: 0.3 };

    const courseData = allIds.map(courseId => {
      const course = getCourse(courseId);
      const exams = EXAMS.filter(e => e.courseIds.includes(courseId));
      const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
      const firstExam = sorted[0];
      const lastExam = sorted[sorted.length - 1];
      const examDate = firstExam ? new Date(firstExam.date + 'T00:00:00') : new Date('2026-05-20T00:00:00');
      const lastExamDate = lastExam ? new Date(lastExam.date + 'T00:00:00') : examDate;
      const daysUntil = Math.max(1, Math.ceil((examDate - today) / 86400000));
      const totalExamMins = exams.reduce((s, e) => s + e.duration, 0);
      const examDates = [...new Set(exams.map(e => e.date))];

      // Determine tier and within-tier rank
      let tier = 'easy', rankInTier = 0;
      for (const t of TIERS) {
        const idx = tieredRanks[t].indexOf(courseId);
        if (idx >= 0) { tier = t; rankInTier = idx; break; }
      }

      const tierCount = tieredRanks[tier].length;
      // Within-tier weight: top of tier = full tier weight, bottom = slightly less
      const withinWeight = tierCount <= 1 ? 1 : 1 - (rankInTier / tierCount) * 0.4;
      const diffWeight = TIER_WEIGHT[tier] * withinWeight;

      return {
        courseId, course, examDate, lastExamDate, daysUntil,
        tier, rankInTier, diffWeight, totalHours: 0,
        totalExamMins, examDates
      };
    });

    // Build exam date lookup
    const allExamDateMap = {};
    courseData.forEach(c => {
      c.examDates.forEach(d => {
        if (!allExamDateMap[d]) allExamDateMap[d] = [];
        allExamDateMap[d].push(c.courseId);
      });
    });

    // Load custom hour overrides
    let customHours = null;
    try {
      const saved = getCookie(STUDY_CUSTOM_KEY);
      if (saved) customHours = JSON.parse(saved);
    } catch (e) { customHours = null; }

    const maxDate = new Date(Math.max(...courseData.map(c => c.examDate.getTime())));
    const totalDays = Math.max(1, Math.ceil((maxDate - today) / 86400000));

    if (customHours && Object.keys(customHours).length > 0) {
      courseData.forEach(c => {
        c.totalHours = customHours[c.courseId] !== undefined ? customHours[c.courseId] : 0;
      });
    } else {
      // Tier-weighted allocation
      courseData.forEach(c => {
        const examWeight = Math.sqrt(c.totalExamMins / 60);
        c.score = c.diffWeight * examWeight * Math.log2(c.daysUntil + 1);
      });
      const totalScore = courseData.reduce((s, c) => s + c.score, 0);
      const totalAvail = totalDays * dailyHours;
      courseData.forEach(c => {
        c.totalHours = Math.round((c.score / totalScore) * totalAvail * 2) / 2;
      });
    }

    // ===== Iterative daily scheduler with tier priority =====
    const delivered = {};
    courseData.forEach(c => { delivered[c.courseId] = 0; });

    const schedule = [];
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = formatDate(date);

      // Active subjects: exams haven't started yet
      const active = courseData.filter(c => date < c.examDate);
      if (active.length === 0) continue;

      const examToday = allExamDateMap[dateStr] || [];

      // Skip entire day if toggle is on and there are exams today
      if (noExamDayStudy && examToday.length > 0) {
        const isExamDay = true;
        const examSubjects = examToday.map(id => {
          const c = COURSES.find(x => x.id === id);
          return c ? c.name : id;
        });
        schedule.push({ date, allocations: [], isExamDay, examSubjects });
        continue;
      }

      // Check if any hard/medium subjects have exams still upcoming
      const hasHardMediumExams = active.some(c => c.tier === 'hard' || c.tier === 'medium');

      // Compute priorities
      const priorities = active.map(c => {
        const daysLeft = Math.max(1, Math.ceil((c.examDate - date) / 86400000));
        const remaining = Math.max(0, c.totalHours - delivered[c.courseId]);
        if (remaining <= 0) return { courseId: c.courseId, priority: 0, tier: c.tier };

        // Easy subjects only studied if no hard/medium remain active
        if (c.tier === 'easy' && hasHardMediumExams) {
          return { courseId: c.courseId, priority: 0, tier: c.tier };
        }

        let priority = remaining / daysLeft;

        // Urgency
        if (daysLeft <= 1) priority *= 3.0;
        else if (daysLeft <= 3) priority *= 2.0;
        else if (daysLeft <= 7) priority *= 1.3;

        // Tier boost
        priority *= (1 + c.diffWeight * 0.1);

        // Exam day reduction
        if (examToday.includes(c.courseId)) {
          priority *= 0.15;
        }

        return { courseId: c.courseId, priority, remaining, daysLeft, tier: c.tier };
      }).filter(p => p.priority > 0);

      if (priorities.length === 0) continue;

      const totalPriority = priorities.reduce((s, p) => s + p.priority, 0);

      let allocations = priorities.map(p => ({
        courseId: p.courseId,
        hours: Math.round((p.priority / totalPriority) * dailyHours * 4) / 4,
        tier: p.tier
      }));

      // Drop tiny allocations
      allocations = allocations.filter(a => a.hours >= 0.25);

      // Cap at user-configured max subjects
      if (allocations.length > maxSubjects) {
        allocations.sort((a, b) => b.hours - a.hours);
        allocations = allocations.slice(0, maxSubjects);
      }

      // Re-normalize
      const allocTotal = allocations.reduce((s, a) => s + a.hours, 0);
      if (allocTotal > 0 && Math.abs(allocTotal - dailyHours) > 0.25) {
        const scale = dailyHours / allocTotal;
        allocations.forEach(a => {
          a.hours = Math.max(0.25, Math.round(a.hours * scale * 4) / 4);
        });
      }

      // Cap at remaining needed
      allocations.forEach(a => {
        const remaining = Math.max(0, courseData.find(c => c.courseId === a.courseId).totalHours - delivered[a.courseId]);
        a.hours = Math.min(a.hours, Math.ceil(remaining * 4) / 4);
      });
      allocations = allocations.filter(a => a.hours >= 0.25);

      allocations.forEach(a => { delivered[a.courseId] += a.hours; });

      if (allocations.length > 0) {
        const isExamDay = examToday.length > 0;
        schedule.push({ date: dateStr, allocations, isExamDay, examSubjects: examToday });
      }
    }

    courseData.forEach(c => {
      c.deliveredHours = Math.round(delivered[c.courseId] * 2) / 2;
    });

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

    let lastTier = '';
    courseData.forEach(c => {
      if (c.tier !== lastTier) {
        lastTier = c.tier;
        sHtml += '<div class="sa-tier-label sa-tier-' + c.tier + '">' + TIER_LABELS[c.tier] + '</div>';
      }
      const color = SUBJECT_GROUPS[c.course.group]?.color || '#888';
      const dotClass = c.course.group === 'ap' ? 'sa-dot dot-ap' : 'sa-dot';
      const pct = c.totalHours > 0 ? Math.round((c.deliveredHours / c.totalHours) * 100) : 0;
      sHtml += '<div class="study-alloc-row">';
      sHtml += '<span class="' + dotClass + '" style="background:' + sanitize(color) + '"></span>';
      sHtml += '<span class="sa-name">' + sanitize(c.course.name) + '</span>';
      sHtml += '<span class="sa-meta">' + c.daysUntil + 'd left</span>';
      sHtml += '<input type="number" class="sa-input" data-course="' + sanitize(c.courseId) + '" value="' + c.totalHours + '" min="0" max="999" step="0.5">';
      sHtml += '<span class="sa-unit">hrs</span>';
      sHtml += '<span class="sa-pct" title="' + c.deliveredHours + '/' + c.totalHours + 'h scheduled">' + pct + '%</span>';
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

    // --- Calendar grid view ---
    const calendarEl = document.getElementById('study-calendar');
    let dHtml = '<h3>Daily Study Plan</h3>';

    // Build a date-keyed map of schedule entries
    const dayMap = {};
    schedule.forEach(day => { dayMap[day.date] = day; });

    // Determine the date range by months
    if (schedule.length === 0) {
      calendarEl.innerHTML = dHtml + '<p class="selector-hint">No study days scheduled.</p>';
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const firstDate = new Date(schedule[0].date + 'T00:00:00');
    const lastDate = new Date(schedule[schedule.length - 1].date + 'T00:00:00');
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Iterate month by month
    let cur = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const endMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0);

    while (cur <= endMonth) {
      const year = cur.getFullYear();
      const month = cur.getMonth();
      const monthLabel = cur.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

      dHtml += '<div class="sc-month">';
      dHtml += '<div class="sc-month-header">' + monthLabel + '</div>';
      dHtml += '<div class="sc-grid">';

      // Day-of-week header
      dayNames.forEach(dn => {
        dHtml += '<div class="sc-dow">' + dn + '</div>';
      });

      // Empty leading cells
      for (let i = 0; i < firstDow; i++) {
        dHtml += '<div class="sc-cell sc-empty"></div>';
      }

      // Day cells
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const entry = dayMap[dateStr];
        const isToday = dateStr === formatDate(new Date());

        let cellClass = 'sc-cell';
        if (isToday) cellClass += ' sc-today';
        if (entry && entry.isExamDay) cellClass += ' sc-exam-day';
        if (!entry) cellClass += ' sc-inactive';

        dHtml += '<div class="' + cellClass + '">';
        dHtml += '<div class="sc-day-num">' + d + '</div>';

        if (entry) {
          if (entry.isExamDay && entry.allocations.length === 0) {
            // Exam day with no study (toggle skipped)
            dHtml += '<div class="sc-exam-label">EXAM</div>';
            if (entry.examSubjects) {
              entry.examSubjects.forEach(name => {
                dHtml += '<div class="sc-exam-subj" title="' + sanitize(name) + '">' + sanitize(name) + '</div>';
              });
            }
          } else {
            // Study allocations
            entry.allocations.forEach(a => {
              const course = getCourse(a.courseId);
              if (!course) return;
              const color = SUBJECT_GROUPS[course.group]?.color || '#888';
              const shortName = course.name.length > 12 ? course.name.slice(0, 11) + '\u2026' : course.name;
              dHtml += '<div class="sc-block" style="background:' + sanitize(color) + '20;border-left:3px solid ' + sanitize(color) + '" title="' + sanitize(course.name) + ' \u2013 ' + a.hours + 'h">';
              dHtml += '<span class="sc-block-name">' + sanitize(shortName) + '</span>';
              dHtml += '<span class="sc-block-hrs">' + a.hours + 'h</span>';
              dHtml += '</div>';
            });
            if (entry.isExamDay) {
              dHtml += '<div class="sc-exam-label">EXAM</div>';
            }
          }
        }

        dHtml += '</div>';
      }

      dHtml += '</div></div>';
      cur = new Date(year, month + 1, 1);
    }

    calendarEl.innerHTML = dHtml;
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

  /* ===== VIEW COUNTER ===== */
  (function initViewCounter() {
    var el = document.getElementById('view-counter');
    if (!el) return;
    fetch('https://api.counterapi.dev/v1/nagusamecs-examiner/views/up')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && typeof d.count === 'number') {
          el.textContent = d.count.toLocaleString() + ' visits';
        }
      })
      .catch(function() {});
  })();

  /* ===== ORBITING SOCIAL BUTTONS ===== */
  (function initOrbitSocials() {
    const container = document.getElementById('orbit-socials');
    if (!container) return;
    const btns = Array.from(container.querySelectorAll('.orbit-btn'));
    const count = btns.length;
    const wrapper = container.closest('.avatar-orbit-wrapper');
    if (!wrapper) return;

    const BASE_SPEED = 0.0007;
    const MIN_SPEED  = 0.00012;
    const SLOW_RADIUS = 200;
    const RADIUS_X = 90;
    const RADIUS_Y = 16;
    const SCALE_FRONT = 1.05;
    const SCALE_BACK  = 0.55;
    const OPACITY_FRONT = 1.0;
    const OPACITY_BACK  = 0.3;
    const BTN_SIZE = 32;

    let orbitAngle = 0;
    let lastTime = performance.now();
    let mouseX = -9999, mouseY = -9999;

    document.addEventListener('mousemove', function(e) { mouseX = e.clientX; mouseY = e.clientY; });
    document.addEventListener('mouseleave', function() { mouseX = -9999; mouseY = -9999; });

    function animate(now) {
      var dt = Math.min(now - lastTime, 50);
      lastTime = now;

      var wr = wrapper.getBoundingClientRect();
      var cx = wr.left + wr.width / 2;
      var cy = wr.top + wr.height / 2;
      var cursorDist = Math.hypot(mouseX - cx, mouseY - cy);
      var rawP = Math.max(0, Math.min(1, 1 - cursorDist / SLOW_RADIUS));
      var proximity = rawP * rawP * rawP;
      var speed = BASE_SPEED + (MIN_SPEED - BASE_SPEED) * proximity;
      orbitAngle += speed * dt;

      var halfBtn = BTN_SIZE / 2;
      btns.forEach(function(btn, i) {
        var angle = (2 * Math.PI * i) / count + orbitAngle;
        var depth = Math.sin(angle);
        var x = cx + RADIUS_X * Math.cos(angle) - halfBtn;
        var y = cy + RADIUS_Y * Math.sin(angle) - halfBtn;
        var sc = SCALE_BACK + (SCALE_FRONT - SCALE_BACK) * (depth + 1) / 2;
        var op = OPACITY_BACK + (OPACITY_FRONT - OPACITY_BACK) * (depth + 1) / 2;

        btn.style.position = 'fixed';
        btn.style.left = x + 'px';
        btn.style.top = y + 'px';
        btn.style.transform = 'scale(' + sc.toFixed(3) + ')';
        btn.style.opacity = op.toFixed(3);
        btn.style.zIndex = depth > 0 ? 3 : 0;
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  })();

})();
