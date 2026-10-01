# FormulaLabs

**Learn the method, not just the answer.**

FormulaLabs (FormulaX) is a web app for Indian CBSE, NEET and JEE students. It tells you *how* to approach a problem and which formulas apply, then steps aside so you do the solving.

**Live:** [formulax-two.vercel.app](https://formulax-two.vercel.app)

---

## About me

Hi, I'm **Shiven Gupta**, a Class 12 student from India and the solo developer behind FormulaLabs. I study Physics, Chemistry and Biology, and I build software on the side.

It's 2026, my Class 12 year, and I'm balancing school with shipping this. I designed, built and deployed every part of it myself, from the UI to the AI integrations, because I wanted a tool I'd actually use as a student.

## Why I built this

Most students use AI for fast answers. They copy the solution, feel like they understood it, and then freeze when the same concept shows up in an exam. The learning happens when you solve it yourself.

So I built a tool that works the other way around. It never hands you a final number. It shows you the way in, and you do the rest.

## The Approach Finder

This is the core of the app. Type a question or attach an image of it, from any Physics, Chemistry, Maths or Biology chapter in your syllabus.

You get back:

- **The approach:** 3 to 6 concrete steps on how to solve it, not an essay
- **Formulas referenced:** the exact formulas you need, what each one means, and why it applies to *your* question

You never get the numerical answer. That part is yours.

## Features

| Feature | What it does |
| --- | --- |
| **Approach Finder** | Finds the method and formulas for any problem |
| **Quiz Mode** | MCQ quizzes by chapter or custom topic, with easy, medium or hard difficulty and 5 or 10 questions |
| **Formula Explorer** | Every chapter for CBSE Class 9 to 12 across Physics, Chemistry, Biology and Maths, with sheets you can view or download |
| **Search** | Find any chapter by class and subject |
| **History** | Every problem you've asked, saved with its approach and formulas |
| **My Sheets** | Save formula sheets to your profile |
| **Community** | Ask doubts, follow peers, see how others solved the same problem *(in progress)* |

## Tech Stack

**Frontend**
- React 19 with Vite
- React Router DOM
- Framer Motion
- Tailwind CSS 4 with Radix UI components
- Lucide React icons

**Backend and services**
- Firebase Authentication (Google login)
- Firestore for user data, quiz results, history, reports and community posts
- Sarvam AI (105B) for the Approach Finder and quiz generation
- Google Gemini 2.0 Flash Lite for formula sheet generation

**Deployment**
- Vercel (production)
- Bun or npm as the package manager

## Local Setup

### Prerequisites

- Node.js 18+ or Bun
- A Firebase project with Firestore enabled
- A Sarvam AI API key
- A Google Gemini API key

### Environment variables

Create a `.env.local` file in the project root:

```env
VITE_SARVAM_API_KEY=your_sarvam_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

The Firebase config lives in `src/firebase/config.js` and points to the production project.

### Install and run

```bash
npm install
npm run dev
```

Using Bun? Run `bun install` and `bun run dev` instead. The dev server starts at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

The output lands in `dist/`. Vercel deploys automatically from the default branch.

## Project Structure

```
formulax/
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Router setup
│   ├── index.css                 # Global styles
│   ├── App.css                   # App styles
│   ├── components/
│   │   ├── ui/                   # Radix UI wrappers (button, card, dialog, dropdown-menu, tooltip)
│   │   ├── DashboardLayout.jsx   # Authenticated layout
│   │   ├── TestCreator.jsx       # Test creation
│   │   └── ComingSoon.jsx        # Placeholder page
│   ├── context/
│   │   ├── AuthContext.jsx       # Google login and logout
│   │   └── DashboardContext.jsx  # User, theme, selected class and subject
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Onboarding.jsx        # Class and subject selection on signup
│   │   ├── Pricing.jsx
│   │   ├── Terms.jsx
│   │   ├── Privacy.jsx
│   │   └── dashboard/
│   │       ├── ApproachPage.jsx        # Approach Finder
│   │       ├── QuizPage.jsx            # Quiz generator
│   │       ├── ExplorerPage.jsx        # Formula Explorer
│   │       ├── SearchPage.jsx          # Chapter search
│   │       ├── HistoryPage.jsx         # Saved questions
│   │       ├── MySheetsPage.jsx        # Saved formula sheets
│   │       ├── CommunityPage.jsx       # Doubts and posts (in progress)
│   │       ├── TeacherPage.jsx         # Teacher mode (in progress)
│   │       ├── TakeTestPage.jsx        # Classroom test mode
│   │       ├── AdminPage.jsx           # Admin controls (in progress)
│   │       └── FormulaFinderPage.jsx   # Alias for ApproachPage
│   ├── services/
│   │   ├── groq.js               # Sarvam AI integration (Approach Finder, quizzes)
│   │   └── gemini.js             # Gemini integration (formula sheets)
│   ├── firebase/
│   │   └── config.js             # Firebase and Firestore setup
│   ├── data/
│   │   └── syllabus.js           # CBSE syllabus (classes, subjects, chapters)
│   ├── utils/
│   │   └── dashboardHelpers.js   # Firebase doc ID helpers
│   └── assets/                   # Images and icons
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── vite.config.js                # Vite, React and Tailwind config
├── vercel.json                   # SPA rewrites for Vercel
├── index.html
├── package.json
└── jsconfig.json
```

## Roadmap

- [ ] **Community and Doubts:** peer-to-peer doubt solving with reputation and follows
- [ ] **Teacher Mode:** educators create classrooms, set tests and track progress
- [ ] **Test Classrooms:** full test creation and student performance tracking
- [ ] **Admin Panel:** moderation and analytics
- [ ] **Mobile App:** native iOS and Android

### Known limitations

- Formula sheets are stored as static files, so dynamic generation is only partial
- Community is scaffolded but not functional yet
- Teacher and Admin pages exist, but their features are incomplete

## Feedback

This is a solo build. If you find a bug, want a feature, or you're a teacher with classroom feedback, [open an issue](../../issues).

## License

All rights reserved. The code is closed source. Contact me for licensing inquiries.

---

Built by **Shiven Gupta** · 2026
