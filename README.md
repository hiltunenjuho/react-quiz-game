# knowdium!

**A game-first trivia prototype built with React.** Knowdium is being developed for quick, playful rounds and challenge—not as a learning platform.

## Current prototype

The app currently includes:

- A locally defined set of 12 multiple-choice questions across several categories.
- Four answer choices per question, with category and difficulty shown during play.
- A sequential round, score tracking, a results screen, and a replay action.
- A high score that remains in memory while the page is open.

Question content is currently stored in `src/data/questions.ts`. The prototype does not yet include answer-by-answer feedback, category selection, randomized rounds, persistent scores, or a backend.

## Technology

- React 19 and TypeScript
- Vite
- CSS
- npm

## Run locally

Requires Node.js and npm.

```bash
npm ci
npm run dev
```

Create and preview a production build:

```bash
npm run build
npm run preview
```

Run the configured linter:

```bash
npm run lint
```

## Project structure

```text
src/
├── App.tsx
├── App.css
├── index.css
├── data/
│   ├── questions.ts
│   └── types/
│       └── Question.ts
└── main.tsx
```

## Next development focus

The next useful steps are to expand the question set, make answer feedback and round state clearer, improve responsive and keyboard-accessible play, and decide whether scores should persist between visits. These are future directions, not features of the current prototype.

No license has been specified yet.
