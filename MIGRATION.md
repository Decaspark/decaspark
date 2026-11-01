# DecaSpark: Angular 22 Migration & Architecture Modernization

## 1. Baseline Audit (Legacy Stack at Commit `50fe081`)

### Previous Stack & Dependencies
- **Framework**: React `19.0.0`, `react-dom` `19.0.0`
- **Build Tool**: Vite `6.4.5` (`@vitejs/plugin-react` `4.3.4`), TypeScript `5.7.2`
- **Fonts**: `@fontsource-variable/sofia-sans` `5.1.1` (imported globally with italic & non-Latin subsets) + self-hosted `DecasparkSans` WOFF2 and duplicate legacy `.ttf` files
- **Rollback Checkpoint**: Git commit `50fe081fcc4121a12491979a2c4fd50992ba7d22` on `main`
- **Live Vercel URL Check**: `https://decaspark-six.vercel.app/` returned `404 DEPLOYMENT_NOT_FOUND` during audit; repository commit `50fe081` served as the authoritative baseline.

### Baseline Build & Architectural Gaps
| Dimension | Legacy React 19 + Vite 6 (`50fe081`) | Modernized Angular 22 (`@angular/build` + `@angular/ssr`) |
| --- | --- | --- |
| **Rendering Strategy** | Client-side rendering (CSR) only (`0.59 kB` empty `<div id="root">`) | Hybrid **Prerender (SSG)** (`95` static public routes) + **Dynamic SSR** (`/search`, `404`) + Event-Replay Hydration |
| **Routing** | None (clicking any of the `90` internal links or submitting search triggered full-page browser reloads / missing views) | Lazy-loaded Angular Router with `canMatch` catalog guard, parameterized routes, query-param search, and HTTP `404` status handling |
| **Change Detection** | React virtual DOM reconciliation | **Zoneless** Angular Signals (`signal`, `computed`, `input`, `output`, `viewChild`) + `ChangeDetectionStrategy.OnPush` everywhere (`no zone.js`) |
| **Component Structure** | Monolithic `1,082`-line `Navbar.tsx` directly mutating `document.body` and `window.location.href` | Modular feature-first architecture (`NavbarComponent`, `NavbarMegaMenuComponent`, `NavbarSearchPanelComponent`, `ShellComponent`, DI services) |
| **Fonts & Asset Payload** | `8` bundled `sofia-sans-*.woff2` files (`203.24 kB`) + `4` `DecasparkSans-*.woff2` (`61 kB`) + `3` redundant `.ttf` files | `4` `DecasparkSans-*.woff2` (`61 kB`, primary weights preloaded) + `1` Latin-only `SofiaSans` fallback (`40.37 kB`), **eliminating `162.87 kB` (`80%`) of unused font subsets** and removing duplicate `.ttf` files |
| **Global Stylesheet** | `46.11 kB` raw (`13.19 kB` gzip) | `15.31 kB` raw (`3.64 kB` gzip) global Tailwind CSS 4 + semantic CSS custom properties (`tokens.css`), plus critical CSS inlining |
| **SEO & Crawlability** | Single static `<title>`, no meta description per route, no canonicals, no `robots.txt`, no `sitemap.xml` | Per-route `SeoService` (`Title`, `Meta`, Open Graph, canonical `<link>`), `noindex` on `404`, `public/robots.txt`, `public/sitemap.xml` (`95` canonical URLs) |
| **Automated Testing** | `0` unit tests, `0` E2E tests | **16** Vitest unit/component tests + **5** Playwright E2E/keyboard/responsive/link-integrity suites |
| **Tooling & CI/CD** | No ESLint, Prettier, CI workflow, or `vercel.json` | ESLint 10 + `angular-eslint` 22 + Prettier 3.9 + GitHub Actions CI + Dependabot + `vercel.json` + `api/ssr.mjs` |
| **Security (`npm audit`)** | Unverified | **0 vulnerabilities** across all `491` prod and dev packages |

---

## 2. Preserved Brand, Content & URL Inventory

All legitimate DecaSpark brand assets, monochrome `#141413` / `#f3f0ee` / `#ffffff` visual tokens, `DecasparkSans` geometric sans typography, responsive breakpoints (`939px` / `940px`), and catalog items were preserved without introducing synthetic statistics or placeholder products:

