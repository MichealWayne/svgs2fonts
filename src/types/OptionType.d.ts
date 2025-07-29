/**
 * @fileoverview Type definitions for SVG to Font conversion options and configurations
 * @description Comprehensive type definitions providing type safety and IDE support
 * for all configuration options, processing results, and internal data structures
 * @module types/OptionType
 * @author Wayne <michealwayne@163.com>
 * @since 1.0.0
 * @version 2.1.1
 * @lastModified 2025-07-27 16:00:00
 */

/**
 * @typedef {string} FilePath
 * @description File system path string
 */

/**
 * @typedef {string} DirectoryPath
 * @description Directory path string
 */

/**
 * @typedef {string} FontName
 * @description Font family name (alphanumeric characters and hyphens only)
 */

/**
 * Base options interface for SVG icons to font conversion
 * Compatible with the underlying svgicons2svgfont library
 *
 * @interface SvgIcons2FontOptions
 * @description Core configuration options that directly map to the svgicons2svgfont library.
 * These options control the fundamental aspects of SVG to font conversion including
 * font metrics, styling, and rendering behavior.
 *
 * @see {@link https://github.com/nfnt/svgicons2svgfont} svgicons2svgfont documentation
 * @since 1.0.0
 */
interface SvgIcons2FontOptions {
  /**
   * Font family name displayed in CSS and font files
   *
   * @type {string} [fontName='iconfont']
   * @description The name that will be used as the font-family in CSS.
   * Should contain only alphanumeric characters, hyphens, and underscores.
   * Avoid spaces and special characters for maximum compatibility.
   *
   * @example
   * fontName: 'my-icons'        // ✓ Good
   * fontName: 'MyIcons'         // ✓ Good
   * fontName: 'my icons'        // ✗ Avoid spaces
   * fontName: 'my-icons@2x'     // ✗ Avoid special chars
   *
   * @default 'iconfont'
   * @since 1.0.0
   */
  fontName?: string;

  /**
   * Unique identifier for the font (used in SVG font format)
   *
   * @type {string} [fontId]
   * @description Internal font identifier used in SVG font files.
   * If not provided, defaults to the fontName value.
   * This is primarily used for SVG font format compatibility.
   *
   * @default Uses fontName value
   * @since 1.0.0
   */
  fontId?: string;

  /**
   * CSS font-style property value
   *
   * @type {string} [fontStyle='normal']
   * @description Specifies the font style in generated CSS.
   * Common values: 'normal', 'italic', 'oblique'
   *
   * @default 'normal'
   * @since 1.0.0
   */
  fontStyle?: string;

  /**
   * CSS font-weight property value
   *
   * @type {string} [fontWeight='normal']
   * @description Specifies the font weight in generated CSS.
   * Common values: 'normal', 'bold', '100'-'900', 'lighter', 'bolder'
   *
   * @example
   * fontWeight: 'normal'  // Standard weight
   * fontWeight: 'bold'    // Bold weight
   * fontWeight: '400'     // Numeric weight
   *
   * @default 'normal'
   * @since 1.0.0
   */
  fontWeight?: string;

  /**
   * Whether all glyphs should have the same width
   *
   * @type {boolean} [fixedWidth=false]
   * @description When true, all icons will have identical advance width,
   * creating monospace-style icon spacing. Useful for tabular layouts
   * or when consistent spacing is required.
   *
   * @default false
   * @since 1.0.0
   */
  fixedWidth?: boolean;

  /**
   * Whether to center glyphs horizontally in their containers
   *
   * @type {boolean} [centerHorizontally=false]
   * @description When true, centers each glyph horizontally within its
   * bounding box. Helpful for ensuring consistent visual alignment
   * across different icon designs.
   *
   * @default false
   * @since 1.0.0
   */
  centerHorizontally?: boolean;

  /**
   * Whether to normalize glyph coordinates and dimensions
   *
   * @type {boolean} [normalize=false]
   * @description When true, normalizes all glyphs to consistent
   * coordinate system and scaling. Ensures uniform appearance
   * across icons with different original dimensions.
   *
   * @default false
   * @since 1.0.0
   */
  normalize?: boolean;

  /**
   * Font em-square height in font units
   *
   * @type {number} [fontHeight=1000]
   * @description The height of the font's em-square in font design units.
   * Higher values provide more precision but larger file sizes.
   * Standard values: 1000 (TrueType), 2048 (OpenType)
   *
   * @minimum 16
   * @maximum 16384
   * @default 1000
   * @since 1.0.0
   */
  fontHeight?: number;

