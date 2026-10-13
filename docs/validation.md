# Validation for the local 2.4.0 changes

Recorded on 2026-10-13. This records executed checks separately from the configured CI matrix; it is not a guarantee for every operating system or browser.

| Check | Executed result |
| --- | --- |
| TypeScript build | Passed on Node 22.22.1 |
| Jest regression tests | 19 suites / 251 tests passed on Node 16.20.2 and 22.22.1, including migration conflicts, read-only previews, exclusive output and real-font round trips |
| Real npm tarball consumer | Passed on Node 22.22.1: offline installation, all five font formats, CommonJS, CLI shim/entry, strict TypeScript (including migration types), read-only content comparison, migration API/CLI and MIT metadata/file consistency |
| Node 24 runtime | Passed on Node 24.21.0: conversion, assets, source hashes, checks, encoding migration and CLI JSON |
| Chromium desktop | Both preview modes passed layout, font loading, search, keyboard copy, clipboard rejection fallback and automated axe rules |
| Firefox desktop | Both preview modes passed the same checks; font-family quoting is normalized in the test assertion |
| Chromium mobile emulation | Both preview modes passed the same checks, including 320px widths; desktop/mobile screenshots were visually inspected |
| WebKit desktop / mobile emulation | Not verified: native browser launch crashes before creating a page on the local macOS 14.2 host |
| GitHub Actions | YAML parsed and job structure inspected locally; remote jobs have not been triggered |
| Diff / documentation / credentials | Diff whitespace check and local documentation link checks passed; no likely credentials found in changed files |

The full browser command ran 20 tests: 12 passed, and eight WebKit cases failed at browser launch. A standalone `webkit.launch()` also failed with exit code 138 and `Bus error: 10`, without loading the preview. Playwright 1.64.0 reported a frozen WebKit build for the host's macOS version. This establishes a local launch limitation; it does not establish preview compatibility with WebKit. The WebKit tests remain enabled and fail normally rather than being silently skipped. Run them on a supported host or the configured Linux CI runner before claiming full browser acceptance.

To reproduce the verified browser subset after installing the browser-test dependencies and engines:

```sh
npm run test:browser -- --project=chromium --project=firefox --project=mobile-chromium
```

To run the entire five-project browser matrix:

```sh
npm run test:browser
```

The default HTML report is in `browser-tests/playwright-report`; traces and screenshots are ignored by Git and excluded from npm packaging. Filtered runs overwrite those local results unless `PLAYWRIGHT_HTML_OUTPUT_DIR` and Playwright's `--output` are set to different paths.

The CI matrix covers Linux Node 16/22/24 regression tests, Linux/macOS/Windows package verification and all five browser projects on Linux. Windows and the remote Linux runners have not been executed in this local session. Mobile emulation and automated accessibility checks do not replace real-device or manual assistive-technology review.
