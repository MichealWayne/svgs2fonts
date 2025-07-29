# svgs2fonts

SVG icons to web font generator (SVG -> SVG, TTF, EOT, WOFF, WOFF2).
[GitHub (中文)](https://github.com/MichealWayne/svgs2fonts)

## Version

2.1.0

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

`options`:

| Field               | Type       | Default                        | Description                         |
| ------------------- | ---------- | ------------------------------ | ----------------------------------- |
| src                 | `string`   | -                              | SVG source directory path           |
| dist                | `string`   | `./dist`                       | Output directory for font files     |
| fontName            | `string`   | `iconfont`                     | Font family name                    |
| unicodeStart        | `number`   | `10000`                        | Unicode start number for icons      |
| noDemo              | `boolean`  | `false`                        | Whether to generate demo HTML files |
| verbose             | `boolean`  | `false`                        | Enable verbose output               |
| demoUnicodeHTML     | `string`   | `demo_unicode.html`            | Unicode demo HTML filename          |
| demoFontClassHTML   | `string`   | `demo_fontclass.html`          | Font-class demo HTML filename       |
| batchMode           | `boolean`  | `false`                        | Enable batch processing mode        |
| inputDirectories    | `string[]` | -                              | Input directories for batch mode    |
| batchSize           | `number`   | `3`                            | Batch size for parallel processing  |
| continueOnError     | `boolean`  | `false`                        | Continue on errors in batch mode    |
| maxConcurrency      | `number`   | `4`                            | Maximum concurrent operations       |
| enableCache         | `boolean`  | `true`                         | Enable caching mechanism            |
| fontFormats         | `string[]` | `['ttf','eot','woff','woff2']` | Font formats to generate            |
| progressCallback    | `function` | -                              | Progress monitoring callback        |
| performanceAnalysis | `boolean`  | `false`                        | Enable performance analysis         |

**Deprecated fields:**

- ~~debug~~ (v2.1.0): Debug mode flag, replaced by `verbose`
- ~~timeout~~ (v2.0.0): Timeout setting in milliseconds
- ~~logger~~ (v2.0.0): Custom logger configuration

##### demo

```js
const svgs2fonts = require('svgs2fonts');
const { join } = require('path');

svgs2fonts
  .init({
    src: __dirname, // svg source directory
    dist: join(__dirname, 'dest'), // output directory
    fontName: 'myIconfont', // font family name
    unicodeStart: 20000, // unicode start number
    noDemo: false, // generate demo files
    verbose: true, // enable verbose output
    performanceAnalysis: true, // enable performance tracking
  })
  .then(() => console.log('Font generation completed successfully!'))
  .catch(err => console.error('Font generation failed:', err));
```

### 2.cmd

```sh
svgs2fonts {{srcpath}} {{distpath}} {{options}}
```

- srcpath: svg file dirname, "" -> now dirname path;
- distpath: output files path;
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

Maximum concurrency for parallel processing. Default is the number of CPU cores (min 2, max 8).

##### example

```
svgs2fonts svg dist --concurrency=4
```

#### `--cache`

Enable caching to avoid reprocessing unchanged files. Default is true.

##### example

```
svgs2fonts svg dist --cache
```

#### `--cache-dir`

Custom cache directory path. Default is `.svgs2fonts-cache`.

##### example

```
svgs2fonts svg dist --cache-dir=.mycache
```

#### `--stream`

Enable streaming processing for large datasets. Default is false.

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

Number of directories to process in parallel in batch mode. Default is 10.

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3 --batch-size=5
```

#### `--output-pattern`

Output pattern for batch mode. Supports `[name]` and `[fontname]` placeholders. Default is `[name]/[fontname]`.

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

Preserve directory structure in batch mode. Default is false.

##### example

```
svgs2fonts --batch --input=icons1,icons2 --preserve-structure
```

### Font Options

#### `--formats`

Font formats to generate (comma-separated). Options: svg,ttf,eot,woff,woff2,variable. Default is all formats.

##### example

```
svgs2fonts svg dist --formats=ttf,woff,woff2
```

#### `-o` / `--optimize`

Enable font optimization.

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

## Changelog

| Version | Date       | Changes                                        |
| ------- | ---------- | ---------------------------------------------- |
| v2.1.0  | 2024.09.28 | Remove debug parameter, optimize logging       |
| v2.0.3  | 2023.12.16 | Add defensive handling, improve stability      |
| v2.0.2  | 2023.06.03 | Optimize variable control, enhance performance |
| v2.0.1  | 2022.11.03 | Split CSS styles, support SVG size options     |
| v2.0.0  | 2022.03.20 | TypeScript rewrite, full type definitions      |
| v1.x    | 2021.12.16 | Fix IE8 compatibility issues                   |

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

2024.09.28