  /**
   * Precision for floating-point coordinate rounding
   *
   * @type {number} [round=10^3]
   * @description Precision factor for rounding coordinate values.
   * Higher values preserve more detail but increase file size.
   * Lower values reduce precision but create smaller files.
   *
   * @minimum 1
   * @maximum 1000000
   * @default 1000
   * @since 1.0.0
   */
  round?: number;

  /**
   * Font descent value (distance below baseline)
   *
   * @type {number} [descent=0]
   * @description Distance below the baseline where glyphs can extend.
   * Negative values move the baseline up, positive values down.
   * Affects vertical alignment of icons in text.
   *
   * @default 0
   * @since 1.0.0
   */
  descent?: number;

  /**
   * Font metadata string (embedded in font files)
   *
   * @type {string} [metadata]
   * @description Optional metadata embedded in the generated font files.
   * Can include copyright, author, or other descriptive information.
   * Visible in font inspection tools and some applications.
   *
   * @example
   * metadata: 'Copyright 2023 MyCompany. All rights reserved.'
   *
   * @since 1.0.0
   */
  metadata?: string;

  /**
   * Custom logging function for conversion process
   *
   * @type {Function} [log]
   * @description Optional custom logging function to receive conversion
   * progress messages. If not provided, uses console.log by default.
   *
   * @param {string} message - Log message to output
   *
   * @example
   * log: (message) => {
   *   console.log(`[Custom Logger] ${message}`);
   *   // or write to file, send to service, etc.
   * }
   *
   * @since 1.0.0
   */
  log?: (message: string) => void;
}

/**
 * Required initialization parameters for basic font generation
 *
 * @interface InitOptionsParams
 * @extends SvgIcons2FontOptions
 * @description Complete set of required parameters for initializing font generation.
 * All properties must be provided when using the basic initialization mode.
 * Extends the base SVG options with required path and naming configurations.
 *
 * @since 1.0.0
 */
export interface InitOptionsParams extends SvgIcons2FontOptions {
  /**
   * Font family name (required)
   *
   * @type {string} fontName
   * @description Required font family name for the generated font.
   * Must be a valid CSS font-family name.
   *
   * @see SvgIcons2FontOptions.fontName for detailed requirements
   * @since 1.0.0
   */
  fontName: string;

  /**
   * Starting Unicode code point for icon mapping
   *
   * @type {number} unicodeStart
   * @description Starting Unicode value for automatic icon mapping.
   * Recommended to use Private Use Area (0xE000-0xF8FF) to avoid
   * conflicts with standard Unicode characters.
   *
   * @minimum 0x0000
   * @maximum 0x10FFFF
   * @default 0xE000
   * @example
   * unicodeStart: 0xE000  // Private Use Area start
   * unicodeStart: 0xF000  // Alternative PUA start
   *
   * @since 1.0.0
   */
  unicodeStart: number;

  /**
   * Enable debug mode for detailed logging
   *
   * @type {boolean} debug
   * @description When true, enables comprehensive debug logging
   * including file processing details, timing information,
   * and internal operation status.
   *
   * @default false
   * @since 1.0.0
   */
  debug: boolean;

  /**
   * Skip generation of demo HTML files
   *
   * @type {boolean} noDemo
   * @description When true, skips creation of HTML demo files
   * that showcase the generated font icons. Useful for
   * production builds where demos are not needed.
   *
   * @default false
   * @since 1.0.0
   */
  noDemo: boolean;

  /**
   * Source directory containing SVG files
   *
   * @type {string} src
   * @description Absolute or relative path to directory containing
   * SVG icon files to be converted. All .svg files in this
   * directory will be processed.
   *
   * @example
   * src: './icons'           // Relative path
   * src: '/path/to/icons'    // Absolute path
   * src: 'src/assets/icons'  // Nested relative path
   *
   * @since 1.0.0
   */
  src: string;

  /**
   * Output directory for generated font files
   *
   * @type {string} dist
   * @description Absolute or relative path where generated font files
   * and demo files will be written. Directory will be created
   * if it doesn't exist.
   *
   * @example
   * dist: './fonts'          // Relative path
   * dist: '/path/to/output'  // Absolute path
   * dist: 'build/fonts'      // Nested relative path
   *
   * @since 1.0.0
   */
  dist: string;

