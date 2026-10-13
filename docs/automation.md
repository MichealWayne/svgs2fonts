# Automation and AI callers

Use the same CLI/API for people, agents and CI. No model, hosted service, MCP server or credentials are required. Inputs and outputs stay local.

## Recommended flow

1. Select a source and an explicit output directory. Use a stable codepoint map for repeated icon updates; seed existing production mappings before migration.
2. Run `svgs2fonts icons fonts --check --json`. This performs structural checks only, with no writes. Interpret warnings before proceeding.
3. Run `svgs2fonts icons fonts --formats=woff2,woff --nodemo --css --manifest --codepoint-map=codepoints.json --json`.
4. Require `success === true` for CI success; inspect `directories` for partial failures or skipped items. Verify listed outputs exist.
5. For visual review, generate previews without `--nodemo`. Font structure checks do not prove that strokes, gradients or artwork look correct.

Use `generate(options)` / `check(options)` in JavaScript or TypeScript instead of parsing logs. `init()` retains legacy partial-success behavior and is less suitable for strict automation.

For an existing deployed font, use `migrateCodepoints({ from, src? })` or `--migrate=deployed.svg --migration-src=icons --json` to preview the actual old encodings. Inspect errors, warnings and filename differences before explicitly requesting `output` / `--migration-output`. Migration has a separate `mode: "migrate"` report with `codepoints`, `iconCount` and optional `comparison`; it does not run font generation. Existing output files are never replaced. See the [migration guide](./migration.md).

## Result contract

```json
{
  "schemaVersion": 1,
  "status": "failed",
  "success": false,
  "mode": "generate",
  "directories": [],
  "outputs": [],
  "errors": [{ "code": "INVALID_CONFIG", "message": "Source directory does not exist: ..." }],
  "warnings": [],
  "durationMs": 0
}
```

The example is schematic. Successful items contain source/output paths, codepoints, icon counts and actual outputs. `changes` appears with stable maps; `timings` appears with performance analysis. Treat additional report fields and warning codes as forward-compatible.

`sourceHashes` contains SHA-256 hashes of current SVG bytes. When a stable map is configured, `changes.changed` lists same-name content edits relative to its last successful build. Check `changes.contentCompared`: `false` means no previous content baseline (including older maps), not verified absence of edits. The first successful build stores the baseline in the existing schema-1 map; read-only checks and failures never advance it. Hashing includes formatting/comments and is not a visual or glyph-outline comparison. Removed names are reported relative to the last active set, while their codepoints remain reserved. To build a CI gate, inspect `added`, `removed` and `changed` during `check()` before approving generation; generation itself does not reject intentional content edits.

CLI stdout contains one JSON object in `--json` mode, including argument failures. stderr may include diagnostics or dependency/runtime warnings. `--help` and `--version` retain text output. Exit code `0` means every requested item succeeded; `1` means partial/complete failure. A check success means structural checks passed, not that conversion or rendering was verified.

## Errors and recovery

| Code | Meaning / action |
| --- | --- |
| `INVALID_ARGUMENT` | Correct CLI syntax using `--help`. |
| `INVALID_CONFIG` | Check paths, finite integer options, formats and filenames. |
| `NO_SVG_FILES` | Place supported SVG files directly in the source directory. |
| `INVALID_SVG` | Repair the named document/path and rerun. |
| `UNSUPPORTED_SVG` | Embedded images, scripts, foreign objects or entity declarations are unsupported; prepare a plain vector icon. |
| `INVALID_ICON_NAME` / `ICON_NAME_CONFLICT` | Use unique names without whitespace/control characters. |
| `OUTPUT_COLLISION` | Choose distinct input/output files and distinct batch targets. |
| `INVALID_CODEPOINT_MAP` / `CODEPOINT_CONFLICT` | Repair or deliberately migrate the map; do not silently delete it. |
| `CODEPOINT_RANGE_EXHAUSTED` | Review allocation and reservations; do not recycle deployed codes automatically. |
| `FONT_CONVERSION_FAILED` | Inspect format-specific errors. Prior target files are preserved. |
| `SVG_TIMEOUT` | Investigate input size/complexity; timeout is currently 30 seconds for SVG conversion. |
| `DEMO_FAILED` | Check preview filenames and write errors; generation is rolled back. |
| `INPUT_CHANGED` | An inspected input changed during conversion; old outputs and mapping are preserved. Stop editing inputs and rerun. |
| `OUTPUT_LOCKED` | Wait for the active build. Inspect stale locks only after confirming no writer is active. |
| `OUTPUT_COMMIT_FAILED` | File replacement failed; rollback restored earlier files. Fix the reported target and rerun. |
| `ROLLBACK_FAILED` | Backup files and lock are retained. Stop writing and recover manually from the reported path. |
| `BUILD_FAILED` | Unexpected filesystem/runtime failure; retain the original diagnostic. |

Warnings include `SVG_REVIEW_REQUIRED`, `GENERATED_INPUT_SKIPPED`, `EXPERIMENTAL_OPTION_IGNORED`, `DEPRECATED_OPTION`, `BATCH_SKIPPED` and `TEMP_CLEANUP_FAILED`.

## Boundaries

- Scanning is flat, not recursive. Batch inputs are explicit.
- Checks use structural heuristics; conversion performs the actual SVG parsing.
- Stable maps are per output directory, include removed-name reservations, and should be version-controlled.
- Default encoding remains legacy name hashing, with per-build allocation state. Hash-collision output may differ from earlier process-global allocation; preserve deployed mappings explicitly.
- All requested assets for one directory are staged together. Other formats from previous runs remain untouched.
- Stop-on-error lets the current batch finish; later items are skipped. Different directories commit independently.
- Locking is local; crashes/power loss are not guaranteed to roll back automatically.
- Cache, subsetting, optimization and maxConcurrency flags are accepted but not implemented. They are not successful optimization claims.
