# Decaspark

Modernized **Angular 22** web application for **Decaspark**, featuring digital operating systems, design kits, authored strategy books, editorial production, and custom AI workflow automation for modern teams.

## Tech Stack

- **Framework**: Angular `22.2` (Standalone Components, Zoneless Change Detection, Signals, `@angular/router`, `@angular/cdk`)
- **Hybrid Rendering**: `@angular/ssr` (`95` build-time prerendered static routes + dynamic Node/Express SSR for `/search` and `404` handling + Event-Replay Client Hydration)
- **Builder**: `@angular/build:application` with TypeScript `6.0` (`strict: true`, `strictTemplates: true`, `noUncheckedIndexedAccess: true`)
- **Styling**: Tailwind CSS `4.3` + semantic CSS custom properties (`src/styles/tokens.css`) + self-hosted `DecasparkSans` WOFF2 typography
- **Testing & Quality**: Vitest `5` (`@angular/build:unit-test`), Playwright E2E, ESLint `10` + `angular-eslint` `22`, Prettier `3.9`

## Local Development

### Prerequisites
- Node.js `>= 22.12.0`
- `npm` `>= 10`

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```
Runs `ng serve --host 0.0.0.0 --port 4200` with live reload and SSR middleware.

### Production Build (Browser + Server + Static Prerendering)
```bash
npm run build
```
Outputs static & prerendered client assets to `dist/decaspark/browser` and the Node SSR bundle to `dist/decaspark/server/server.mjs`.

### Run Production SSR Server Locally
```bash
npm run serve:ssr
```
Starts the Express + `AngularNodeAppEngine` server on `http://0.0.0.0:4000` (configurable via `PORT` and `HOST`).

## Verification & Quality Scripts

| Command | Description |
| --- | --- |
| `npm run lint` | Lint all TypeScript files and inline Angular templates with ESLint + `angular-eslint` |
| `npm run format:check` | Verify repository formatting with Prettier |
| `npm run typecheck` | Run strict `tsc --noEmit` across application and test configs |
| `npm test` | Run Vitest unit and component tests via `@angular/build:unit-test` |
| `npm run test:e2e` | Run Playwright E2E, keyboard accessibility, responsive, and link-integrity tests |

## Deployment

Configured for **Vercel** via `vercel.json` and `api/ssr.mjs`:
- Prerendered HTML pages (`95` routes) and hashed immutable static assets are served directly from `dist/decaspark/browser`.
- Dynamic `/search?q=...` requests and HTTP `404` routes are handled by `api/ssr.mjs` (`dist/decaspark/server/server.mjs`).

See [`MIGRATION.md`](./MIGRATION.md) for the complete React-to-Angular migration audit, architecture details, and measured build benchmarks.