  /**
   * Filename for Unicode-based demo HTML
   *
   * @type {string} demoUnicodeHTML
   * @description Name of the HTML file that demonstrates icons
   * using Unicode character codes. Generated in the dist directory.
   *
   * @example
   * demoUnicodeHTML: 'demo_unicode.html'
   *
   * @since 1.0.0
   */
  demoUnicodeHTML: string;

  /**
   * Filename for CSS class-based demo HTML
   *
   * @type {string} demoFontClassHTML
   * @description Name of the HTML file that demonstrates icons
   * using CSS class names. Generated in the dist directory.
   *
   * @example
   * demoFontClassHTML: 'demo_fontclass.html'
   *
   * @since 1.0.0
   */
  demoFontClassHTML: string;
}

/**
 * Partial initialization parameters for flexible configuration
 *
 * @interface InitOptionsParamsPartial
 * @extends Partial<SvgIcons2FontOptions>
 * @description All InitOptionsParams properties as optional for flexible
 * configuration scenarios. Useful when providing default values or
 * building configurations programmatically.
 *
 * @since 1.0.0
 */
export interface InitOptionsParamsPartial extends Partial<SvgIcons2FontOptions> {
  /** @see InitOptionsParams.fontName */
  fontName?: string;
  /** @see InitOptionsParams.unicodeStart */
  unicodeStart?: number;
  /** @see InitOptionsParams.debug */
  debug?: boolean;
  /** @see InitOptionsParams.noDemo */
  noDemo?: boolean;
  /** @see InitOptionsParams.src */
  src?: string;
  /** @see InitOptionsParams.dist */
  dist?: string;
  /** @see InitOptionsParams.demoUnicodeHTML */
  demoUnicodeHTML?: string;
  /** @see InitOptionsParams.demoFontClassHTML */
  demoFontClassHTML?: string;
}

/**
 * Supported font output formats
 *
 * @typedef {('svg'|'ttf'|'eot'|'woff'|'woff2'|'variable')} FontFormat
 * @description Enumeration of supported font file formats for output generation.
 * Each format has different browser support and file size characteristics.
 *
 * @property {'svg'} svg - SVG font format (legacy, limited browser support)
 * @property {'ttf'} ttf - TrueType font format (universal support, larger files)
 * @property {'eot'} eot - Embedded OpenType (IE6-11 support only)
 * @property {'woff'} woff - Web Open Font Format v1 (good compression, wide support)
 * @property {'woff2'} woff2 - Web Open Font Format v2 (best compression, modern browsers)
 * @property {'variable'} variable - Variable font format (experimental, future support)
 *
 * @example
 * // Recommended formats for modern web
 * fontFormats: ['woff2', 'woff']
 *
 * // Maximum compatibility (including IE)
 * fontFormats: ['woff2', 'woff', 'ttf', 'eot']
 *
 * @since 1.0.0
 */
export type FontFormat = 'svg' | 'ttf' | 'eot' | 'woff' | 'woff2' | 'variable';

/**
 * Font metrics configuration for precise typography control
 *
 * @interface FontMetrics
 * @description Advanced typography settings for fine-tuning font appearance
 * and alignment. These settings affect how the font renders in different
 * contexts and applications.
 *
 * @since 2.0.0
 */
export interface FontMetrics {
  /**
   * Baseline position relative to font height
   *
   * @type {number} [baseline]
   * @description Position of the text baseline as a percentage of font height.
   * Affects vertical alignment of icons when mixed with text.
   *
   * @minimum 0
   * @maximum 1
   * @default 0.14 (14% from bottom)
   * @since 2.0.0
   */
  baseline?: number;

  /**
   * Ascender height above baseline
   *
   * @type {number} [ascent]
   * @description Height above baseline where characters can extend.
   * Affects the visual height of the font in layout systems.
   *
   * @minimum 0
   * @default Calculated from fontHeight and baseline
   * @since 2.0.0
   */
  ascent?: number;

  /**
   * Descender depth below baseline
   *
   * @type {number} [descent]
   * @description Depth below baseline where characters can extend.
   * Affects line spacing and vertical rhythm in text layouts.
   *
   * @maximum 0 (negative values indicate depth below baseline)
   * @default Calculated from fontHeight and baseline
   * @since 2.0.0
   */
  descent?: number;
}

/**
 * Unicode range specification for font subsetting
 *
 * @interface UnicodeRange
 * @description Defines a contiguous range of Unicode code points
 * for selective font generation or subsetting operations.
 *
 * @since 2.0.0
 */
