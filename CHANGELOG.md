# Changelog

## 2.4.0

### ⚠️ Behavior changes — read before upgrading

- **Default codepoints may differ when icon names collide.** Allocation state is now isolated per build instead of shared across the process, so hash collisions can resolve differently than before. If your code hardcodes codepoints, import your deployed mapping before regenerating:
  `npx svgs2fonts --migrate=<deployed font or manifest> --migration-output=<dist>/codepoints.json` (the `<dist>` directory must already exist), then build with `--codepoint-map=codepoints.json`. See the [migration guide](./docs/migration.md).
- **Stricter input validation fails early.** Invalid numeric options, unsafe output paths, icon filenames containing whitespace and SVGs with unsupported embedded content (images, scripts, foreign objects, entity declarations) are now rejected instead of producing broken output.
- **The CLI exits nonzero on partial batch failure.** The legacy `init()` API still resolves `true` in that case when `continueOnError` is enabled; use `generate()` to detect it.
- **Preview pages were redesigned** as a static, searchable grid (no animations).

Unchanged: default formats, default Unicode start (`10000`), CLI output paths and the `init()` return type.

### Added

- `generate()` returns a serializable build report; `check()` / `--check` performs read-only input checks.
- CLI `--json` for machine-readable output.
- `--css` writes standalone application CSS; `--manifest` writes a versioned icon manifest.
- Stable codepoint maps (`--codepoint-map`, `codepoints` seeds): existing codes are kept, removed codes are reserved, and reports list added / removed / changed icons via SHA-256 content hashes.
- Codepoint migration from deployed JSON manifests or SVG fonts: `--migrate` / `migrateCodepoints()`, read-only by default, with filename comparison and non-overwriting output.
- Safe output: files are staged and replaced only after success, rolled back on replacement failure, and protected by an output-directory lock.

### Fixed

- Missing public option type declarations in the published package.
- Progress callbacks in single-directory mode; error/verbose logging that only worked in development.
- Batch: an all-failed batch was reported as success; stop-on-error did not stop later batches; output collisions; missing diagnostics for absent input directories.
- Font metric overrides, format-aware CSS, escaping of icon names, partial preview write failures.
- Repeated in-place CLI builds re-reading the generated SVG font as an icon.
- Preview layout at narrow widths, keyboard focus, copy button labels, search/copy status announcements.
- Editing inputs during a build now fails before replacing outputs.

### Deprecated

- `debug` / `--debug`: use `verbose` / `--verbose`. The old names still work with a warning.
- Unimplemented options (`--cache`, `--concurrency`, `--optimize`, `--subset`, etc.) are still accepted but now emit `EXPERIMENTAL_OPTION_IGNORED` warnings to make clear they have no effect.

### Other

- Package `license` metadata now matches the MIT `LICENSE` file.
- Added package-install, runtime, cross-platform CI and browser preview tests (see [CONTRIBUTING](./CONTRIBUTING.md)).
