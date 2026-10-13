# Encoding migration

Migration reads an existing deployed JSON mapping/manifest or SVG font. It never regenerates a font to guess historical codes. Preview first, compare names, then explicitly write a new map. No existing file is overwritten.

## CLI

```sh
# Read-only preview, with optional filename comparison
svgs2fonts --migrate=./deployed/iconfont.svg --migration-src=./icons --json

# After reviewing the preview, write a new file in an existing directory
mkdir -p ./fonts
svgs2fonts --migrate=./deployed/iconfont.svg --migration-output=./fonts/codepoints.json --json

# Verify the intended build, then generate using the migrated map
svgs2fonts ./icons ./fonts --check --codepoint-map=codepoints.json --json
svgs2fonts ./icons ./fonts --codepoint-map=codepoints.json --css --manifest --json
```

`--migrate` selects migration mode; it accepts only `--migration-src`, `--migration-output`, `--migration-format` and `--json`. Generation flags and positional arguments are rejected so a preview cannot accidentally generate fonts. `--help` and `--version` retain their usual behavior. `--migration-format=auto` uses the `.json` / `.svg` extension, case-insensitively; use an explicit `json` / `svg` for another filename. Output must end in `.json`, its parent directory must exist, and it must not already exist (including symlinks).

## API

```js
const { migrateCodepoints } = require('svgs2fonts');
const preview = await migrateCodepoints({ from: './deployed/iconfont.svg', src: './icons' });
if (!preview.success) throw new Error(preview.errors.map(error => error.message).join('; '));
console.log(preview.codepoints, preview.comparison, preview.warnings);

// Call only after inspecting the preview; output explicitly requests a write.
const written = await migrateCodepoints({
  from: './deployed/iconfont.svg', output: './fonts/codepoints.json',
});
if (!written.success) throw new Error(written.errors.map(error => error.message).join('; '));
```

Named and default exports both provide `migrateCodepoints()`. `MigrationOptions` and `MigrationReport` are exported TypeScript types. Expected errors are returned in the report rather than thrown. With no `output`, no directory, lock or temporary file is created.

## Supported sources

- A bare JSON mapping: `{ "home": 57344 }`.
- A JSON manifest/map with `codepoints`: `{ "schemaVersion": 1, "codepoints": { "home": 57344 } }`. The schema version may be absent in older manifests; if present, it must be `1`.
- A legacy `unicodeMapping`: `{ "unicodeMapping": { "home": "&#57344;", "bell": "&#xE001;" } }`. Numeric values and decimal/hex numeric entities are accepted in these JSON forms. Ambiguous wrappers, duplicate JSON keys and numeric strings such as `"57344"` fail.
- A single SVG font with named, encoded `<glyph>` entries. Literal Unicode and XML numeric entities are decoded; escaped `glyph-name` values are preserved. Ordinary SVG artwork, multiple fonts, missing names, ligatures and malformed XML fail. Unencoded glyphs are omitted with a warning. Standard SVG PUBLIC doctypes are accepted without fetching the DTD; internal DTD subsets and custom entity declarations fail.

Names are preserved exactly: no case conversion, renaming or Unicode normalization. Names must be nonempty and contain no whitespace/control characters, matching the current build's filename rules. Codes must be unique integers in the BMP (`0..65535`), excluding surrogate code units. Beyond-BMP fonts and binary TTF/WOFF/WOFF2 extraction are not supported. Inputs are read as UTF-8. A generated font with missing or unusable names cannot recover filename identity safely.

## Reports and safety

Reports use `schemaVersion: 1`, `mode: "migrate"`, `status`, `success`, `from`, `format`, `codepoints`, `iconCount`, `outputs`, `errors`, `warnings` and `durationMs`. CLI JSON emits one report; exit code `0` means import/write succeeded, `1` means failure. Warnings require caller review and do not change the success code.

When `src` is supplied, comparison scans regular `.svg` / `.SVG` files directly in that directory, by basename only:

- `matched`: deployed names with a current source file.
- `missing`: deployed names without a current source file. Their codes remain reserved in the output.
- `unmapped`: source names without deployed codes. Later generation allocates new codes.

This is not a shape/content comparison. Use a source-only directory; generated SVG fonts in it count as filenames too. Differences produce `MIGRATION_SOURCE_MISMATCH` and are not silently fixed. A preview is a snapshot; a later write rereads and validates the specified source. If deployed files can change between calls, compare both reports before using the result.

Output is a schema-1 stable map containing all imported `codepoints`. Content hashes from an input manifest are deliberately not copied: migration does not establish which current SVG artwork was deployed. The next successful build establishes the content baseline (`contentCompared: false` on that first build).

Writing shares the output-directory writer lock with font generation. A completed temporary file is linked into the requested new path exclusively, then temporary files and the lock are removed. A conflicting target is never replaced. If the filesystem cannot create the link, writing fails; no overwrite fallback is attempted. Process crashes may leave the lock/temporary directory and require the same manual inspection described in the automation guide.

| Code | Action |
| --- | --- |
| `INVALID_CONFIG` | Correct paths, source format or output filename. |
| `MIGRATION_INVALID_JSON` / `MIGRATION_INVALID_SVG` | Supply a valid supported deployed source. |
| `MIGRATION_EMPTY` | No encoded glyphs were found. |
| `MIGRATION_INVALID_NAME` / `MIGRATION_NAME_MISSING` | Recover the true deployed names; do not guess or rename them silently. |
| `MIGRATION_INVALID_CODEPOINT` | Supply unique supported single BMP codes; ligatures/beyond-BMP codes need a different migration path. |
| `MIGRATION_CONFLICT` | Resolve duplicate names/codes or choose an unambiguous mapping/font. |
| `MIGRATION_OUTPUT_EXISTS` | Inspect the existing file and choose a new path. No `--force` overwrite is provided. |
| `OUTPUT_LOCKED` | Wait for the writer; inspect stale locks only after confirming no build is active. |
| `BUILD_FAILED` | Inspect the original filesystem diagnostic; no output replacement is attempted. |