export interface UnicodeRange {
  /**
   * Starting Unicode code point (inclusive)
   *
   * @type {number} start
   * @description First Unicode value in the range.
   * Must be less than or equal to end value.
   *
   * @minimum 0x0000
   * @maximum 0x10FFFF
   * @since 2.0.0
   */
  start: number;

  /**
   * Ending Unicode code point (inclusive)
   *
   * @type {number} end
   * @description Last Unicode value in the range.
   * Must be greater than or equal to start value.
   *
   * @minimum 0x0000
   * @maximum 0x10FFFF
   * @since 2.0.0
   */
  end: number;
}

/**
 * Font subsetting configuration options
 *
 * @interface SubsettingOptions
 * @description Advanced options for creating subset fonts containing
 * only specific glyphs or Unicode ranges. Useful for reducing
 * file size when only certain icons are needed.
 *
 * @since 2.0.0
 */
export interface SubsettingOptions {
  /**
   * Specific glyph names to include in subset
   *
   * @type {string[]} [includeGlyphs]
   * @description Array of glyph names (typically filename without extension)
   * to include in the generated font. If specified, only these glyphs
   * will be included.
   *
   * @example
   * includeGlyphs: ['home', 'user', 'settings', 'logout']
   *
   * @since 2.0.0
   */
  includeGlyphs?: string[];

  /**
   * Specific glyph names to exclude from subset
   *
   * @type {string[]} [excludeGlyphs]
   * @description Array of glyph names to exclude from the generated font.
   * Takes precedence over includeGlyphs if both are specified.
   *
   * @example
   * excludeGlyphs: ['deprecated-icon', 'unused-icon']
   *
   * @since 2.0.0
   */
  excludeGlyphs?: string[];

  /**
   * Unicode ranges to include in subset
   *
   * @type {UnicodeRange[]} [unicodeRanges]
   * @description Array of Unicode ranges to include in the font.
   * Useful for targeting specific character sets or regions.
   *
   * @example
   * unicodeRanges: [
   *   { start: 0xE000, end: 0xE0FF }, // Private Use Area subset
   *   { start: 0x2600, end: 0x26FF }  // Miscellaneous Symbols
   * ]
   *
   * @since 2.0.0
   */
  unicodeRanges?: UnicodeRange[];
}

/**
 * Font optimization configuration options
 *
 * @interface OptimizationOptions
 * @description Comprehensive optimization settings for reducing file sizes
 * and improving font performance. Different optimization levels provide
 * trade-offs between file size and processing time.
 *
 * @since 2.0.0
 */
export interface OptimizationOptions {
  /**
   * Enable WOFF2 compression optimization
   *
   * @type {boolean} [compressWoff2=true]
   * @description When true, applies maximum compression to WOFF2 files.
   * Results in smaller files but longer processing time.
   *
   * @default true
   * @since 2.0.0
   */
  compressWoff2?: boolean;

  /**
   * Enable web-specific optimizations
   *
   * @type {boolean} [optimizeForWeb=true]
   * @description When true, applies web-specific optimizations including
   * better glyph ordering, optimized tables, and web font hints.
   *
   * @default true
   * @since 2.0.0
   */
  optimizeForWeb?: boolean;

  /**
   * Remove unused glyphs during optimization
   *
   * @type {boolean} [removeUnusedGlyphs=false]
   * @description When true, analyzes usage patterns and removes
   * glyphs that appear to be unused. Use with caution.
   *
   * @default false
   * @since 2.0.0
   */
  removeUnusedGlyphs?: boolean;

  /**
   * WOFF2 compression level (0-11)
   *
   * @type {number} [woff2CompressionLevel=11]
   * @description Brotli compression level for WOFF2 files.
   * Higher values provide better compression but slower processing.
   *
   * @minimum 0
   * @maximum 11
   * @default 11
   * @since 2.0.0
   */
  woff2CompressionLevel?: number;

  /**
   * Remove font metadata to reduce file size
   *
   * @type {boolean} [woff2RemoveMetadata=false]
   * @description When true, removes non-essential metadata from WOFF2 files.
   * Reduces file size but loses authoring information.
   *
   * @default false
   * @since 2.0.0
   */
  woff2RemoveMetadata?: boolean;

  /**
   * Optimize font hinting for web rendering
   *
   * @type {boolean} [woff2OptimizeHinting=true]
   * @description When true, optimizes or removes font hinting instructions
   * that are less relevant for web rendering at typical sizes.
   *
   * @default true
   * @since 2.0.0
   */
  woff2OptimizeHinting?: boolean;

