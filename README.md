# Twenty

A phone app that teaches finance to an AI engineer in 30 daily lessons of about 20 minutes,
each followed by a quiz. It installs from the browser, works offline, and needs no login,
backend or API keys. Progress stays on the device.

This is education, not investment, legal or tax advice. Brew Lane Cafés Ltd is fictional.

**Live app: https://hardikk1233.github.io/twenty/**

## Put it on your phone

The app must be served over HTTPS before a phone will install it. This repository publishes
itself to GitHub Pages: the workflow in `.github/workflows/deploy.yml` runs the tests and the
content validator, builds, and deploys on every push to `main`. To set up a copy elsewhere,
push to a new GitHub repository and turn on **Settings, Pages, Source: GitHub Actions**.

Any static HTTPS host also works. Build, then upload `dist/`:

- Netlify: drag `dist` onto app.netlify.com/drop.
- Cloudflare Pages or Vercel: point them at `dist`.

Routing uses the URL hash and paths are relative, so no rewrite rules are needed.

Then install it:

- **Android (Chrome):** open the site, open the menu, then tap **Install app**. It appears in
  your app drawer and opens full-screen.
- **iPhone (Safari):** open the site, tap **Share**, then **Add to Home Screen**.

Once opened, everything is cached: all 30 lessons, the fonts and the icons. It works in
airplane mode. When a new version is published, the app updates itself the next time it opens
with a connection. Progress is never lost: it is saved after every tap.

## What is in it

- **Today:** today's lesson, your streak, and review cards when they are due.
- **Lesson:** six pages (why it matters, the idea, worked example, terms, builder's lens, with a
  client), then a quiz.
- **Quiz:** six questions, plus two review questions from earlier days from Day 2 on, then a
  'Say it out loud' prompt. Results list the concepts to revisit.
- **Review:** a missed question comes back the next day, then 3 days later, then every 7 days.
  It retires after two correct answers in a row. Spoken answers marked 'shaky' come back too.
- **Path:** the 30 days drawn as a route map through the five phases. Done stops are filled
  and the next stop is ringed in blue. The line is solid up to where you are.
- **Glossary:** every term from every lesson, searchable, A to Z, each linking to the day it
  was taught.
- **Day 30:** pick one of three mock clients and write a one-page solution brief (saved as you
  type), compare it with a model brief, then take a 20-question final test drawn from all
  30 days. The results list every term you learned.
- **Settings:** theme, unlock all days, export and import progress (to move phones), and reset.

## Run it locally

Requires Node 20 or later.

```sh
npm install
npm run dev          # http://localhost:5173, plus a network address for a phone on the same Wi-Fi
```

| Script             | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `npm run validate` | Checks every lesson file. Add `-- --only=7-11` for some days, `-- --verbose` for detail. |
| `npm test`         | Unit tests: streaks, review scheduling, quiz building, search, parsing. |
| `npm run build`    | Validate, type-check, then build the static site and service worker into `dist/`. |
| `npm run preview`  | Serve the built `dist/` locally.                                     |
| `npm run icons`    | Regenerate the app icons from `scripts/icons.ts`.                    |

## Project layout

```
content/
  AUTHORING.md       How to write or edit a lesson, with the glossary plan and curriculum notes
  brewlane.ts        Brew Lane figures: section 7 inputs, derived ratios, identities
  days/dayNN.json    One file per lesson
scripts/
  validate.ts        Content validator (runs before every build)
  icons.ts           Generates the app icons
src/
  content/           Types, curriculum, the content loader and the glossary index
  lib/               Pure logic: progress, review and quiz building, dates, formats, router
  state/             The localStorage store (one versioned key: twenty:v1)
  screens/           Today, Lesson, Quiz and review, Path, Glossary, Settings, Capstone
  components/        Statement table, rich text, bars, icons
  styles/            Tokens (light and dark), layout, self-hosted IBM Plex Sans
public/              Icons and favicon
```

## Writing lessons

See [content/AUTHORING.md](content/AUTHORING.md). In short:

- one JSON file per day, following the `Day` type in `src/content/types.ts`;
- six pages, six questions (2 concept, 2 calculation, 1 client, 1 builder) and a speaking
  prompt.

The validator enforces:

- the schema;
- the question mix, and one or two sentences per explanation;
- 850 words of reading at most;
- unique glossary terms;
- the brief's "ask" for each day, word for word;
- characters the font can draw;
- that every Brew Lane figure in a statement table matches section 7 for its period;
- that every calculation answer equals its `check` expression.

## Design notes

- Statement tables follow printed accounts: tabular figures, negatives in brackets, a single
  rule above subtotals, a double rule under totals, and a caption with unit and period.
- Blue marks only what the learner does, as in financial models where blue means an input.
  Green and red appear only in quiz feedback. Dark mode uses lighter shades of both for
  readable contrast.
- One typeface (IBM Plex Sans, self-hosted, SIL Open Font License), one accent colour, no
  shadows or gradients, motion only in response to a tap.
