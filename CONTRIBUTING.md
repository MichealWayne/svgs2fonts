# Contributing

## Setup

```sh
npm ci
npm run build
```

The tool supports Node.js ≥16. Browser tests need Node.js ≥20 (see below).

## Tests

| Command                | What it checks                                                                                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`             | Jest regression tests                                                                                                                                                                                                                     |
| `npm run test:runtime` | Runtime smoke test: conversion, assets, checks, migration and CLI JSON                                                                                                                                                                    |
| `npm run test:package` | Builds and installs the real tarball offline in a temporary consumer project; checks the CLI, CommonJS, strict TypeScript and conversion output. Run `npm ci` first to fill the cache; set `SVGS2FONTS_TEST_CACHE` for a custom npm cache |
| `npm run test:example` | Regenerates the tracked fixtures in `examples/dest`                                                                                                                                                                                       |

### Browser tests

Browser tests live in `browser-tests/` with their own dependencies and require Node.js ≥20:

```sh
npm ci --prefix browser-tests
npm --prefix browser-tests run install:browsers
npm run test:browser
```

They cover Chromium / Firefox / WebKit desktop plus Chromium / WebKit mobile emulation, checking both preview pages for font loading, 320px layout, search, keyboard copy, denied-clipboard fallback and automated accessibility rules (axe). Run a subset with e.g. `npm run test:browser -- --project=chromium --project=firefox`. Reports are written to `browser-tests/playwright-report`.

Emulation does not replace real-device testing, and automated rules do not replace manual accessibility review. See [docs/validation.md](./docs/validation.md) for the latest recorded results and known local limitations.

## CI

`.github/workflows/validate.yml` runs Jest on Linux (Node 16 / 22 / 24), build/runtime/package checks on Linux, macOS and Windows, and the browser projects on Linux. It validates only; it does not publish.

## Project layout

| Path             | Purpose                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `bin/index.js`   | CLI                                                                    |
| `src/config`     | Option validation and legacy option conversion                         |
| `src/processors` | Single-directory and batch orchestration                               |
| `src/builders`   | Font conversion, CSS and preview generation                            |
| `src/core`       | Reports, codepoint maps, migration, diagnostics, output transactions   |
| `src/types`      | Public types (`OptionType.ts`, `BuildReport.ts`, `MigrationReport.ts`) |
| `dist`           | Build output; tracked in the repository                                |

## Publishing

`prepack` builds and verifies public entries and types automatically. Update `CHANGELOG.md` and both READMEs (`README.md`, `README-en.md`) together when user-facing behavior changes.