  /**
   * Simplify glyph outlines for smaller files
   *
   * @type {boolean} [woff2SimplifyGlyphs=false]
   * @description When true, applies curve simplification to reduce
   * outline complexity. May affect visual quality.
   *
   * @default false
   * @since 2.0.0
   */
  woff2SimplifyGlyphs?: boolean;

  /**
   * Reorder font tables for optimal loading
   *
   * @type {boolean} [woff2ReorderTables=true]
   * @description When true, reorders font tables for optimal parsing
   * and loading performance in web browsers.
   *
   * @default true
   * @since 2.0.0
   */
  woff2ReorderTables?: boolean;

  /**
   * Generate compression statistics report
   *
   * @type {boolean} [reportCompressionStats=false]
   * @description When true, generates detailed compression statistics
   * showing size savings for each optimization step.
   *
   * @default false
   * @since 2.0.0
   */
  reportCompressionStats?: boolean;
}

/**
 * Template customization options for demo file generation
 *
 * @interface TemplateOptions
 * @description Configuration for customizing the HTML and CSS templates
 * used to generate demo and documentation files. Supports custom
 * templates and variable substitution.
 *
 * @since 2.0.0
 */
export interface TemplateOptions {
  /**
   * Custom HTML template for demo pages
   *
   * @type {string} [customHtmlTemplate]
   * @description Path to custom HTML template file or template string.
   * Template supports variable substitution using {{variableName}} syntax.
   *
   * @example
   * customHtmlTemplate: './templates/my-demo.html'
   * // or inline template:
   * customHtmlTemplate: '<html><body>{{fontName}} Demo</body></html>'
   *
   * @since 2.0.0
   */
  customHtmlTemplate?: string;

  /**
   * Custom CSS template for styling
   *
   * @type {string} [customCssTemplate]
   * @description Path to custom CSS template file or CSS string.
   * Used for styling demo pages and icon displays.
   *
   * @example
   * customCssTemplate: './templates/icon-styles.css'
   *
   * @since 2.0.0
   */
  customCssTemplate?: string;

  /**
   * Variables for template substitution
   *
   * @type {Record<string, string>} [templateVariables]
   * @description Key-value pairs for substituting variables in templates.
   * Variables are replaced using {{key}} syntax in template files.
   *
   * @example
   * templateVariables: {
   *   'projectName': 'My Icon Set',
   *   'version': '1.2.3',
   *   'author': 'John Doe'
   * }
   *
   * @since 2.0.0
   */
  templateVariables?: Record<string, string>;
}

/**
 * Build operation result information
 *
 * @interface BuildResult
 * @description Result object returned from build operations containing
 * success status, error information, timing data, and output file list.
 *
 * @since 2.0.0
 */
export interface BuildResult {
  /**
   * Whether the build completed successfully
   *
   * @type {boolean} success
   * @description True if the build completed without errors,
   * false if any errors occurred during processing.
   *
   * @since 2.0.0
   */
  success: boolean;

  /**
   * Error information if build failed
   *
   * @type {Error | string} [error]
   * @description Error instance or error message if the build failed.
   * Only present when success is false.
   *
   * @since 2.0.0
   */
  error?: Error | string;

  /**
   * Total build duration in milliseconds
   *
   * @type {number} [duration]
   * @description Time taken for the entire build process.
   * Useful for performance monitoring and optimization.
   *
   * @since 2.0.0
   */
  duration?: number;

  /**
   * List of generated output files
   *
   * @type {string[]} [outputFiles]
   * @description Array of file paths for all generated font and demo files.
   * Useful for post-processing or deployment operations.
   *
   * @since 2.0.0
   */
  outputFiles?: string[];
}

/**
 * Font generation result with detailed format information
 *
 * @interface FontGenerationResult
 * @description Detailed result information for font generation operations
 * including per-format success/failure tracking and comprehensive error reporting.
 *
 * @since 2.0.0
 */
export interface FontGenerationResult {
  /**
   * Successfully generated font formats
   *
   * @type {string[]} successful
   * @description Array of font format names that were generated successfully.
   *
   * @example
   * successful: ['woff2', 'woff', 'ttf']
   *
   * @since 2.0.0
   */
  successful: string[];

  /**
   * Failed font format generations
   *
   * @type {string[]} failed
   * @description Array of font format names that failed to generate.
   *
   * @example
   * failed: ['eot'] // EOT generation failed
   *
   * @since 2.0.0
   */
  failed: string[];

