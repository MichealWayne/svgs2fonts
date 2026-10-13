# svgs2fonts

Convert a directory of SVG icons into an icon font (woff2, woff, ttf, eot, svg), with optional application CSS, an icon manifest and preview pages. Works from the CLI, JavaScript and TypeScript. [中文](./README.md)

Not sure whether to use an icon font or SVG? See [When to use icon fonts](#when-to-use-icon-fonts).

Requires Node.js 16 or later. See the [CHANGELOG](./CHANGELOG.md) for release notes.

**Contents**: [When to use icon fonts](#when-to-use-icon-fonts) · [Quick start](#quick-start) · [Common commands](#common-commands) · [JavaScript / TypeScript API](#javascript--typescript-api) · [Stable codepoints](#stable-codepoints) · [Options](#options) · [FAQ](#faq) · [More docs](#more-docs)

## When to use icon fonts

An icon font treats icons as text: the browser loads one font file and CSS class names display the matching characters. Icon fonts and plain SVG each have trade-offs; use this section to decide whether your project is a good fit.

### Good fit

- **Single-color icons that should follow text color and size**: icons inherit the element's `color` and `font-size`, so hover colors, theme switching and scaling with text are plain CSS — buttons, menus, table actions, form states.
- **Icons mixed with text**: icons take part in text layout like characters and line up with surrounding text.
- **One icon set shared across many pages or stacks**: server-rendered pages, traditional multi-page sites, CMS templates, jQuery projects, or several Vue/React projects can all include one CSS file and use a class name, without depending on a framework or bundler.
- **Pages that use many icons**: all icons live in one font file — one request, cached and reused across pages.
- **CSS-only contexts**: icons can be inserted with `::before` `content` in pure CSS, e.g. in themes or style overrides for third-party systems.
- **Projects already using icon fonts**: for example, moving from fonts downloaded from an online icon platform to SVG sources maintained and built in your repository, while keeping deployed codepoints unchanged (see [Migrating an existing project](#migrating-an-existing-project)).

### Poor fit — prefer SVG

- **Multicolor, gradient or stroked icons**: fonts only represent single-color filled outlines, so these icons will not convert faithfully.
- **Pages that use only a few icons**: the whole font must load; inlining a few SVGs is lighter. This tool does not currently subset fonts.
- **Animating or coloring parts of an icon**: a font icon is a single character, so its parts cannot be controlled separately.
- **New projects built with component frameworks such as React or Vue**: an SVG icon component library is usually more convenient, and bundles only the icons you use.

### Things to keep in mind

- **Icons are invisible until the font loads**: on slow networks or if the font fails to load, icons show as blanks or boxes. Pair important actions with text.
- **Users may override page fonts**: some browsers let users disable web fonts (for readability or personal preference), which hides font icons.
- **Accessibility**: screen readers may announce icon characters. Mark decorative icons with `aria-hidden="true"` and give clickable icons an accessible name on the surrounding element (see the example in [Quick start](#4-preview-and-use)).

## Quick start

### 1. Install

```sh
npm install --save-dev svgs2fonts
```

### 2. Prepare icons

Put SVG files directly in one directory (**subdirectories are not scanned**). Each filename becomes the icon name and must not contain whitespace or control characters:

```text
icons/
  home.svg
  arrow-left.svg
```

### 3. Generate

```sh
npx svgs2fonts ./icons ./fonts --name=myicons --formats=woff2,woff --css --manifest
```

The first argument is the icon directory; the second is the output directory.

> **Note**: if you omit the output directory (e.g. `npx svgs2fonts ./icons`), files are written into the icon directory itself. Always pass an output directory explicitly.

Output:

```text
fonts/
  myicons.woff2           # font files (per --formats)
  myicons.woff
  myicons.css             # CSS for your application (--css)
  myicons.json            # icon name → codepoint manifest (--manifest)
  demo_fontclass.html     # preview (class usage), searchable with copy buttons
  demo_fontclass.css
  demo_unicode.html       # preview (Unicode usage)
  demo_unicode.css
```

### 4. Preview and use

Open `fonts/demo_fontclass.html` in a browser to review the icons. Then include the generated CSS in your page:

```html
<link rel="stylesheet" href="./fonts/myicons.css" />

<!-- Decorative icon -->
<span class="u-iconfont icon-home" aria-hidden="true"></span>

<!-- Interactive control: the button provides the accessible name -->
<button aria-label="Home">
  <span class="u-iconfont icon-home" aria-hidden="true"></span>
</button>
```

Class names: the base class is always `u-iconfont`; each icon class is `icon-<filename>` (`home.svg` → `icon-home`). The CSS references fonts by relative path, so deploy the CSS and font files in the same directory.

## Common commands

| Task                                   | Command                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Production files only, no previews     | `npx svgs2fonts ./icons ./fonts --formats=woff2 --nodemo --css --manifest`                                                                     |
| Keep codepoints stable as icons change | `npx svgs2fonts ./icons ./fonts --number=57344 --codepoint-map=codepoints.json --css --manifest` — see [Stable codepoints](#stable-codepoints) |
| Check inputs without writing files     | `npx svgs2fonts ./icons ./fonts --check`                                                                                                       |
| Machine-readable result for CI         | `npx svgs2fonts ./icons ./fonts --nodemo --css --json`                                                                                         |
| Build several icon directories         | `npx svgs2fonts --batch --input=./icons/ui,./icons/editor ./fonts --css --manifest`                                                            |

Notes:

- `--nodemo` only disables preview pages; it does not affect `--css` or `--manifest`.
- `--check` runs structural checks only (configuration, directories, obvious SVG problems, names, codepoint maps, batch output collisions). It does not run the real font conversion or prove visual fidelity; generate and review the preview afterwards.
- With `--json`, stdout contains exactly one JSON report and logs go to stderr. Exit code is `0` when everything succeeds and `1` on partial or complete failure. See [automation](./docs/automation.md).

### Batch builds

```sh
npx svgs2fonts --batch --input=./icons/ui,./icons/editor ./fonts --batch-size=3
```

- Each input directory produces an independent font, by default in `./fonts/<input-dir-name>/`, e.g. `./fonts/ui/` and `./fonts/editor/`.
- `--batch-size` sets how many directories are processed at once (default 3).
- By default a failed directory does not stop the others; with `--no-continue-on-error`, processing stops after the current batch.
- Duplicate or nested output targets are rejected before anything is written.
- `--output-pattern=kits/[name]-[fontname]` customizes subdirectory names; `--preserve-structure` keeps the inputs' relative layout.

## JavaScript / TypeScript API

Use `generate()`. It returns a structured report instead of throwing on configuration or conversion errors:

```js
const { generate } = require('svgs2fonts');
// TypeScript / ESM: import { generate } from 'svgs2fonts';

async function main() {
  const report = await generate({
    src: './icons',
    dist: './fonts',
    fontName: 'myicons',
    fontFormats: ['woff2', 'woff'],
    noDemo: true,
    outputCss: true,
    outputManifest: true,
  });

  if (!report.success) {
    console.error(report.status, report.errors);
    process.exitCode = 1;
    return;
  }
  console.log(report.outputs); // files actually written by this run
}

main();
```

Most useful report fields:

| Field                 | Meaning                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| `success`             | `true` only when every directory succeeded                                           |
| `status`              | `success`, `partial` (some batch items failed) or `failed`                           |
| `outputs`             | absolute paths of files actually written                                             |
| `errors` / `warnings` | each has a stable `code` and `message`, plus file/directory details where applicable |
| `directories`         | per-directory details: status, icon count, codepoints, outputs, duration             |

See [automation](./docs/automation.md) for the full report schema and error codes.

Other exports:

- `check(options)`: same as `--check`; read-only, returns the same report shape.
- `migrateCodepoints(options)`: import codepoints from a deployed font; see the [migration guide](./docs/migration.md).
- `init(options)`: legacy API returning `Promise<true | Error>`, still supported. Note that it resolves `true` on partial batch success (printing warnings only); use `generate()` when you need to detect partial failure.

## Stable codepoints

Each icon maps to a Unicode codepoint in the font. If your code **hardcodes codepoints** (e.g. `&#xE001;`), they must stay the same across rebuilds.

### Default behavior

With no configuration, codepoints are derived from a hash of the icon name, in the range `--number` (default `10000`) to `59999`:

- Without name collisions, an icon usually keeps the same codepoint. With a hash collision the result depends on input order, so **adding or removing icons can change codepoints**.
- The `10000` default is kept for backward compatibility. That range includes CJK and other ordinary characters, which may clash with page text.

### Recommended for new projects

```sh
npx svgs2fonts ./icons ./fonts --number=57344 --codepoint-map=codepoints.json --css --manifest
```

- `--number=57344` is `U+E000`, the start of the Unicode Private Use Area, which does not clash with ordinary text.
- `--codepoint-map=codepoints.json` maintains a map file **inside the output directory** (e.g. `fonts/codepoints.json`). Pass a filename only, not a path.
- With a map: existing icons keep their codepoints; new icons get new codepoints in name order; removed icons' codepoints stay reserved and are never reassigned.
- **Commit the map to version control**, and back it up before deleting the output directory.

The map also records a content hash for each SVG. Later `check()` / `generate()` reports list `added`, `removed` and `changed` icons under `changes`. Hashes cover raw bytes, so whitespace or comment edits count as changes; they do not indicate visual changes.

### Migrating an existing project

For a project already in production, import codepoints from the **font or manifest currently deployed**. Do not rely on regenerating to "guess" old codepoints:

```sh
# 1. Read-only preview: read the deployed font and compare names with the current icons
npx svgs2fonts --migrate=./deployed/iconfont.svg --migration-src=./icons

# 2. After review, write the map (path relative to the current directory;
#    the parent must exist and existing files are never overwritten)
mkdir -p ./fonts
npx svgs2fonts --migrate=./deployed/iconfont.svg --migration-output=./fonts/codepoints.json

# 3. Build as usual, using the same map filename
npx svgs2fonts ./icons ./fonts --codepoint-map=codepoints.json --css --manifest
```

See the [migration guide](./docs/migration.md) for supported sources (SVG fonts, JSON manifests), the API and error handling.

## Options

| API option                                        | CLI                              | Default and notes                                                                                        |
| ------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src`                                             | 1st positional                   | Icon directory; required in single-directory mode                                                        |
| `dist`                                            | 2nd positional                   | API: `./dist`; single-directory CLI: same as `src` (writes into the icon directory); batch CLI: `./dist` |
| `fontName`                                        | `--name`, `-n`                   | `iconfont`; letters, digits, `-` and `_` only                                                            |
| `fontFormats`                                     | `--formats`                      | `svg,ttf,eot,woff,woff2`; array in the API, comma-separated in the CLI                                   |
| `unicodeStart`                                    | `--number`                       | `10000`; integer 0–59998 outside the surrogate range; `57344` recommended for new projects               |
| `noDemo`                                          | `--nodemo`                       | `false`; `true` skips preview pages                                                                      |
| `outputCss`                                       | `--css`                          | `false`; writes `<fontName>.css`                                                                         |
| `outputManifest`                                  | `--manifest`                     | `false`; writes `<fontName>.json`                                                                        |
| `codepointMap`                                    | `--codepoint-map`                | Off; a `.json` filename (no path) inside the output directory                                            |
| `codepoints`                                      | —                                | Optional `{ name: codepoint }` seeds; conflicts with an existing map fail                                |
| `demoUnicodeHTML`                                 | —                                | `demo_unicode.html`                                                                                      |
| `demoFontClassHTML`                               | —                                | `demo_fontclass.html`                                                                                    |
| `batchMode`                                       | `--batch`, `-b`                  | `false`                                                                                                  |
| `inputDirectories`                                | `--input`                        | Required for batch; comma-separated or repeated in the CLI                                               |
| `batchSize`                                       | `--batch-size`                   | `3`; directories processed at once                                                                       |
| `continueOnError`                                 | `--no-continue-on-error`         | `true`; whether to continue after a directory fails                                                      |
| `outputPattern`                                   | `--output-pattern`               | Batch subdirectory template; supports `[name]` and `[fontname]`                                          |
| `preserveDirectoryStructure`                      | `--preserve-structure`           | `false`                                                                                                  |
| `verbose`                                         | `--verbose`, `-V`                | `false`; legacy `debug` / `--debug` still work with a deprecation warning                                |
| `progressCallback`                                | `--no-progress` disables the bar | Optional progress callback; exceptions in it do not fail the build                                       |
| `performanceAnalysis`                             | `--performance`, `-p`            | `false`; prints per-phase timings                                                                        |
| `fontHeight` / `normalize` / `centerHorizontally` | —                                | `1000` / `true` / `true`                                                                                 |

CLI only: `--check` (read-only checks), `--json` (JSON output), the `--migrate` family (see the migration guide), `--help`, `--version`.

**Accepted for compatibility but not implemented**: `maxConcurrency`, `enableCache`, `cacheDir`, `streamProcessing`, `optimization`, `subsetting`, `fontMetrics`, and the CLI flags `--concurrency`, `--cache`, `--cache-dir`, `--stream`, `--optimize`, `--compression-level`, `--report-compression`, `--subset`, `--include-glyphs`, `--exclude-glyphs`. They have no effect other than an `EXPERIMENTAL_OPTION_IGNORED` warning. Use `batchSize` to control concurrency.

## Output safety

- **Failures leave old files intact**: each directory is built in a temporary directory, and requested files are replaced only after everything succeeds. Other files in the output directory (including formats from earlier runs) are never deleted.
- **No concurrent writers**: only one build may write to an output directory at a time; conflicts return `OUTPUT_LOCKED`.
- **Leftovers**: locks and temporary directories live in the output directory's **parent**, named `.svgs2fonts-*`, and are cleaned up on normal exit. If a process is killed, confirm no build is running before removing them.
- **Limits**: this is not a system-wide transaction; crashes or power loss can leave an intermediate state. Batch directories commit independently.

## FAQ

**Icons render as boxes or misaligned?**
First check the preview page. Most modern browsers cannot render SVG-only fonts, so include at least `woff2`. Also make sure the CSS sits next to the font files.

**Wrong shapes or missing strokes?**
Fonts support single-color filled outlines only. Convert strokes, gradients and multiple colors to filled paths in your design tool first.

**`INVALID_ICON_NAME` error?**
Filenames must not contain whitespace or control characters; rename to something like `arrow-left.svg`.

**Extra `demo_*.html` files in the output?**
Those are preview pages; pass `--nodemo` to skip them.

**A `punycode` DeprecationWarning appears?**
Newer Node.js versions emit it for a dependency; it does not affect the output.

**Codepoints changed after upgrading?**
Default hash allocation may resolve name collisions differently from older versions. If you depend on fixed codepoints, follow [Migrating an existing project](#migrating-an-existing-project) and read the behavior changes in the [CHANGELOG](./CHANGELOG.md).

## More docs

- [Automation](./docs/automation.md): JSON report schema, error codes and handling, CI / AI workflows
- [Migration guide](./docs/migration.md): supported sources, API, comparison results and safety
- [CHANGELOG](./CHANGELOG.md): release notes and upgrade notes
- [CONTRIBUTING](./CONTRIBUTING.md): local development, tests and project layout

## License

[MIT](./LICENSE) © [Wayne](mailto:michealwayne@163.com)
