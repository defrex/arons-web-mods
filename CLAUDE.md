# CLAUDE.md

Guidance for working in this repository.

## What this is

A personal browser extension — a collection of small tweaks and mods that make
various sites behave the way the author prefers. Built with
[WXT](https://wxt.dev) (Vite-based web-extension framework) + TypeScript +
React. Published on GitHub but intended for personal use.

## Core concept: a "mod" is a content script

Each mod is a content-script entrypoint in `entrypoints/`, scoped to the sites
it runs on via `matches`. WXT generates `manifest.json` and host permissions
from these files, so **adding a mod is just adding a file** — there's no central
registry to update (except the optional display list in the popup).

## Project structure

```
entrypoints/
  background.ts          Background service worker (cross-mod coordination only)
  example.content.ts     Example mod — the template for new tweaks
  popup/                 React popup (App.tsx lists active mods)
lib/
  dom.ts                 Shared DOM helpers (e.g. waitForElement)
  *.test.ts              Vitest unit tests, colocated with source
wxt.config.ts            WXT config + manifest fields (name, permissions)
eslint.config.js         ESLint flat config
vitest.config.ts         Vitest config (jsdom + WxtVitest)
```

## Adding a mod

1. Copy `entrypoints/example.content.ts` to `entrypoints/<name>.content.ts`.
2. Set `matches` to the target site(s).
3. Write the tweak in `main()`. Reuse helpers from `lib/`.
4. Optionally add it to the `MODS` list in `entrypoints/popup/App.tsx`.

Use `waitForElement` from `@/lib/dom` for elements that render after load —
most site tweaks need it. `@/` and `~/` alias the project root.

## Commands

- `pnpm dev` — run in Chrome with HMR (`dev:firefox` for Firefox)
- `pnpm build` — production build to `.output/chrome-mv3/`
- `pnpm zip` — build + zip for store submission
- `pnpm compile` — type-check (`tsc --noEmit`)
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm test` / `pnpm test:watch` — Vitest
- `pnpm check` — full gate: compile + lint + format:check + test (matches CI)

Run `pnpm check` before committing. A `pre-commit` hook (simple-git-hooks +
lint-staged) lints/formats staged files automatically. CI
(`.github/workflows/ci.yml`) runs `check` plus a build on push/PR.

## Conventions

- **TypeScript everywhere.** Content scripts are plain TS; React is only for UI
  pages (popup/options), to keep content-script bundles small.
- **WXT auto-imports** are global — `defineContentScript`, `defineBackground`,
  `browser`, `storage`, etc. don't need importing. ESLint's `no-undef` is off
  for TS because of this; TypeScript handles undefined-symbol checking via the
  generated `.wxt/` types.
- **Persisted state** (e.g. per-mod enable/disable) should use WXT's `storage`
  API and be added to the `storage` permission in `wxt.config.ts`.
- **Tests** are colocated (`lib/dom.test.ts`) and run in jsdom; `WxtVitest`
  polyfills extension APIs.
- Requires **Node 22+** and **pnpm**. Don't switch package managers.
- `.output/`, `.wxt/`, and `node_modules/` are generated — never edit or commit.