  /**
   * Total time for all font generation in milliseconds
   *
   * @type {number} totalDuration
   * @description Combined time for generating all requested font formats.
   *
   * @since 2.0.0
   */
  totalDuration: number;

  /**
   * Detailed error information for failed formats
   *
   * @type {Array<{format: string, error: Error | string}>} errors
   * @description Array of error objects containing format name and error details
   * for each failed font generation attempt.
   *
   * @since 2.0.0
   */
  errors: Array<{ format: string; error: Error | string }>;
}

/**
 * Processing statistics and metrics
 *
 * @interface ProcessingStats
 * @description Comprehensive statistics about file processing including
 * counts, sizes, and compression metrics. Useful for monitoring and optimization.
 *
 * @since 2.0.0
 */
export interface ProcessingStats {
  /**
   * Total number of input files processed
   *
   * @type {number} totalFiles
   * @description Count of all files that were considered for processing.
   *
   * @since 2.0.0
   */
  totalFiles: number;

  /**
   * Number of files successfully processed
   *
   * @type {number} processedFiles
   * @description Count of files that were successfully converted to font glyphs.
   *
   * @since 2.0.0
   */
  processedFiles: number;

  /**
   * Number of files that failed processing
   *
   * @type {number} failedFiles
   * @description Count of files that could not be processed due to errors.
   *
   * @since 2.0.0
   */
  failedFiles: number;

  /**
   * Total size of input files in bytes
   *
   * @type {number} totalSize
   * @description Combined size of all input SVG files before processing.
   *
   * @since 2.0.0
   */
  totalSize: number;

  /**
   * Total size of output files in bytes
   *
   * @type {number} outputSize
   * @description Combined size of all generated font files after processing.
   *
   * @since 2.0.0
   */
  outputSize: number;

  /**
   * Compression ratio achieved (output/input)
   *
   * @type {number} [compressionRatio]
   * @description Ratio of output size to input size. Values less than 1.0
   * indicate compression was achieved. Only calculated when both sizes are available.
   *
   * @example
   * compressionRatio: 0.25 // Output is 25% of input size (75% compression)
   *
   * @since 2.0.0
   */
  compressionRatio?: number;
}

/**
 * Build phase identifier for progress tracking
 *
 * @typedef {('svg'|'font'|'demo'|'cleanup')} BuildPhase
 * @description Enumeration of build phases for progress tracking and reporting.
 *
 * @property {'svg'} svg - SVG file processing and optimization phase
 * @property {'font'} font - Font file generation phase
 * @property {'demo'} demo - Demo file generation phase
 * @property {'cleanup'} cleanup - Temporary file cleanup phase
 *
 * @since 2.0.0
 */
export type BuildPhase =
  | 'svg'
  | 'font'
  | 'demo'
  | 'cleanup'
  | 'SVG Processing'
  | 'Font Generation'
  | 'Demo Generation'
  | 'Batch Processing';

/**
 * Progress information for build operations
 *
 * @interface ProgressInfo
 * @description Detailed progress information provided during build operations
 * for progress bars, status displays, and monitoring systems.
 *
 * @since 2.0.0
 */
export interface ProgressInfo {
  /**
   * Current build phase
   *
   * @type {BuildPhase} phase
   * @description Current phase of the build process for context-aware progress display.
   *
   * @since 2.0.0
   */
  phase: BuildPhase;

  /**
   * Number of completed items in current phase
   *
   * @type {number} completed
   * @description Count of items completed in the current phase.
   *
   * @since 2.0.0
   */
  completed: number;

  /**
   * Total number of items in current phase
   *
   * @type {number} total
   * @description Total count of items to be processed in current phase.
   *
   * @since 2.0.0
   */
  total: number;

  /**
   * Description of current operation
   *
   * @type {string} [current]
   * @description Human-readable description of the current operation being performed.
   *
   * @example
   * current: 'Processing home.svg'
   * current: 'Generating WOFF2 font'
   *
   * @since 2.0.0
   */
  current?: string;

  /**
   * Detailed processing statistics
   *
   * @type {ProcessingStats} [stats]
   * @description Optional detailed statistics about the processing operation.
   *
   * @since 2.0.0
   */
  stats?: ProcessingStats;
}

