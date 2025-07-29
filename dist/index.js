'use strict';
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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.init = void 0;
const config_1 = require('./config');
const core_1 = require('./core');
const processors_1 = require('./processors');
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
async function init(options) {
  try {
    // Validate input parameters
    if (!options || typeof options !== 'object') {
      throw new Error('Options parameter is required and must be an object');
    }
    // Apply backward compatibility and create configuration
    const { configManager, performanceTracker } = await setupConfiguration(options);
    const validatedOptions = configManager.getOptions();
    // Log configuration summary if verbose mode is enabled
    await logConfiguration(configManager, validatedOptions.verbose);
    // Choose appropriate processing mode based on configuration
    const processor =
      validatedOptions.batchMode && validatedOptions.inputDirectories
        ? new processors_1.BatchModeProcessor(configManager, performanceTracker)
        : new processors_1.SingleDirectoryProcessor(configManager, performanceTracker);
    // Execute the processing pipeline
    const result = await processor.process();
    // Log performance analysis if enabled
    logPerformanceAnalysis(performanceTracker, validatedOptions.performanceAnalysis);
    return result;
  } catch (error) {
    return await handleError(error, options);
  }
}
exports.init = init;
/**
 * @typedef {Object} ConfigurationSetup
 * @property {ConfigurationManager} configManager - Validated configuration manager
 * @property {PerformanceTracker} [performanceTracker] - Performance tracking instance
 */
/**
 * Setup configuration manager and performance tracker
 *
 * @async
 * @function setupConfiguration
 * @description Initializes the configuration system with backward compatibility support
 * and optional performance tracking. Validates all options and applies default values.
 *
 * @param {Partial<InitOptionsParams> | Partial<EnhancedOptions>} options - Raw configuration options
 *
 * @returns {Promise<ConfigurationSetup>} Configuration manager and optional performance tracker
 *
 * @throws {Error} Configuration validation errors
 * @throws {Error} Backward compatibility conversion errors
 *
 * @private
 * @since 2.0.0
 */
async function setupConfiguration(options) {
  // Apply backward compatibility layer to handle legacy options
  const compatLayer = (0, config_1.createBackwardCompatibilityLayer)();
  const enhancedOptions = compatLayer.convertLegacyOptions(options);
  // Create and validate configuration with comprehensive error handling
  const configManager = (0, config_1.createConfiguration)(enhancedOptions);
  const validatedOptions = configManager.getOptions();
  // Log deprecation warnings for legacy option usage
  compatLayer.logDeprecationWarnings(validatedOptions.verbose || false);
  // Initialize performance tracker if analysis is requested
  const performanceTracker = validatedOptions.performanceAnalysis
    ? (0, core_1.createPerformanceTracker)()
    : undefined;
  return { configManager, performanceTracker };
}
/**
 * Log configuration summary to console
 *
 * @async
 * @function logConfiguration
 * @description Outputs a detailed configuration summary when verbose mode is enabled.
 * Useful for debugging and verifying configuration settings.
 *
 * @param {ConfigurationManager} configManager - Configuration manager instance
 * @param {boolean} [verbose=false] - Whether to enable verbose logging
 *
 * @returns {Promise<void>} Promise that resolves when logging is complete
 *
 * @private
 * @since 2.0.0
 */
async function logConfiguration(configManager, verbose = false) {
  if (verbose) {
    const { log } = await Promise.resolve().then(() => __importStar(require('./utils')));
    const configSummary = configManager.getSummary();
    log(`[svgs2fonts] Configuration Summary:\n${configSummary}`);
  }
}
/**
 * Log performance analysis results
 *
 * @function logPerformanceAnalysis
 * @description Outputs detailed performance metrics including timing breakdowns,
 * memory usage, and optimization suggestions when performance analysis is enabled.
 *
 * @param {PerformanceTracker} [performanceTracker] - Performance tracker instance
 * @param {boolean} [performanceAnalysis=false] - Whether performance analysis is enabled
 *
 * @returns {void}
 *
 * @private
 * @since 2.0.0
 */
function logPerformanceAnalysis(performanceTracker, performanceAnalysis = false) {
  if (performanceTracker && performanceAnalysis) {
    console.log('\n[svgs2fonts] Performance Analysis:');
    console.log('=====================================');
    console.log(performanceTracker.getSummary());
    console.log('=====================================\n');
  }
}
/**
 * Handle and report errors with structured error information
 *
 * @async
 * @function handleError
 * @description Provides comprehensive error handling with structured reporting,
 * helpful suggestions, and different verbosity levels.
 *
 * @param {unknown} error - The error that occurred (can be any type)
 * @param {Partial<InitOptionsParams> | Partial<EnhancedOptions>} options - Original options for context
 *
 * @returns {Promise<Error>} Normalized Error instance with additional context
 *
 * @private
 * @since 2.0.0
 */
async function handleError(error, options) {
  // Extract verbose setting for appropriate error reporting level
  const verbose = options.verbose || false;
  const errorMessage = error instanceof Error ? error.message : String(error);
  // Generate appropriate error output based on verbosity level
  if (verbose) {
    console.error('\n[svgs2fonts] Detailed Error Report:');
    console.error('===================================');
    console.error(`Error: ${errorMessage}`);
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error(`Node Version: ${process.version}`);
    console.error(`Platform: ${process.platform}`);
    console.error(`Working Directory: ${process.cwd()}`);
    console.error('\nSuggestions:');
    console.error('- Verify that all required options are provided and valid');
    console.error('- Check that source directory exists and contains SVG files');
    console.error('- Ensure output directory is writable and has sufficient space');
    console.error('- Validate font name contains only alphanumeric characters');
    console.error('- Check Node.js version compatibility (>= 12.0.0 required)');
    console.error('- Review console output for specific error details');
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    console.error('===================================\n');
  } else {
    console.error('[svgs2fonts] Error:', errorMessage);
    console.error('[svgs2fonts] Use --verbose flag for detailed error information');
  }
  // Return normalized Error instance
  return error instanceof Error ? error : new Error(String(error));
}
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
exports.default = {
  init,
  createConfiguration: config_1.createConfiguration,
  createBackwardCompatibilityLayer: config_1.createBackwardCompatibilityLayer,
};
/**
 * @exports init - Main initialization function
 * @exports default - Factory functions for advanced usage
 */
//# sourceMappingURL=index.js.map
