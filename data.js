// May 2026 Examination Schedule Data
// Transcribed from official IB Diploma Programme / Career-related Programme and College Board AP schedules

const SUBJECT_GROUPS = {
  language: { label: 'Studies in Language & Literature / Language Acquisition', color: '#4A9EFF' },
  individuals: { label: 'Individuals & Societies', color: '#FF6B6B' },
  sciences: { label: 'Sciences', color: '#51CF66' },
  mathematics: { label: 'Mathematics', color: '#FFD43B' },
  arts: { label: 'The Arts', color: '#CC5DE8' },
  interdisciplinary: { label: 'Interdisciplinary', color: '#FF922B' },
  ap: { label: 'AP Exams', color: '#00B4D8' }
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

  // AP Exams (College Board 2026)
  { id: 'ap_biology', name: 'AP Biology', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_latin', name: 'AP Latin', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_european_history', name: 'AP European History', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_microeconomics', name: 'AP Microeconomics', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_chemistry', name: 'AP Chemistry', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_human_geography', name: 'AP Human Geography', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_us_gov', name: 'AP United States Government and Politics', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_english_lit', name: 'AP English Literature and Composition', group: 'ap', level: 'AP', category: 'English' },
  { id: 'ap_comp_gov', name: 'AP Comparative Government and Politics', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_physics_1', name: 'AP Physics 1: Algebra-Based', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_physics_2', name: 'AP Physics 2: Algebra-Based', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_world_history', name: 'AP World History: Modern', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_african_american_studies', name: 'AP African American Studies', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_statistics', name: 'AP Statistics', group: 'ap', level: 'AP', category: 'Math' },
  { id: 'ap_italian', name: 'AP Italian Language and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_us_history', name: 'AP United States History', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_chinese', name: 'AP Chinese Language and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_macroeconomics', name: 'AP Macroeconomics', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_art_design', name: 'AP Art and Design', group: 'ap', level: 'AP', category: 'Arts' },
  { id: 'ap_calculus_ab', name: 'AP Calculus AB', group: 'ap', level: 'AP', category: 'Math' },
  { id: 'ap_calculus_bc', name: 'AP Calculus BC', group: 'ap', level: 'AP', category: 'Math' },
  { id: 'ap_music_theory', name: 'AP Music Theory', group: 'ap', level: 'AP', category: 'Arts' },
  { id: 'ap_seminar', name: 'AP Seminar', group: 'ap', level: 'AP', category: 'Research' },
  { id: 'ap_french', name: 'AP French Language and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_precalculus', name: 'AP Precalculus', group: 'ap', level: 'AP', category: 'Math' },
  { id: 'ap_japanese', name: 'AP Japanese Language and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_psychology', name: 'AP Psychology', group: 'ap', level: 'AP', category: 'History & Social Sciences' },
  { id: 'ap_english_lang', name: 'AP English Language and Composition', group: 'ap', level: 'AP', category: 'English' },
  { id: 'ap_german', name: 'AP German Language and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_physics_c_mech', name: 'AP Physics C: Mechanics', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_spanish_lit', name: 'AP Spanish Literature and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_art_history', name: 'AP Art History', group: 'ap', level: 'AP', category: 'Arts' },
  { id: 'ap_spanish_lang', name: 'AP Spanish Language and Culture', group: 'ap', level: 'AP', category: 'World Languages' },
  { id: 'ap_csp', name: 'AP Computer Science Principles', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_physics_c_em', name: 'AP Physics C: Electricity and Magnetism', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_environmental_science', name: 'AP Environmental Science', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_csa', name: 'AP Computer Science A', group: 'ap', level: 'AP', category: 'Sciences' },
  { id: 'ap_research', name: 'AP Research', group: 'ap', level: 'AP', category: 'Research' },
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

  // ===== AP Exams — May 2026 (College Board) =====
  // Week 1
  // Monday May 4
  { date: '2026-05-04', session: 'morning', name: 'AP Biology', duration: 195, courseIds: ['ap_biology'], group: 'ap' },
  { date: '2026-05-04', session: 'morning', name: 'AP Latin', duration: 195, courseIds: ['ap_latin'], group: 'ap' },
  { date: '2026-05-04', session: 'afternoon', name: 'AP European History', duration: 195, courseIds: ['ap_european_history'], group: 'ap' },
  { date: '2026-05-04', session: 'afternoon', name: 'AP Microeconomics', duration: 130, courseIds: ['ap_microeconomics'], group: 'ap' },
  // Tuesday May 5
  { date: '2026-05-05', session: 'morning', name: 'AP Chemistry', duration: 195, courseIds: ['ap_chemistry'], group: 'ap' },
  { date: '2026-05-05', session: 'morning', name: 'AP Human Geography', duration: 135, courseIds: ['ap_human_geography'], group: 'ap' },
  { date: '2026-05-05', session: 'afternoon', name: 'AP United States Government and Politics', duration: 180, courseIds: ['ap_us_gov'], group: 'ap' },
  // Wednesday May 6
  { date: '2026-05-06', session: 'morning', name: 'AP English Literature and Composition', duration: 180, courseIds: ['ap_english_lit'], group: 'ap' },
  { date: '2026-05-06', session: 'afternoon', name: 'AP Comparative Government and Politics', duration: 180, courseIds: ['ap_comp_gov'], group: 'ap' },
  { date: '2026-05-06', session: 'afternoon', name: 'AP Physics 1: Algebra-Based', duration: 180, courseIds: ['ap_physics_1'], group: 'ap' },
  // Thursday May 7
  { date: '2026-05-07', session: 'morning', name: 'AP Physics 2: Algebra-Based', duration: 180, courseIds: ['ap_physics_2'], group: 'ap' },
  { date: '2026-05-07', session: 'morning', name: 'AP World History: Modern', duration: 195, courseIds: ['ap_world_history'], group: 'ap' },
  { date: '2026-05-07', session: 'afternoon', name: 'AP African American Studies', duration: 180, courseIds: ['ap_african_american_studies'], group: 'ap' },
  { date: '2026-05-07', session: 'afternoon', name: 'AP Statistics', duration: 180, courseIds: ['ap_statistics'], group: 'ap' },
  // Friday May 8
  { date: '2026-05-08', session: 'morning', name: 'AP Italian Language and Culture', duration: 195, courseIds: ['ap_italian'], group: 'ap' },
  { date: '2026-05-08', session: 'morning', name: 'AP United States History', duration: 195, courseIds: ['ap_us_history'], group: 'ap' },
  { date: '2026-05-08', session: 'afternoon', name: 'AP Chinese Language and Culture', duration: 195, courseIds: ['ap_chinese'], group: 'ap' },
  { date: '2026-05-08', session: 'afternoon', name: 'AP Macroeconomics', duration: 130, courseIds: ['ap_macroeconomics'], group: 'ap' },
  { date: '2026-05-08', session: 'afternoon', name: 'AP Art and Design (Portfolio Deadline)', duration: 0, courseIds: ['ap_art_design'], group: 'ap' },

  // Week 2
  // Monday May 11
  { date: '2026-05-11', session: 'morning', name: 'AP Calculus AB', duration: 195, courseIds: ['ap_calculus_ab'], group: 'ap' },
  { date: '2026-05-11', session: 'morning', name: 'AP Calculus BC', duration: 195, courseIds: ['ap_calculus_bc'], group: 'ap' },
  { date: '2026-05-11', session: 'afternoon', name: 'AP Music Theory', duration: 180, courseIds: ['ap_music_theory'], group: 'ap' },
  { date: '2026-05-11', session: 'afternoon', name: 'AP Seminar', duration: 180, courseIds: ['ap_seminar'], group: 'ap' },
  // Tuesday May 12
  { date: '2026-05-12', session: 'morning', name: 'AP French Language and Culture', duration: 195, courseIds: ['ap_french'], group: 'ap' },
  { date: '2026-05-12', session: 'morning', name: 'AP Precalculus', duration: 120, courseIds: ['ap_precalculus'], group: 'ap' },
  { date: '2026-05-12', session: 'afternoon', name: 'AP Japanese Language and Culture', duration: 195, courseIds: ['ap_japanese'], group: 'ap' },
  { date: '2026-05-12', session: 'afternoon', name: 'AP Psychology', duration: 120, courseIds: ['ap_psychology'], group: 'ap' },
  // Wednesday May 13
  { date: '2026-05-13', session: 'morning', name: 'AP English Language and Composition', duration: 135, courseIds: ['ap_english_lang'], group: 'ap' },
  { date: '2026-05-13', session: 'morning', name: 'AP German Language and Culture', duration: 195, courseIds: ['ap_german'], group: 'ap' },
  { date: '2026-05-13', session: 'afternoon', name: 'AP Physics C: Mechanics', duration: 90, courseIds: ['ap_physics_c_mech'], group: 'ap' },
  { date: '2026-05-13', session: 'afternoon', name: 'AP Spanish Literature and Culture', duration: 180, courseIds: ['ap_spanish_lit'], group: 'ap' },
  // Thursday May 14
  { date: '2026-05-14', session: 'morning', name: 'AP Art History', duration: 180, courseIds: ['ap_art_history'], group: 'ap' },
  { date: '2026-05-14', session: 'morning', name: 'AP Spanish Language and Culture', duration: 195, courseIds: ['ap_spanish_lang'], group: 'ap' },
  { date: '2026-05-14', session: 'afternoon', name: 'AP Computer Science Principles', duration: 120, courseIds: ['ap_csp'], group: 'ap' },
  { date: '2026-05-14', session: 'afternoon', name: 'AP Physics C: Electricity and Magnetism', duration: 90, courseIds: ['ap_physics_c_em'], group: 'ap' },
  // Friday May 15
  { date: '2026-05-15', session: 'morning', name: 'AP Environmental Science', duration: 160, courseIds: ['ap_environmental_science'], group: 'ap' },
  { date: '2026-05-15', session: 'afternoon', name: 'AP Computer Science A', duration: 180, courseIds: ['ap_csa'], group: 'ap' },

  // AP Seminar & Research submission deadlines
  { date: '2026-04-30', session: 'afternoon', name: 'AP Seminar — Performance Task Submission Deadline', duration: 0, courseIds: ['ap_seminar'], group: 'ap' },
  { date: '2026-04-30', session: 'afternoon', name: 'AP Research — Performance Task Submission Deadline', duration: 0, courseIds: ['ap_research'], group: 'ap' },
  { date: '2026-04-30', session: 'afternoon', name: 'AP CSP — Create Task Submission Deadline', duration: 0, courseIds: ['ap_csp'], group: 'ap' },
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