/**
 * Progress callback function type
 *
 * @typedef {Function} ProgressCallback
 * @description Callback function called during build operations to report progress.
 *
 * @param {ProgressInfo} progress - Current progress information
 * @returns {void}
 *
 * @example
 * const progressCallback = (progress) => {
 *   console.log(`${progress.phase}: ${progress.completed}/${progress.total}`);
 *   if (progress.current) {
 *     console.log(`  ${progress.current}`);
 *   }
 * };
 *
 * @since 2.0.0
 */
export type ProgressCallback = (progress: ProgressInfo) => void;

/**
 * Enhanced configuration options with advanced features
 *
 * @interface EnhancedOptions
 * @extends InitOptionsParams
 * @description Comprehensive configuration interface that extends basic options
 * with advanced features including performance optimization, batch processing,
 * monitoring, and customization capabilities.
 *
 * @since 2.0.0
 */
export interface EnhancedOptions extends InitOptionsParams {
  // Performance and concurrency options

  /**
   * Maximum number of concurrent operations
   *
   * @type {number} [maxConcurrency=4]
   * @description Limits concurrent file processing operations to prevent
   * resource exhaustion. Adjust based on system capabilities.
   *
   * @minimum 1
   * @maximum 16
   * @default 4
   * @since 2.0.0
   */
  maxConcurrency?: number;

  /**
   * Enable caching for improved performance
   *
   * @type {boolean} [enableCache=true]
   * @description When true, caches intermediate results to speed up
   * subsequent builds with unchanged inputs.
   *
   * @default true
   * @since 2.0.0
   */
  enableCache?: boolean;

  /**
   * Custom cache directory path
   *
   * @type {string} [cacheDir]
   * @description Directory for storing cache files. If not specified,
   * uses system temporary directory.
   *
   * @example
   * cacheDir: './.cache/svgs2fonts'
   *
   * @since 2.0.0
   */
  cacheDir?: string;

  /**
   * Enable streaming processing for large file sets
   *
   * @type {boolean} [streamProcessing=false]
   * @description When true, processes files using streaming I/O to
   * reduce memory usage for large icon sets.
   *
   * @default false
   * @since 2.0.0
   */
  streamProcessing?: boolean;

  /**
   * File size threshold for enabling streaming (bytes)
   *
   * @type {number} [streamProcessingThreshold=1048576]
   * @description Files larger than this size will be processed using
   * streaming I/O when streamProcessing is enabled.
   *
   * @default 1048576 (1MB)
   * @since 2.0.0
   */
  streamProcessingThreshold?: number;

  /**
   * Chunk size for streaming operations (bytes)
   *
   * @type {number} [streamChunkSize=65536]
   * @description Size of data chunks when using streaming processing.
   *
   * @default 65536 (64KB)
   * @since 2.0.0
   */
  streamChunkSize?: number;

  /**
   * Memory usage limit in bytes
   *
   * @type {number} [memoryLimit]
   * @description Maximum memory usage allowed for the build process.
   * Process will attempt to stay within this limit.
   *
   * @example
   * memoryLimit: 512 * 1024 * 1024 // 512MB
   *
   * @since 2.0.0
   */
  memoryLimit?: number;

  /**
   * Maximum memory cache size in bytes
   *
   * @type {number} [maxMemoryCacheSize=67108864]
   * @description Maximum size of in-memory cache before writing to disk.
   *
   * @default 67108864 (64MB)
   * @since 2.0.0
   */
  maxMemoryCacheSize?: number;

  /**
   * Maximum age for cached files in milliseconds
   *
   * @type {number} [maxFileCacheAge=86400000]
   * @description Cache files older than this will be considered stale.
   *
   * @default 86400000 (24 hours)
   * @since 2.0.0
   */
  maxFileCacheAge?: number;

  /**
   * Enable cache compression
   *
   * @type {boolean} [compressCache=true]
   * @description When true, compresses cache files to save disk space.
   *
   * @default true
   * @since 2.0.0
   */
  compressCache?: boolean;

  /**
   * File size threshold for compression (bytes)
   *
   * @type {number} [compressionThreshold=1024]
   * @description Files smaller than this size will not be compressed.
   *
   * @default 1024 (1KB)
   * @since 2.0.0
   */
  compressionThreshold?: number;

  /**
   * Enable output file compression
   *
   * @type {boolean} [compressFiles=false]
   * @description When true, applies additional compression to output files.
   *
   * @default false
   * @since 2.0.0
   */
  compressFiles?: boolean;

