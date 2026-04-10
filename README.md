# Examiner

A free, open-source exam calendar tool for students taking **May 2026** exams (IB, AP, and more).

View the full exam schedule, build a personal calendar with your subjects, get study statistics, and export to Google Calendar, Outlook, SVG, or spreadsheet — all running entirely in your browser with zero data collection.

**[Live Site →](https://nagusamecs.github.io/Examiner)**

---

## Features

### Full Exam Calendar
- Color-coded calendar view of every May 2026 exam
- Subject groups distinguished by color: Languages, Individuals & Societies, Sciences, Mathematics, Arts, Interdisciplinary, AP
- Hover on any day to see the complete exam list with durations
- Search any subject to highlight its exam days on the calendar

### Personal Calendar
- Select your subjects from a searchable dropdown
- Generate a filtered calendar showing only your exams
- Selections saved in your browser for return visits

### Study Statistics
- Total number of exams
- Total exam time across all subjects
- Countdown to your first exam
- Breakdown of exams and time per subject
- Days remaining to study for each subject's first paper

### Export Options
- **SVG** — Download your schedule as a vector image
- **Google Calendar** — Import via .ics file
- **Microsoft Outlook** — Import via .ics file
- **Spreadsheet** — Download as CSV (open in Excel, Google Sheets, etc.)

---

## Usage

Open `index.html` in any browser. No build step, no dependencies, no server needed.

1. **View Exam Calendar** — See the complete May 2026 schedule at a glance
2. **Build My Calendar** — Pick your subjects, generate your personal schedule, view stats, and export

---

## Data Source

All exam data is transcribed from the official **IB Diploma Programme and Career-related Programme May 2026 Examination Schedule (Final Version)** covering all exam zones (A, B, C).

Session times in .ics exports default to Zone B (Morning 09:00, Afternoon 14:00). Adjust after import if your school is in a different zone.

---

## Tech

- Pure HTML, CSS, and JavaScript — no frameworks, no build tools
- All computation runs client-side in the browser
- Subjects saved to `localStorage` (never leaves your device)
- Design based on [nagusamecs.github.io](https://nagusamecs.github.io)

---

## Disclaimer

This tool is **not affiliated with or endorsed by the International Baccalaureate Organization (IBO) or the College Board**. It is an independent, free resource for students. Always verify your exam schedule with your school coordinator.

---

## License

[MIT](LICENSE)

Built by [NagusameCS](https://nagusamecs.github.io)