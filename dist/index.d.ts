/**
 * @fileoverview SVG to Font Icons Converter - Enhanced Main Entry Point
 * @description A comprehensive toolkit for converting SVG icons to web fonts with advanced optimization
 * @author Wayne <michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2025-07-23 15:45:00
 * @version 2.1.0
 * @license MIT
 * @see {@link https://github.com/MichealWayne/svgs2fonts} Project Repository
 */
import { createBackwardCompatibilityLayer, createConfiguration } from './config';
import { EnhancedOptions, InitOptionsParams } from './types/OptionType';
/**
 * @typedef {Object} InitResult
 * @property {boolean} success - Whether the operation completed successfully
 * @property {string[]} [outputFiles] - List of generated font files
 * @property {number} [duration] - Total processing time in milliseconds
 * @property {Error} [error] - Error instance if operation failed
 */
/**
 * @typedef {Object} ProcessingOptions
 * @property {Partial<InitOptionsParams> | Partial<EnhancedOptions>} options - Configuration options
 */
/**
 * Initialize and execute SVG to font icon conversion with enhanced configuration support
 *
 * @async
 * @function init
 * @description Main entry point for converting SVG files to web fonts. Supports both single
 * directory processing and batch mode for multiple directories. Includes comprehensive
 * error handling, performance tracking, and backward compatibility.
 *
 * @param {Partial<InitOptionsParams> | Partial<EnhancedOptions>} options - Configuration options
 * @param {string} [options.src] - Source directory containing SVG files
 * @param {string} [options.dist] - Output directory for generated fonts
 * @param {string} [options.fontName='iconfont'] - Name of the generated font family
 * @param {number} [options.unicodeStart=0xE000] - Starting Unicode code point (Private Use Area)
 * @param {boolean} [options.debug=false] - Enable debug mode for detailed logging
 * @param {boolean} [options.verbose=false] - Enable verbose output
 * @param {boolean} [options.noDemo=false] - Skip generation of demo HTML files
 * @param {boolean} [options.performanceAnalysis=false] - Enable performance tracking and reporting
 * @param {boolean} [options.batchMode=false] - Enable batch processing mode
 * @param {string[]} [options.inputDirectories] - Array of input directories for batch mode
 * @param {number} [options.maxConcurrency=4] - Maximum concurrent operations
 * @param {boolean} [options.enableCache=true] - Enable caching for improved performance
 * @param {FontFormat[]} [options.fontFormats=['ttf','eot','woff','woff2']] - Font formats to generate
 * @param {ProgressCallback} [options.progressCallback] - Callback for progress updates
 *
 * @returns {Promise<true | Error>} Promise resolving to true on success, or Error on failure
 *
 * @throws {Error} Configuration validation errors
 * @throws {Error} File system access errors
 * @throws {Error} Font generation errors
 *
 * @example
 * // Basic usage
 * const result = await init({
 *   src: './icons',
 *   dist: './fonts',
 *   fontName: 'my-icons'
 * });
 *
 * @example
 * // Advanced usage with performance tracking
 * const result = await init({
 *   src: './icons',
 *   dist: './fonts',
 *   fontName: 'my-icons',
 *   verbose: true,
 *   performanceAnalysis: true,
 *   fontFormats: ['woff2', 'woff'],
 *   maxConcurrency: 8,
 *   progressCallback: (progress) => {
 *     console.log(`Progress: ${progress.completed}/${progress.total}`);
 *   }
 * });
 *
 * @example
 * // Batch processing multiple directories
 * const result = await init({
 *   batchMode: true,
 *   inputDirectories: ['./icons-set1', './icons-set2'],
 *   dist: './output',
 *   fontName: 'unified-icons',
 *   batchSize: 5,
 *   continueOnError: true
 * });
 *
 * @since 1.0.0
 * @version 2.1.0
 */
export declare function init(
  options: Partial<InitOptionsParams> | Partial<EnhancedOptions>
): Promise<true | Error>;
/**
 * @namespace SVGToFonts
 * @description Factory functions and utilities for advanced font generation workflows
 */
/**
 * Default export providing factory functions for advanced usage scenarios
 *
 * @type {Object}
 * @property {Function} init - Main initialization function
 * @property {Function} createConfiguration - Configuration manager factory
 * @property {Function} createBackwardCompatibilityLayer - Compatibility layer factory
 *
 * @example
 * // Using factory functions for custom workflows
 * import svgs2fonts from 'svgs2fonts';
 *
 * const config = svgs2fonts.createConfiguration(options);
 *
 * @since 2.0.0
 */
declare const _default: {
  readonly init: typeof init;
  readonly createConfiguration: typeof createConfiguration;
  readonly createBackwardCompatibilityLayer: typeof createBackwardCompatibilityLayer;
};
export default _default;
/**
 * @exports init - Main initialization function
 * @exports default - Factory functions for advanced usage
 */
//# sourceMappingURL=index.d.ts.map