  /**
   * Maximum batch size for batch operations
   *
   * @type {number} [maxBatchSize=100]
   * @description Maximum number of files to process in a single batch.
   *
   * @default 100
   * @since 2.0.0
   */
  maxBatchSize?: number;

  // Advanced font options

  /**
   * Font formats to generate
   *
   * @type {FontFormat[]} [fontFormats=['ttf','eot','woff','woff2']]
   * @description Array of font formats to generate. Order affects processing sequence.
   *
   * @see FontFormat for available options
   * @default ['ttf','eot','woff','woff2']
   * @since 2.0.0
   */
  fontFormats?: FontFormat[];

  /**
   * Font metrics configuration
   *
   * @type {FontMetrics} [fontMetrics]
   * @description Advanced typography settings for precise font appearance control.
   *
   * @see FontMetrics
   * @since 2.0.0
   */
  fontMetrics?: FontMetrics;

  /**
   * Font subsetting options
   *
   * @type {SubsettingOptions} [subsetting]
   * @description Configuration for creating subset fonts with specific glyphs.
   *
   * @see SubsettingOptions
   * @since 2.0.0
   */
  subsetting?: SubsettingOptions;

  /**
   * Font optimization settings
   *
   * @type {OptimizationOptions} [optimization]
   * @description Advanced optimization settings for file size reduction.
   *
   * @see OptimizationOptions
   * @since 2.0.0
   */
  optimization?: OptimizationOptions;

  // Batch processing options

  /**
   * Enable batch processing mode
   *
   * @type {boolean} [batchMode=false]
   * @description When true, enables processing of multiple input directories.
   *
   * @default false
   * @since 2.0.0
   */
  batchMode?: boolean;

  /**
   * Array of input directories for batch mode
   *
   * @type {string[]} [inputDirectories]
   * @description List of directories to process when batchMode is enabled.
   *
   * @example
   * inputDirectories: ['./icons/set1', './icons/set2', './icons/set3']
   *
   * @since 2.0.0
   */
  inputDirectories?: string[];

  /**
   * Output path pattern for batch mode
   *
   * @type {string} [outputPattern='[name]/[fontname]']
   * @description Template for generating output paths in batch mode.
   * Supports [name] and [fontname] placeholders.
   *
   * @example
   * outputPattern: 'fonts/[name]'
   * outputPattern: '[name]/[fontname]-v1'
   *
   * @default '[name]/[fontname]'
   * @since 2.0.0
   */
  outputPattern?: string;

  /**
   * Number of directories to process simultaneously
   *
   * @type {number} [batchSize=10]
   * @description Maximum number of directories to process concurrently in batch mode.
   *
   * @minimum 1
   * @maximum 50
   * @default 10
   * @since 2.0.0
   */
  batchSize?: number;

  /**
   * Continue processing on individual errors
   *
   * @type {boolean} [continueOnError=false]
   * @description When true, continues batch processing even if individual
   * directories fail. Failed directories are reported at the end.
   *
   * @default false
   * @since 2.0.0
   */
  continueOnError?: boolean;

  /**
   * Preserve input directory structure in output
   *
   * @type {boolean} [preserveDirectoryStructure=false]
   * @description When true, maintains the relative directory structure
   * of input directories in the output.
   *
   * @default false
   * @since 2.0.0
   */
  preserveDirectoryStructure?: boolean;

  /**
   * Output file naming convention
   *
   * @type {('original'|'lowercase'|'kebab-case'|'camelCase')} [outputNamingConvention='original']
   * @description Convention for naming output files and CSS classes.
   *
   * @default 'original'
   * @since 2.0.0
   */
  outputNamingConvention?: 'original' | 'lowercase' | 'kebab-case' | 'camelCase';

  // Monitoring and debugging options

  /**
   * Enable verbose output
   *
   * @type {boolean} [verbose=false]
   * @description When true, provides detailed logging and progress information.
   *
   * @default false
   * @since 2.0.0
   */
  verbose?: boolean;

  /**
   * Progress callback for monitoring
   *
   * @type {ProgressCallback} [progressCallback]
   * @description Optional callback function for receiving progress updates.
   *
   * @see ProgressCallback
   * @since 2.0.0
   */
  progressCallback?: ProgressCallback;

  /**
   * Enable performance analysis and reporting
   *
   * @type {boolean} [performanceAnalysis=false]
   * @description When true, collects and reports detailed performance metrics.
   *
   * @default false
   * @since 2.0.0
   */
  performanceAnalysis?: boolean;

  // Template customization
}