- **Brand Emblem**: `/images/decaspark-emblem.png` (`44×40` desktop, `36×33` centered mobile)
- **Primary L1 Pillars (`5`)**: `Products`, `Services`, `For Teams`, `Resources`, `Company` (hover underline strictly scoped to L1 buttons)
- **Subcategories (`20`) & Leaf Links (`91`)**:
  - `90` internal routes across `/products/**`, `/services/**`, `/teams/**`, `/resources/**`, `/support/**`, and `/company/**`
  - `1` external link (`https://github.com/Decaspark`, secured with `target="_blank" rel="noopener noreferrer"` and screen-reader announcement)
- **Instant Search Index (`91` deduplicated entries)**:
  - Pre-query discovery panel (`8` popular destination links + `3` featured DecaSpark Press / Automation / Enablement cards)
  - Live client-side combobox filtering + `/search?q=...` dedicated search results route

---

## 3. Target Architecture & Rendering Matrix

```text
src/
├── index.html
├── main.ts
├── main.server.ts
├── server.ts
├── styles.css
├── styles/
│   ├── tokens.css                  # Semantic CSS custom properties & Tailwind CSS 4 @theme tokens
│   └── fonts.css                   # Self-hosted DecasparkSans WOFF2 + Latin SofiaSans fallback
└── app/
    ├── app.ts
    ├── app.config.ts               # Zoneless bootstrap, Router scroll restoration, Event-Replay Hydration
    ├── app.config.server.ts        # Server rendering & hybrid ServerRoute registration
    ├── app.routes.ts               # Lazy loadComponent routes + catalogRouteCanMatch guard
    ├── app.routes.server.ts        # Per-route Prerender vs Server render modes
    ├── core/
    │   ├── models/navigation.models.ts
    │   ├── data/navigation.data.ts # Preserved navigation & search catalog + route resolver
    │   └── services/
    │       ├── viewport.service.ts         # @angular/cdk BreakpointObserver -> Signals (SSR-safe)
    │       ├── scroll-lock.service.ts      # DOCUMENT-injected modal body scroll locking
    │       ├── navigation-state.service.ts # Signals-based L1/L2/mobile/search state & LiveAnnouncer
    │       └── seo.service.ts              # Title, Meta, Open Graph, robots & canonical link manager
    ├── shared/
    │   └── components/
    │       ├── icons/ui-icon.component.ts
    │       └── pillar-directory/pillar-directory.component.ts # Deferred cross-pillar navigation
    ├── layouts/
    │   ├── shell/shell.component.ts
    │   └── navbar/
    │       ├── navbar.component.{ts,css}
    │       ├── navbar-mega-menu.component.ts
    │       └── navbar-search-panel.component.ts
    └── features/
        ├── home/home-page.component.ts
        ├── catalog/catalog-page.component.ts
        ├── search/search-page.component.ts
        └── not-found/not-found-page.component.ts
```

### Per-Route Rendering Strategy (`src/app/app.routes.server.ts`)
| Route Pattern | Count | Render Mode | Rationale |
| --- | --- | --- | --- |
| `/` | `1` | `RenderMode.Prerender` | Instant static CDN edge delivery for Home canvas |
| `/:p1`, `/:p1/:p2`, `/:p1/:p2/:p3` (guarded by `catalogRouteCanMatch`) | `94` | `RenderMode.Prerender` | All public catalog, support, and company pages prerendered at build time (`95` static HTML documents total including `/`) |
| `/search` (`?q=...`) | Dynamic | `RenderMode.Server` | Request-time SSR renders query-specific `<title>` and search results while hydrating seamlessly on the client |
| `**` (unknown routes) | Dynamic | `RenderMode.Server` | Emits genuine HTTP `404` status code via Angular `RESPONSE_INIT` token + `<meta name="robots" content="noindex, nofollow">` |

---

## 4. Vercel & Node SSR Deployment Notes

- **Static Prerendered Routes**: Served directly from `dist/decaspark/browser` via Vercel's CDN filesystem layer with `Cache-Control: public, max-age=31536000, immutable` on hashed JS/CSS/font assets.
- **Dynamic SSR Routes (`/search`, `404`)**: Handled by `api/ssr.mjs`, which re-exports Angular's official `createNodeRequestHandler(app)` from `dist/decaspark/server/server.mjs`.
- **Self-Hosted / Container Runtime**: `npm run serve:ssr` runs `dist/decaspark/server/server.mjs` directly on `0.0.0.0:${PORT:-4000}`.
