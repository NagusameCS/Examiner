// IB May 2026 Examination Schedule Data
// Transcribed from the official IB Diploma Programme / Career-related Programme schedule (Final Version)

const SUBJECT_GROUPS = {
  language: { label: 'Studies in Language & Literature / Language Acquisition', color: '#4A9EFF' },
  individuals: { label: 'Individuals & Societies', color: '#FF6B6B' },
  sciences: { label: 'Sciences', color: '#51CF66' },
  mathematics: { label: 'Mathematics', color: '#FFD43B' },
  arts: { label: 'The Arts', color: '#CC5DE8' },
  interdisciplinary: { label: 'Interdisciplinary', color: '#FF922B' }
};

// All selectable courses grouped for the dropdown
const COURSES = [
  // Studies in Language and Literature
  { id: 'lang_a_lit_hl_other', name: 'Language A: Literature HL (other languages)', group: 'language', level: 'HL' },
  { id: 'lang_a_lit_sl_other', name: 'Language A: Literature SL (other languages)', group: 'language', level: 'SL' },
  { id: 'lang_a_langlit_hl_other', name: 'Language A: Language & Literature HL (other languages)', group: 'language', level: 'HL' },
  { id: 'lang_a_langlit_sl_other', name: 'Language A: Language & Literature SL (other languages)', group: 'language', level: 'SL' },
  { id: 'english_a_lit_hl', name: 'English A: Literature HL', group: 'language', level: 'HL' },
  { id: 'english_a_lit_sl', name: 'English A: Literature SL', group: 'language', level: 'SL' },
  { id: 'english_a_langlit_hl', name: 'English A: Language & Literature HL', group: 'language', level: 'HL' },
  { id: 'english_a_langlit_sl', name: 'English A: Language & Literature SL', group: 'language', level: 'SL' },
  { id: 'french_a_lit_hl', name: 'French A: Literature HL', group: 'language', level: 'HL' },
  { id: 'french_a_lit_sl', name: 'French A: Literature SL', group: 'language', level: 'SL' },
  { id: 'french_a_langlit_hl', name: 'French A: Language & Literature HL', group: 'language', level: 'HL' },
  { id: 'french_a_langlit_sl', name: 'French A: Language & Literature SL', group: 'language', level: 'SL' },
  { id: 'spanish_a_lit_hl', name: 'Spanish A: Literature HL', group: 'language', level: 'HL' },
  { id: 'spanish_a_lit_sl', name: 'Spanish A: Literature SL', group: 'language', level: 'SL' },
  { id: 'spanish_a_langlit_hl', name: 'Spanish A: Language & Literature HL', group: 'language', level: 'HL' },
  { id: 'spanish_a_langlit_sl', name: 'Spanish A: Language & Literature SL', group: 'language', level: 'SL' },

  // Language Acquisition
  { id: 'lang_b_hl_other', name: 'Language B HL (other languages)', group: 'language', level: 'HL' },
  { id: 'lang_b_sl_other', name: 'Language B SL (other languages)', group: 'language', level: 'SL' },
  { id: 'lang_ab_initio_sl_other', name: 'Language ab initio SL (other languages)', group: 'language', level: 'SL' },
  { id: 'english_b_hl', name: 'English B HL', group: 'language', level: 'HL' },
  { id: 'english_b_sl', name: 'English B SL', group: 'language', level: 'SL' },
  { id: 'english_ab_initio_sl', name: 'English ab initio SL', group: 'language', level: 'SL' },
  { id: 'french_b_hl', name: 'French B HL', group: 'language', level: 'HL' },
  { id: 'french_b_sl', name: 'French B SL', group: 'language', level: 'SL' },
  { id: 'french_ab_initio_sl', name: 'French ab initio SL', group: 'language', level: 'SL' },
  { id: 'spanish_b_hl', name: 'Spanish B HL', group: 'language', level: 'HL' },
  { id: 'spanish_b_sl', name: 'Spanish B SL', group: 'language', level: 'SL' },
  { id: 'spanish_ab_initio_sl', name: 'Spanish ab initio SL', group: 'language', level: 'SL' },
  { id: 'latin_hl', name: 'Latin HL', group: 'language', level: 'HL' },
  { id: 'latin_sl', name: 'Latin SL', group: 'language', level: 'SL' },
  { id: 'classical_greek_hl', name: 'Classical Greek HL', group: 'language', level: 'HL' },
  { id: 'classical_greek_sl', name: 'Classical Greek SL', group: 'language', level: 'SL' },
  { id: 'lit_performance_sl', name: 'Literature & Performance SL', group: 'language', level: 'SL' },

  // Individuals and Societies
  { id: 'history_hl', name: 'History HL', group: 'individuals', level: 'HL' },
  { id: 'history_sl', name: 'History SL', group: 'individuals', level: 'SL' },
  { id: 'geography_hl', name: 'Geography HL', group: 'individuals', level: 'HL' },
  { id: 'geography_sl', name: 'Geography SL', group: 'individuals', level: 'SL' },
  { id: 'economics_hl', name: 'Economics HL', group: 'individuals', level: 'HL' },
  { id: 'economics_sl', name: 'Economics SL', group: 'individuals', level: 'SL' },
  { id: 'psychology_hl', name: 'Psychology HL', group: 'individuals', level: 'HL' },
  { id: 'psychology_sl', name: 'Psychology SL', group: 'individuals', level: 'SL' },
  { id: 'philosophy_hl', name: 'Philosophy HL', group: 'individuals', level: 'HL' },
  { id: 'philosophy_sl', name: 'Philosophy SL', group: 'individuals', level: 'SL' },
  { id: 'social_cultural_anthropology_hl', name: 'Social & Cultural Anthropology HL', group: 'individuals', level: 'HL' },
  { id: 'social_cultural_anthropology_sl', name: 'Social & Cultural Anthropology SL', group: 'individuals', level: 'SL' },
  { id: 'global_politics_hl', name: 'Global Politics HL', group: 'individuals', level: 'HL' },
  { id: 'global_politics_sl', name: 'Global Politics SL', group: 'individuals', level: 'SL' },
  { id: 'world_religions_sl', name: 'World Religions SL', group: 'individuals', level: 'SL' },
  { id: 'business_management_hl', name: 'Business Management HL', group: 'individuals', level: 'HL' },
  { id: 'business_management_sl', name: 'Business Management SL', group: 'individuals', level: 'SL' },
  { id: 'digital_society_hl', name: 'Digital Society HL', group: 'individuals', level: 'HL' },
  { id: 'digital_society_sl', name: 'Digital Society SL', group: 'individuals', level: 'SL' },

  // Sciences
  { id: 'physics_hl', name: 'Physics HL', group: 'sciences', level: 'HL' },
  { id: 'physics_sl', name: 'Physics SL', group: 'sciences', level: 'SL' },
  { id: 'chemistry_hl', name: 'Chemistry HL', group: 'sciences', level: 'HL' },
  { id: 'chemistry_sl', name: 'Chemistry SL', group: 'sciences', level: 'SL' },
  { id: 'biology_hl', name: 'Biology HL', group: 'sciences', level: 'HL' },
  { id: 'biology_sl', name: 'Biology SL', group: 'sciences', level: 'SL' },
  { id: 'computer_science_hl', name: 'Computer Science HL', group: 'sciences', level: 'HL' },
  { id: 'computer_science_sl', name: 'Computer Science SL', group: 'sciences', level: 'SL' },
  { id: 'design_technology_hl', name: 'Design Technology HL', group: 'sciences', level: 'HL' },
  { id: 'design_technology_sl', name: 'Design Technology SL', group: 'sciences', level: 'SL' },
  { id: 'sports_exercise_health_hl', name: 'Sports, Exercise & Health Science HL', group: 'sciences', level: 'HL' },
  { id: 'sports_exercise_health_sl', name: 'Sports, Exercise & Health Science SL', group: 'sciences', level: 'SL' },
  { id: 'ess_hl', name: 'Environmental Systems & Societies HL', group: 'sciences', level: 'HL' },
  { id: 'ess_sl', name: 'Environmental Systems & Societies SL', group: 'sciences', level: 'SL' },

  // Mathematics
  { id: 'math_aa_hl', name: 'Mathematics: Analysis & Approaches HL', group: 'mathematics', level: 'HL' },
  { id: 'math_aa_sl', name: 'Mathematics: Analysis & Approaches SL', group: 'mathematics', level: 'SL' },
  { id: 'math_ai_hl', name: 'Mathematics: Applications & Interpretation HL', group: 'mathematics', level: 'HL' },
  { id: 'math_ai_sl', name: 'Mathematics: Applications & Interpretation SL', group: 'mathematics', level: 'SL' },

  // Interdisciplinary
  { id: 'sbs_sl', name: 'School-based Syllabus SL', group: 'interdisciplinary', level: 'SL' },
  { id: 'lang_culture_sl', name: 'Language & Culture SL', group: 'interdisciplinary', level: 'SL' },
];

