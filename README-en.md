# svgs2fonts

SVG icons to web font generator (SVG -> SVG, TTF, EOT, WOFF, WOFF2).
[GitHub (中文)](https://github.com/MichealWayne/svgs2fonts)

## Version

Current package version: `2.2.0`

For release history, prefer Git tags / release records instead of a manually maintained changelog table in the README.

## Install

### 1.global install

```sh
npm i -g svgs2fonts
```

#### check

```sh
svgs2fonts -v
```

### 2.module install

```sh
npm i --save svgs2fonts
```

## Usage

### 1. module import

```js
const Svgs2fonts = require('svgs2fonts');
Svgs2fonts.init(options);
```

`init(options)` currently returns `Promise<true | Error>`.
It resolves to `true` on success and to an `Error` instance on failure, so callers should check the result explicitly instead of relying only on `.catch(...)`.

`options`:

| Field               | Type       | Default                              | Status         | Description                                  |
| ------------------- | ---------- | ------------------------------------ | -------------- | -------------------------------------------- |
| src                 | `string`   | -                                    | Supported      | SVG source directory path in single mode     |
| dist                | `string`   | `./dist`                             | Supported      | Output directory for font files              |
| fontName            | `string`   | `iconfont`                           | Supported      | Font family name                             |
| unicodeStart        | `number`   | `10000`                              | Supported      | Unicode start number for icons               |
| noDemo              | `boolean`  | `false`                              | Supported      | Whether to skip demo HTML files              |
| verbose             | `boolean`  | `false`                              | Supported      | Enable verbose output                        |
| demoUnicodeHTML     | `string`   | `demo_unicode.html`                  | Supported      | Unicode demo HTML filename                   |
| demoFontClassHTML   | `string`   | `demo_fontclass.html`                | Supported      | Font-class demo HTML filename                |
| batchMode           | `boolean`  | `false`                              | Supported      | Enable batch processing mode                 |
| inputDirectories    | `string[]` | -                                    | Supported      | Input directories for batch mode             |
| batchSize           | `number`   | `3`                                  | Supported      | Number of directories processed per batch    |
| continueOnError     | `boolean`  | `true`                               | Supported      | Continue on errors in batch mode             |
| fontFormats         | `string[]` | `['svg','ttf','eot','woff','woff2']` | Supported      | Font formats to generate                     |
| progressCallback    | `function` | -                                    | Supported      | Progress monitoring callback                 |
| performanceAnalysis | `boolean`  | `false`                              | Supported      | Enable performance analysis                  |
| maxConcurrency      | `number`   | -                                    | Experimental   | Accepted, but scheduling behavior is not guaranteed |
| enableCache         | `boolean`  | `true`                               | Experimental   | Accepted, but cache pipeline is not fully implemented |
| cacheDir            | `string`   | -                                    | Experimental   | Reserved for future cache support            |
| streamProcessing    | `boolean`  | `false`                              | Experimental   | Accepted, but streaming is not fully implemented |
| outputPattern       | `string`   | -                                    | Supported      | Batch output template with `[name]` and `[fontname]` |
| preserveDirectoryStructure | `boolean` | `false`                        | Supported      | Preserve relative input directory structure in batch mode |
| optimization        | `object`   | -                                    | Experimental   | Parsed, but not executed end-to-end          |
| subsetting          | `object`   | -                                    | Experimental   | Parsed, but not executed end-to-end          |

**Deprecated fields:**

- ~~debug~~ (v2.1.0): Debug mode flag, replaced by `verbose`
- ~~timeout~~ (v2.0.0): Timeout setting in milliseconds
- ~~logger~~ (v2.0.0): Custom logger configuration

##### demo

```js
const svgs2fonts = require('svgs2fonts');
const { join } = require('path');

async function main() {
  const result = await svgs2fonts.init({
    src: __dirname, // svg source directory
    dist: join(__dirname, 'dest'), // output directory
    fontName: 'myIconfont', // font family name
    unicodeStart: 20000, // unicode start number
    noDemo: false, // generate demo files
    verbose: true, // enable verbose output
  });

  if (result === true) {
    console.log('Font generation completed successfully!');
  } else {
    console.error('Font generation failed:', result.message);
  }
}

main();
```

##### stable performance-analysis example

```js
const svgs2fonts = require('svgs2fonts');

async function main() {
  const result = await svgs2fonts.init({
    src: './icons',
    dist: './output',
    fontName: 'performance-icons',
    performanceAnalysis: true,
    verbose: true,
    progressCallback: progress => {
      console.log(`${progress.phase}: ${progress.completed}/${progress.total}`);
    },
  });

  if (result !== true) {
    console.error(result.message);
  }
}

main();
```

##### experimental flags example

These flags are currently accepted but not guaranteed to produce full end-to-end behavior: `maxConcurrency`, `enableCache`, `cacheDir`, `streamProcessing`, `optimization`, `subsetting`.

```js
async function main() {
  const result = await svgs2fonts.init({
    src: './icons',
    dist: './output',
    fontName: 'experimental-icons',
    maxConcurrency: 4,
    enableCache: true,
  });

  if (result !== true) {
    console.error(result.message);
  }
}

main();
```

Notes:
- `performanceAnalysis` and `progressCallback` are supported today.
- `maxConcurrency`, `enableCache`, `cacheDir`, `streamProcessing`, `optimization`, and `subsetting` are still experimental inputs.

### CLI/config support matrix

| Capability | CLI syntax | Status | Notes |
| ---------- | ---------- | ------ | ----- |
| Single-directory generation | `[src] [dist]` | Supported | If `dist` is omitted, CLI writes to `src` |
| Batch input parsing | `--batch --input=dirA,dirB [dist]` | Supported | `--input` is comma-separated |
| Explicit help | `-h`, `--help` | Supported | Does not depend on missing positional args |
| Version output | `-v`, `--version` | Supported | Prints package version |
| Format selection | `--formats=woff2,woff` | Supported | Supported values are `svg,ttf,eot,woff,woff2` |
| Verbose logging | `--verbose` | Supported | Prints configuration and error context |
| Performance summary | `--performance` | Supported | Prints a performance summary after completion |
| Disable progress | `--no-progress` | Supported | Safe in non-TTY environments |
| Unknown-flag failure | any unsupported flag | Supported | Returns a non-zero exit code |
| Batch output template | `--output-pattern` | Supported | Supports `[name]` and `[fontname]` placeholders |
| Preserve directory structure | `--preserve-structure` | Supported | Keeps the relative input directory structure |
| Cache/stream/subset/optimize | `--cache` and related flags | Experimental | Parsed, but not guaranteed to be fully effective |

Notes:
The module API defaults `dist` to `./dist`.
In the CLI, single-directory mode defaults `dist` to `src`, while batch mode defaults `dist` to `./dist`.

### 2.cmd

```sh
svgs2fonts {{srcpath}} {{distpath}} {{options}}
```

- srcpath: required in single-directory mode; may be relative or absolute;
- distpath: optional. In single-directory mode it defaults to the source directory. In batch mode it defaults to `./dist`;
- options: configurations.

##### example

```sh
svgs2fonts svg dist
```

`options`:

### Basic Options

#### `-n` / `--name`

Font icon's name (default: `iconfont`).

##### example

```sh
svgs2fonts svg dist -n myiconfont
```

#### `--number`

Unicode start number (default: `10000`).

##### example

```sh
svgs2fonts svg dist --number 50000
```

#### `--nodemo`

No demo HTML files.

##### example

```sh
svgs2fonts svg dist --nodemo
```

### Performance Options

#### `-c` / `--concurrency`

Experimental flag. Accepted by the CLI, but does not yet guarantee stable scheduling changes.

##### example

```
svgs2fonts svg dist --concurrency=4
```

#### `--cache`

Experimental flag. Accepted by the CLI, but the cache pipeline is not fully implemented end-to-end.

##### example

```
svgs2fonts svg dist --cache
```

#### `--cache-dir`

Experimental flag. Accepted by the CLI, but cache directory handling is not yet a stable public contract.

##### example

```
svgs2fonts svg dist --cache-dir=.mycache
```

#### `--stream`

Experimental flag. Accepted by the CLI, but streaming support is not fully implemented end-to-end.

##### example

```
svgs2fonts svg dist --stream
```

### Batch Processing Options

#### `-b` / `--batch`

Enable batch mode for processing multiple directories.

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3
```

#### `--input`

Input directories for batch mode (comma-separated).

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3
```

#### `--batch-size`

Number of directories processed per batch in batch mode. Default is `3`.

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3 --batch-size=5
```

#### `--output-pattern`

Output template for batch mode. Supports `[name]` and `[fontname]` placeholders.

##### example

```
svgs2fonts --batch --input=icons1,icons2 --output-pattern="[fontname]-[name]"
```

#### `--continue-on-error`

Continue processing other directories when one fails in batch mode. Default is true.

##### example

```
svgs2fonts --batch --input=icons1,icons2 --continue-on-error
```

#### `--preserve-structure`

Preserve the relative input directory structure in batch mode. Can be combined with `--output-pattern`.

##### example

```
svgs2fonts --batch --input=icons1,icons2 --preserve-structure
```

### Font Options

#### `--formats`

Font formats to generate (comma-separated). Stable values: `svg,ttf,eot,woff,woff2`.

##### example

```
svgs2fonts svg dist --formats=ttf,woff,woff2
```

#### `-o` / `--optimize`

Experimental flag. Accepted by the CLI, but the optimization pipeline is not fully implemented end-to-end.

##### example

```
svgs2fonts svg dist --optimize
```

#### `--compression-level`

WOFF2 compression level (1-11). Default is 11 (maximum compression).

##### example

```
svgs2fonts svg dist --optimize --compression-level=9
```

#### `--subset`

Enable font subsetting.

##### example

```
svgs2fonts svg dist --subset --include-glyphs=icon1,icon2,icon3
```

#### `--include-glyphs`

Glyphs to include (comma-separated).

##### example

```
svgs2fonts svg dist --subset --include-glyphs=icon1,icon2,icon3
```

#### `--exclude-glyphs`

Glyphs to exclude (comma-separated).

##### example

```
svgs2fonts svg dist --subset --exclude-glyphs=icon4,icon5
```

### Monitoring Options

#### `-V` / `--verbose`

Enable verbose output.

##### example

```
svgs2fonts svg dist --verbose
```

#### `-p` / `--performance`

Enable performance analysis.

##### example

```
svgs2fonts svg dist --performance
```

#### `--no-progress`

Disable progress display.

##### example

```
svgs2fonts svg dist --no-progress
```

#### `--report-compression`

Report compression statistics.

##### example

```
svgs2fonts svg dist --optimize --report-compression
```

### Complete Example

```
svgs2fonts svg dist -n myicons --formats=ttf,woff,woff2 --concurrency=4 --cache --verbose
```

## Project build

install dependencies：

```
npm i
```

build：

```
npm run build
```

unit test：

```
npm run test
```

demo test：

```
npm run test:example
```

> [Technical blog - Research and conversion of SVG, TTF, WOFF, WOFF2 icons](http://blog.michealwayne.cn/2018/07/26/notes/%E3%80%90%E7%AC%94%E8%AE%B0%E3%80%91%E7%94%B1iconfont%E5%BC%95%E8%B5%B7%E7%9A%84svg%E3%80%81ttf%E3%80%81woff%E3%80%81woff2%E5%9B%BE%E6%A0%87%E7%9A%84%E7%A0%94%E7%A9%B6%E5%8F%8A%E5%85%B6%E8%BD%AC%E6%8D%A2/)

## Project Architecture

### Core Modules

- **Configuration Management** (`src/config/`): Configuration handling and backward compatibility
  - `ConfigurationManager.ts`: Configuration validation and management
  - `BackwardCompatibilityLayer.ts`: Backward compatibility support
- **Core Features** (`src/core/`): Core business logic and orchestration
  - `ProgressMonitor.ts`: Progress monitoring
  - `PerformanceTracker.ts`: Performance tracking and analysis
- **Processors** (`src/processors/`): Processing workflow orchestration
  - `SingleDirectoryProcessor.ts`: Single directory processor
  - `BatchModeProcessor.ts`: Batch mode processor
- **Builders** (`src/builders/`): Font generation core modules
  - `SVGBuilder.ts`: Converts SVG icons to SVG font
  - `FontsBuilder.ts`: Transforms SVG font to TTF, EOT, WOFF, WOFF2 formats
  - `DemoBuilder.ts`: Generates HTML demo files and CSS styles
- **Utilities** (`src/utils/`): File system operations and utility functions
- **Type Definitions** (`src/types/`): TypeScript type definitions

### Build Process

1. **Input**: Collection of SVG icon files
2. **Configuration Processing**: ConfigurationManager validates and normalizes options
3. **Processor Selection**: Choose single directory or batch mode processor based on config
4. **SVG Processing**: SVGBuilder creates SVG font file
5. **Font Generation**: FontsBuilder generates TTF, EOT, WOFF, WOFF2 formats in parallel
6. **Demo Generation**: DemoBuilder generates demo HTML and CSS files (optional)
7. **Performance Report**: PerformanceTracker outputs performance analysis (optional)

### Technology Stack

- **Language**: TypeScript
- **Dependencies**:
  - `svgicons2svgfont`: SVG icons to SVG font
  - `svg2ttf`: SVG font to TTF
  - `ttf2eot`: TTF to EOT
  - `ttf2woff`: TTF to WOFF
  - `ttf2woff2`: TTF to WOFF2

## Compatibility

- **Node.js**: ≥ 12.0.0
- **Browsers**: All modern browsers (IE9+)
- **Font Formats**: Complete support for EOT, TTF, WOFF, WOFF2

## Version Notes

- Current README package version: `2.2.0`
- For historical changes, prefer the repository's Git tags / release records
- If published package behavior differs from this document, treat the current code and `package.json` as the source of truth

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/MichealWayne/svgs2fonts.git

# Install dependencies
npm install

# Start development mode
npm run test:example

# Run tests
npm test

# Build the project
npm run build
```

### Project Structure

```
svgs2fonts/
├── src/                    # Source code
│   ├── builders/          # Builder modules
│   │   ├── SVGBuilder.ts  # SVG font builder
│   │   ├── FontsBuilder.ts # Font format converter
│   │   └── DemoBuilder.ts  # Demo file generator
│   ├── config/            # Configuration management
│   │   ├── ConfigurationManager.ts # Configuration manager
│   │   └── BackwardCompatibilityLayer.ts # Backward compatibility
│   ├── core/              # Core features
│   │   ├── ProgressMonitor.ts # Progress monitoring
│   │   └── PerformanceTracker.ts # Performance tracking
│   ├── processors/        # Processors
│   │   ├── SingleDirectoryProcessor.ts # Single directory processing
│   │   └── BatchModeProcessor.ts # Batch mode processing
│   ├── types/             # Type definitions
│   ├── utils/             # Utility functions
│   ├── constant.ts        # Constants
│   ├── options.ts         # Configuration options
│   └── index.ts           # Entry point
├── examples/              # Examples directory
├── __tests__/             # Test files
└── dist/                  # Build output
```

## Author

[Micheal Wayne](mailto:michealwayne@163.com)

## Build time

2025.07.27
