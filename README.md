# Aron's Web Mods

A personal collection of browser tweaks and mods — small content scripts that
make various sites behave the way I prefer. Built with
[WXT](https://wxt.dev), TypeScript, React, ESLint, Prettier, and Vitest.

## Why WXT?

[WXT](https://wxt.dev) is a modern, actively-maintained web-extension framework
built on Vite. It gives us:

- **File-based entrypoints** — the `manifest.json` (and host permissions) is
  generated from the files in `entrypoints/`, so adding a mod is just adding a
  file.
- **Fast HMR** for UI and quick reloads for content/background scripts.
- **Cross-browser builds** (Chrome, Firefox, Edge, Safari) from one codebase,
  with Manifest V2/V3 differences handled automatically.
- **TypeScript and React** as first-class citizens.

## Project structure

```
entrypoints/
  background.ts          Background service worker (cross-mod coordination)
  example.content.ts     Example mod — a template for new tweaks
  popup/                 Toolbar popup (React) listing active mods
lib/
  dom.ts                 Shared DOM helpers used by mods
  dom.test.ts            Unit tests (Vitest)
wxt.config.ts            WXT + manifest configuration
```

Each **mod** is a content-script entrypoint scoped to the sites it runs on via
`matches`. WXT turns each `*.content.ts` file into a content script and adds the
needed host permissions to the manifest.

## Getting started

Requires Node 22+ and [pnpm](https://pnpm.io).

```bash
pnpm install      # installs deps and runs `wxt prepare`
pnpm dev          # launches Chrome with the extension loaded + HMR
pnpm dev:firefox  # same, for Firefox
```

`pnpm dev` opens a browser with the extension auto-loaded. Edit a file and it
reloads automatically.

### Loading a production build manually

```bash
pnpm build        # outputs to .output/chrome-mv3/
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load
unpacked**, and select `.output/chrome-mv3`.

## Adding a mod

1. Copy `entrypoints/example.content.ts` to `entrypoints/<name>.content.ts`.
2. Change `matches` to the site(s) you want to target.
3. Write your tweak in `main()`. Reuse helpers from `lib/`.
4. (Optional) Add the mod to the list in `entrypoints/popup/App.tsx`.

## Scripts

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Run the extension in Chrome with HMR         |
| `pnpm build`         | Production build to `.output/`               |
| `pnpm zip`           | Build and zip for store submission           |
| `pnpm compile`       | Type-check with `tsc --noEmit`               |
| `pnpm lint`          | Lint with ESLint                             |
| `pnpm format`        | Format with Prettier                         |
| `pnpm test`          | Run the test suite once                      |
| `pnpm test:watch`    | Run tests in watch mode                      |
| `pnpm test:coverage` | Run tests with a coverage report             |
| `pnpm check`         | Type-check + lint + format check + test (CI) |

## Quality tooling

- **ESLint** (flat config) with `typescript-eslint` and React Hooks rules.
- **Prettier** for formatting (`eslint-config-prettier` disables conflicting
  lint rules).
- **Vitest** with `jsdom` and Testing Library for unit/component tests; WXT's
  test utilities polyfill the extension APIs.
- **simple-git-hooks** + **lint-staged** run lint/format on staged files at
  commit time.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs the full `check` plus a
  build on every push and PR.

## License

[MIT](./LICENSE)