// All exams - each entry maps to one or more course IDs
const EXAMS = [
  // ===== Friday 24 April =====
  { date: '2026-04-24', session: 'afternoon', name: 'School-based Syllabus SL Paper 1', duration: 0, courseIds: ['sbs_sl'], group: 'interdisciplinary' },
  { date: '2026-04-24', session: 'afternoon', name: 'Language & Culture SL Paper 1', duration: 90, courseIds: ['lang_culture_sl'], group: 'interdisciplinary' },

  // ===== Monday 27 April =====
  { date: '2026-04-27', session: 'morning', name: 'School-based Syllabus SL Paper 2', duration: 0, courseIds: ['sbs_sl'], group: 'interdisciplinary' },
  { date: '2026-04-27', session: 'morning', name: 'Language & Culture SL Paper 2', duration: 90, courseIds: ['lang_culture_sl'], group: 'interdisciplinary' },
  { date: '2026-04-27', session: 'afternoon', name: 'Language A: Literature HL Paper 1', duration: 135, courseIds: ['lang_a_lit_hl_other'], group: 'language' },
  { date: '2026-04-27', session: 'afternoon', name: 'Language A: Literature SL Paper 1', duration: 75, courseIds: ['lang_a_lit_sl_other'], group: 'language' },
  { date: '2026-04-27', session: 'afternoon', name: 'Language A: Language & Literature HL Paper 1', duration: 135, courseIds: ['lang_a_langlit_hl_other'], group: 'language' },
  { date: '2026-04-27', session: 'afternoon', name: 'Language A: Language & Literature SL Paper 1', duration: 75, courseIds: ['lang_a_langlit_sl_other'], group: 'language' },

  // ===== Tuesday 28 April =====
  { date: '2026-04-28', session: 'morning', name: 'Language A: Literature HL/SL Paper 2', duration: 105, courseIds: ['lang_a_lit_hl_other', 'lang_a_lit_sl_other'], group: 'language' },
  { date: '2026-04-28', session: 'morning', name: 'Language A: Language & Literature HL/SL Paper 2', duration: 105, courseIds: ['lang_a_langlit_hl_other', 'lang_a_langlit_sl_other'], group: 'language' },
  { date: '2026-04-28', session: 'afternoon', name: 'Physics HL Paper 1 (1a and 1b)', duration: 120, courseIds: ['physics_hl'], group: 'sciences' },
  { date: '2026-04-28', session: 'afternoon', name: 'Physics SL Paper 1 (1a and 1b)', duration: 90, courseIds: ['physics_sl'], group: 'sciences' },
  { date: '2026-04-28', session: 'afternoon', name: 'Sports, Exercise & Health Science HL Paper 1 (1a and 1b)', duration: 105, courseIds: ['sports_exercise_health_hl'], group: 'sciences' },
  { date: '2026-04-28', session: 'afternoon', name: 'Sports, Exercise & Health Science SL Paper 1 (1a and 1b)', duration: 90, courseIds: ['sports_exercise_health_sl'], group: 'sciences' },

  // ===== Wednesday 29 April =====
  { date: '2026-04-29', session: 'morning', name: 'Physics HL Paper 2', duration: 150, courseIds: ['physics_hl'], group: 'sciences' },
  { date: '2026-04-29', session: 'morning', name: 'Physics SL Paper 2', duration: 90, courseIds: ['physics_sl'], group: 'sciences' },
  { date: '2026-04-29', session: 'morning', name: 'Sports, Exercise & Health Science HL Paper 2', duration: 150, courseIds: ['sports_exercise_health_hl'], group: 'sciences' },
  { date: '2026-04-29', session: 'morning', name: 'Sports, Exercise & Health Science SL Paper 2', duration: 90, courseIds: ['sports_exercise_health_sl'], group: 'sciences' },
  { date: '2026-04-29', session: 'afternoon', name: 'Business Management HL/SL Paper 1', duration: 90, courseIds: ['business_management_hl', 'business_management_sl'], group: 'individuals' },
  { date: '2026-04-29', session: 'afternoon', name: 'Business Management HL Paper 3', duration: 75, courseIds: ['business_management_hl'], group: 'individuals' },

  // ===== Thursday 30 April =====
  { date: '2026-04-30', session: 'morning', name: 'Business Management HL Paper 2', duration: 105, courseIds: ['business_management_hl'], group: 'individuals' },
  { date: '2026-04-30', session: 'morning', name: 'Business Management SL Paper 2', duration: 90, courseIds: ['business_management_sl'], group: 'individuals' },
  { date: '2026-04-30', session: 'afternoon', name: 'Computer Science HL Paper 1', duration: 130, courseIds: ['computer_science_hl'], group: 'sciences' },
  { date: '2026-04-30', session: 'afternoon', name: 'Computer Science SL Paper 1', duration: 90, courseIds: ['computer_science_sl'], group: 'sciences' },
  { date: '2026-04-30', session: 'afternoon', name: 'Environmental Systems & Societies HL Paper 1', duration: 120, courseIds: ['ess_hl'], group: 'sciences' },
  { date: '2026-04-30', session: 'afternoon', name: 'Environmental Systems & Societies SL Paper 1', duration: 60, courseIds: ['ess_sl'], group: 'sciences' },

  // ===== Friday 1 May – No exams =====

  // ===== Monday 4 May =====
  { date: '2026-05-04', session: 'morning', name: 'Computer Science HL Paper 2', duration: 80, courseIds: ['computer_science_hl'], group: 'sciences' },
  { date: '2026-05-04', session: 'morning', name: 'Computer Science HL Paper 3', duration: 60, courseIds: ['computer_science_hl'], group: 'sciences' },
  { date: '2026-05-04', session: 'morning', name: 'Computer Science SL Paper 2', duration: 60, courseIds: ['computer_science_sl'], group: 'sciences' },
  { date: '2026-05-04', session: 'morning', name: 'Environmental Systems & Societies HL Paper 2', duration: 150, courseIds: ['ess_hl'], group: 'sciences' },
  { date: '2026-05-04', session: 'morning', name: 'Environmental Systems & Societies SL Paper 2', duration: 120, courseIds: ['ess_sl'], group: 'sciences' },
  { date: '2026-05-04', session: 'afternoon', name: 'History HL/SL Paper 1', duration: 60, courseIds: ['history_hl', 'history_sl'], group: 'individuals' },
  { date: '2026-05-04', session: 'afternoon', name: 'History HL/SL Paper 2', duration: 90, courseIds: ['history_hl', 'history_sl'], group: 'individuals' },

  // ===== Tuesday 5 May =====
  { date: '2026-05-05', session: 'morning', name: 'History HL Paper 3', duration: 150, courseIds: ['history_hl'], group: 'individuals' },
  { date: '2026-05-05', session: 'afternoon', name: 'Language B HL Paper 1', duration: 90, courseIds: ['lang_b_hl_other'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Language B HL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['lang_b_hl_other'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Language B SL Paper 1', duration: 75, courseIds: ['lang_b_sl_other'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Language B SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['lang_b_sl_other'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Language ab initio SL Paper 1', duration: 60, courseIds: ['lang_ab_initio_sl_other'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Language ab initio SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['lang_ab_initio_sl_other'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Latin HL Paper 1', duration: 120, courseIds: ['latin_hl'], group: 'language' },
  { date: '2026-05-05', session: 'afternoon', name: 'Latin SL Paper 1', duration: 90, courseIds: ['latin_sl'], group: 'language' },

  // ===== Wednesday 6 May =====
  { date: '2026-05-06', session: 'morning', name: 'Language B HL Paper 2 – Listening Comprehension', duration: 60, courseIds: ['lang_b_hl_other'], group: 'language' },
  { date: '2026-05-06', session: 'morning', name: 'Language B SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['lang_b_sl_other'], group: 'language' },
  { date: '2026-05-06', session: 'morning', name: 'Language ab initio SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['lang_ab_initio_sl_other'], group: 'language' },
  { date: '2026-05-06', session: 'morning', name: 'Latin HL Paper 2', duration: 90, courseIds: ['latin_hl'], group: 'language' },
  { date: '2026-05-06', session: 'morning', name: 'Latin SL Paper 2', duration: 90, courseIds: ['latin_sl'], group: 'language' },
  { date: '2026-05-06', session: 'afternoon', name: 'Psychology HL Paper 1', duration: 120, courseIds: ['psychology_hl'], group: 'individuals' },
  { date: '2026-05-06', session: 'afternoon', name: 'Psychology SL Paper 1', duration: 120, courseIds: ['psychology_sl'], group: 'individuals' },

  // ===== Thursday 7 May =====
  { date: '2026-05-07', session: 'morning', name: 'Psychology HL Paper 2', duration: 120, courseIds: ['psychology_hl'], group: 'individuals' },
  { date: '2026-05-07', session: 'morning', name: 'Psychology HL Paper 3', duration: 60, courseIds: ['psychology_hl'], group: 'individuals' },
  { date: '2026-05-07', session: 'morning', name: 'Psychology SL Paper 2', duration: 60, courseIds: ['psychology_sl'], group: 'individuals' },
  { date: '2026-05-07', session: 'afternoon', name: 'English A: Literature HL Paper 1', duration: 135, courseIds: ['english_a_lit_hl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English A: Literature SL Paper 1', duration: 75, courseIds: ['english_a_lit_sl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English A: Language & Literature HL Paper 1', duration: 135, courseIds: ['english_a_langlit_hl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English A: Language & Literature SL Paper 1', duration: 75, courseIds: ['english_a_langlit_sl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English B HL Paper 1', duration: 90, courseIds: ['english_b_hl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English B HL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['english_b_hl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English B SL Paper 1', duration: 75, courseIds: ['english_b_sl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English B SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['english_b_sl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English ab initio SL Paper 1', duration: 60, courseIds: ['english_ab_initio_sl'], group: 'language' },
  { date: '2026-05-07', session: 'afternoon', name: 'English ab initio SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['english_ab_initio_sl'], group: 'language' },

  // ===== Friday 8 May =====
  { date: '2026-05-08', session: 'morning', name: 'English A: Literature HL/SL Paper 2', duration: 105, courseIds: ['english_a_lit_hl', 'english_a_lit_sl'], group: 'language' },
  { date: '2026-05-08', session: 'morning', name: 'English A: Language & Literature HL/SL Paper 2', duration: 105, courseIds: ['english_a_langlit_hl', 'english_a_langlit_sl'], group: 'language' },
  { date: '2026-05-08', session: 'morning', name: 'English B HL Paper 2 – Listening Comprehension', duration: 60, courseIds: ['english_b_hl'], group: 'language' },
  { date: '2026-05-08', session: 'morning', name: 'English B SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['english_b_sl'], group: 'language' },
  { date: '2026-05-08', session: 'morning', name: 'English ab initio SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['english_ab_initio_sl'], group: 'language' },
  { date: '2026-05-08', session: 'morning', name: 'Literature & Performance SL Paper 1', duration: 105, courseIds: ['lit_performance_sl'], group: 'language' },
  { date: '2026-05-08', session: 'afternoon', name: 'Geography HL Paper 1', duration: 135, courseIds: ['geography_hl'], group: 'individuals' },
  { date: '2026-05-08', session: 'afternoon', name: 'Geography SL Paper 1', duration: 90, courseIds: ['geography_sl'], group: 'individuals' },
  { date: '2026-05-08', session: 'afternoon', name: 'Philosophy HL Paper 1', duration: 150, courseIds: ['philosophy_hl'], group: 'individuals' },
  { date: '2026-05-08', session: 'afternoon', name: 'Philosophy SL Paper 1', duration: 105, courseIds: ['philosophy_sl'], group: 'individuals' },
  { date: '2026-05-08', session: 'afternoon', name: 'Social & Cultural Anthropology HL Paper 1', duration: 120, courseIds: ['social_cultural_anthropology_hl'], group: 'individuals' },
  { date: '2026-05-08', session: 'afternoon', name: 'Social & Cultural Anthropology SL Paper 1', duration: 90, courseIds: ['social_cultural_anthropology_sl'], group: 'individuals' },

  // ===== Monday 11 May =====
  { date: '2026-05-11', session: 'morning', name: 'Geography HL/SL Paper 2', duration: 75, courseIds: ['geography_hl', 'geography_sl'], group: 'individuals' },
  { date: '2026-05-11', session: 'morning', name: 'Geography HL Paper 3', duration: 60, courseIds: ['geography_hl'], group: 'individuals' },
  { date: '2026-05-11', session: 'morning', name: 'Philosophy HL/SL Paper 2', duration: 60, courseIds: ['philosophy_hl', 'philosophy_sl'], group: 'individuals' },
  { date: '2026-05-11', session: 'morning', name: 'Philosophy HL Paper 3', duration: 75, courseIds: ['philosophy_hl'], group: 'individuals' },
  { date: '2026-05-11', session: 'morning', name: 'Social & Cultural Anthropology HL Paper 2', duration: 150, courseIds: ['social_cultural_anthropology_hl'], group: 'individuals' },
  { date: '2026-05-11', session: 'morning', name: 'Social & Cultural Anthropology SL Paper 2', duration: 90, courseIds: ['social_cultural_anthropology_sl'], group: 'individuals' },
  { date: '2026-05-11', session: 'afternoon', name: 'Biology HL Paper 1 (1a and 1b)', duration: 120, courseIds: ['biology_hl'], group: 'sciences' },
  { date: '2026-05-11', session: 'afternoon', name: 'Biology SL Paper 1 (1a and 1b)', duration: 90, courseIds: ['biology_sl'], group: 'sciences' },

  // ===== Tuesday 12 May =====
  { date: '2026-05-12', session: 'morning', name: 'Biology HL Paper 2', duration: 150, courseIds: ['biology_hl'], group: 'sciences' },
  { date: '2026-05-12', session: 'morning', name: 'Biology SL Paper 2', duration: 90, courseIds: ['biology_sl'], group: 'sciences' },
  { date: '2026-05-12', session: 'afternoon', name: 'Economics HL/SL Paper 2', duration: 105, courseIds: ['economics_hl', 'economics_sl'], group: 'individuals' },
  { date: '2026-05-12', session: 'afternoon', name: 'World Religions SL Paper 1', duration: 75, courseIds: ['world_religions_sl'], group: 'individuals' },

  // ===== Wednesday 13 May =====
  { date: '2026-05-13', session: 'morning', name: 'Economics HL Paper 1', duration: 75, courseIds: ['economics_hl'], group: 'individuals' },
  { date: '2026-05-13', session: 'morning', name: 'Economics HL Paper 3', duration: 105, courseIds: ['economics_hl'], group: 'individuals' },
  { date: '2026-05-13', session: 'morning', name: 'Economics SL Paper 1', duration: 75, courseIds: ['economics_sl'], group: 'individuals' },
  { date: '2026-05-13', session: 'morning', name: 'World Religions SL Paper 2', duration: 90, courseIds: ['world_religions_sl'], group: 'individuals' },
  { date: '2026-05-13', session: 'afternoon', name: 'Classical Greek HL Paper 1', duration: 120, courseIds: ['classical_greek_hl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Classical Greek SL Paper 1', duration: 90, courseIds: ['classical_greek_sl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish A: Literature HL Paper 1', duration: 135, courseIds: ['spanish_a_lit_hl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish A: Literature SL Paper 1', duration: 75, courseIds: ['spanish_a_lit_sl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish A: Language & Literature HL Paper 1', duration: 135, courseIds: ['spanish_a_langlit_hl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish A: Language & Literature SL Paper 1', duration: 75, courseIds: ['spanish_a_langlit_sl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish B HL Paper 1', duration: 90, courseIds: ['spanish_b_hl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish B HL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['spanish_b_hl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish B SL Paper 1', duration: 75, courseIds: ['spanish_b_sl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish B SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['spanish_b_sl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish ab initio SL Paper 1', duration: 60, courseIds: ['spanish_ab_initio_sl'], group: 'language' },
  { date: '2026-05-13', session: 'afternoon', name: 'Spanish ab initio SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['spanish_ab_initio_sl'], group: 'language' },

  // ===== Thursday 14 May =====
  { date: '2026-05-14', session: 'morning', name: 'Classical Greek HL Paper 2', duration: 90, courseIds: ['classical_greek_hl'], group: 'language' },
  { date: '2026-05-14', session: 'morning', name: 'Classical Greek SL Paper 2', duration: 90, courseIds: ['classical_greek_sl'], group: 'language' },
  { date: '2026-05-14', session: 'morning', name: 'Spanish A: Literature HL/SL Paper 2', duration: 105, courseIds: ['spanish_a_lit_hl', 'spanish_a_lit_sl'], group: 'language' },
  { date: '2026-05-14', session: 'morning', name: 'Spanish A: Language & Literature HL/SL Paper 2', duration: 105, courseIds: ['spanish_a_langlit_hl', 'spanish_a_langlit_sl'], group: 'language' },
  { date: '2026-05-14', session: 'morning', name: 'Spanish B HL Paper 2 – Listening Comprehension', duration: 60, courseIds: ['spanish_b_hl'], group: 'language' },
  { date: '2026-05-14', session: 'morning', name: 'Spanish B SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['spanish_b_sl'], group: 'language' },
  { date: '2026-05-14', session: 'morning', name: 'Spanish ab initio SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['spanish_ab_initio_sl'], group: 'language' },
  { date: '2026-05-14', session: 'afternoon', name: 'Mathematics: Analysis & Approaches HL Paper 1', duration: 120, courseIds: ['math_aa_hl'], group: 'mathematics' },
  { date: '2026-05-14', session: 'afternoon', name: 'Mathematics: Analysis & Approaches SL Paper 1', duration: 90, courseIds: ['math_aa_sl'], group: 'mathematics' },
  { date: '2026-05-14', session: 'afternoon', name: 'Mathematics: Applications & Interpretation HL Paper 1', duration: 120, courseIds: ['math_ai_hl'], group: 'mathematics' },
  { date: '2026-05-14', session: 'afternoon', name: 'Mathematics: Applications & Interpretation SL Paper 1', duration: 90, courseIds: ['math_ai_sl'], group: 'mathematics' },

  // ===== Friday 15 May =====
  { date: '2026-05-15', session: 'morning', name: 'Mathematics: Analysis & Approaches HL Paper 2', duration: 120, courseIds: ['math_aa_hl'], group: 'mathematics' },
  { date: '2026-05-15', session: 'morning', name: 'Mathematics: Analysis & Approaches SL Paper 2', duration: 90, courseIds: ['math_aa_sl'], group: 'mathematics' },
  { date: '2026-05-15', session: 'morning', name: 'Mathematics: Applications & Interpretation HL Paper 2', duration: 120, courseIds: ['math_ai_hl'], group: 'mathematics' },
  { date: '2026-05-15', session: 'morning', name: 'Mathematics: Applications & Interpretation SL Paper 2', duration: 90, courseIds: ['math_ai_sl'], group: 'mathematics' },
  { date: '2026-05-15', session: 'afternoon', name: 'Chemistry HL Paper 1 (1a and 1b)', duration: 120, courseIds: ['chemistry_hl'], group: 'sciences' },
  { date: '2026-05-15', session: 'afternoon', name: 'Chemistry SL Paper 1 (1a and 1b)', duration: 90, courseIds: ['chemistry_sl'], group: 'sciences' },
  { date: '2026-05-15', session: 'afternoon', name: 'Design Technology HL Paper 1', duration: 60, courseIds: ['design_technology_hl'], group: 'sciences' },
  { date: '2026-05-15', session: 'afternoon', name: 'Design Technology SL Paper 1', duration: 45, courseIds: ['design_technology_sl'], group: 'sciences' },
  { date: '2026-05-15', session: 'afternoon', name: 'Design Technology HL/SL Paper 2', duration: 90, courseIds: ['design_technology_hl', 'design_technology_sl'], group: 'sciences' },

  // ===== Monday 18 May =====
  { date: '2026-05-18', session: 'morning', name: 'Chemistry HL Paper 2', duration: 150, courseIds: ['chemistry_hl'], group: 'sciences' },
  { date: '2026-05-18', session: 'morning', name: 'Chemistry SL Paper 2', duration: 90, courseIds: ['chemistry_sl'], group: 'sciences' },
  { date: '2026-05-18', session: 'morning', name: 'Design Technology HL Paper 3', duration: 90, courseIds: ['design_technology_hl'], group: 'sciences' },
  { date: '2026-05-18', session: 'afternoon', name: 'Digital Society HL Paper 1', duration: 135, courseIds: ['digital_society_hl'], group: 'individuals' },
  { date: '2026-05-18', session: 'afternoon', name: 'Digital Society SL Paper 1', duration: 90, courseIds: ['digital_society_sl'], group: 'individuals' },
  { date: '2026-05-18', session: 'afternoon', name: 'Global Politics HL/SL Paper 1', duration: 75, courseIds: ['global_politics_hl', 'global_politics_sl'], group: 'individuals' },
  { date: '2026-05-18', session: 'afternoon', name: 'Global Politics HL/SL Paper 2', duration: 105, courseIds: ['global_politics_hl', 'global_politics_sl'], group: 'individuals' },

  // ===== Tuesday 19 May =====
  { date: '2026-05-19', session: 'morning', name: 'Digital Society HL/SL Paper 2', duration: 75, courseIds: ['digital_society_hl', 'digital_society_sl'], group: 'individuals' },
  { date: '2026-05-19', session: 'morning', name: 'Digital Society HL Paper 3', duration: 75, courseIds: ['digital_society_hl'], group: 'individuals' },
  { date: '2026-05-19', session: 'morning', name: 'Global Politics HL Paper 3', duration: 90, courseIds: ['global_politics_hl'], group: 'individuals' },
  { date: '2026-05-19', session: 'afternoon', name: 'French A: Literature HL Paper 1', duration: 135, courseIds: ['french_a_lit_hl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French A: Literature SL Paper 1', duration: 75, courseIds: ['french_a_lit_sl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French A: Language & Literature HL Paper 1', duration: 135, courseIds: ['french_a_langlit_hl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French A: Language & Literature SL Paper 1', duration: 75, courseIds: ['french_a_langlit_sl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French B HL Paper 1', duration: 90, courseIds: ['french_b_hl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French B HL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['french_b_hl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French B SL Paper 1', duration: 75, courseIds: ['french_b_sl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French B SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['french_b_sl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French ab initio SL Paper 1', duration: 60, courseIds: ['french_ab_initio_sl'], group: 'language' },
  { date: '2026-05-19', session: 'afternoon', name: 'French ab initio SL Paper 2 – Reading Comprehension', duration: 60, courseIds: ['french_ab_initio_sl'], group: 'language' },

  // ===== Wednesday 20 May =====
  { date: '2026-05-20', session: 'morning', name: 'French A: Literature HL/SL Paper 2', duration: 105, courseIds: ['french_a_lit_hl', 'french_a_lit_sl'], group: 'language' },
  { date: '2026-05-20', session: 'morning', name: 'French A: Language & Literature HL/SL Paper 2', duration: 105, courseIds: ['french_a_langlit_hl', 'french_a_langlit_sl'], group: 'language' },
  { date: '2026-05-20', session: 'morning', name: 'French B HL Paper 2 – Listening Comprehension', duration: 60, courseIds: ['french_b_hl'], group: 'language' },
  { date: '2026-05-20', session: 'morning', name: 'French B SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['french_b_sl'], group: 'language' },
  { date: '2026-05-20', session: 'morning', name: 'French ab initio SL Paper 2 – Listening Comprehension', duration: 45, courseIds: ['french_ab_initio_sl'], group: 'language' },
  { date: '2026-05-20', session: 'afternoon', name: 'Mathematics: Analysis & Approaches HL Paper 3', duration: 75, courseIds: ['math_aa_hl'], group: 'mathematics' },
  { date: '2026-05-20', session: 'afternoon', name: 'Mathematics: Applications & Interpretation HL Paper 3', duration: 75, courseIds: ['math_ai_hl'], group: 'mathematics' },
];

// Helper to format duration in minutes to a readable string
function formatDuration(mins) {
  if (mins === 0) return 'TBD';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Get course object by ID
function getCourse(id) {
  return COURSES.find(c => c.id === id);
}

// Get all exams for a set of course IDs
function getExamsForCourses(courseIds) {
  return EXAMS.filter(e => e.courseIds.some(cid => courseIds.includes(cid)));
}

// Get unique dates in the schedule
function getScheduleDates() {
  const dates = [...new Set(EXAMS.map(e => e.date))].sort();
  return dates;
}
