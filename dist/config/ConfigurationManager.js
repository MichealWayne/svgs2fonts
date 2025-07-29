'use strict';
/**
 * @fileoverview Configuration Management System
 * @description Configuration manager for font generation
 *
 * @module config/ConfigurationManager
 * @author Wayne <michealwayne@163.com>
 * @since 1.0.0
 * @version 2.1.0
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createConfiguration = exports.ConfigurationManager = exports.ConfigurationError = void 0;
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const options_1 = __importDefault(require('../builders/options'));
/**
 * Default enhanced options extending the base options
 */
const ENHANCED_DEFAULT_OPTIONS = {
  // Font options
  fontFormats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
  // Batch processing
  batchMode: false,
  inputDirectories: undefined,
  batchSize: 3,
  continueOnError: true,
  // Monitoring
  verbose: false,
  progressCallback: undefined,
  performanceAnalysis: false,
};
/**
 * Configuration validation errors
 */
class ConfigurationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
    this.name = 'ConfigurationError';
  }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Advanced configuration manager with validation and defaults
 */
class ConfigurationManager {
  /**
   * Create new configuration manager
   *
   * @param rawOptions - Raw configuration options
   */
  constructor(rawOptions) {
    this.options = this.createValidatedOptions(rawOptions);
  }
  /**
   * Get validated and processed options
   */
  getOptions() {
    return { ...this.options };
  }
  /**
   * Get configuration summary for debugging
   */
  getSummary() {
    const { src, dist, fontName, fontFormats, batchMode } = this.options;
    return `Source: ${src}\nOutput: ${dist}\nFont Name: ${fontName}\nFormats: ${fontFormats?.join(', ')}\nBatch Mode: ${batchMode}`;
  }
  /**
   * Create validated options by merging defaults with user input
   */
  createValidatedOptions(rawOptions) {
    // Start with base defaults
    const baseOptions = { ...options_1.default };
    // Merge with enhanced defaults
    const enhancedDefaults = { ...ENHANCED_DEFAULT_OPTIONS };
    // Apply user options
    const mergedOptions = {
      ...baseOptions,
      ...enhancedDefaults,
      ...rawOptions,
    };
    // Validate required fields
    this.validateRequiredFields(mergedOptions);
    // Normalize paths
    this.normalizePaths(mergedOptions);
    // Validate specific options
    this.validateOptions(mergedOptions);
    return mergedOptions;
  }
  /**
   * Validate required configuration fields
   */
  validateRequiredFields(options) {
    if (!options.src) {
      throw new ConfigurationError('Source directory (src) is required', 'src');
    }
    if (!options.dist) {
      throw new ConfigurationError('Output directory (dist) is required', 'dist');
    }
    if (!options.fontName || typeof options.fontName !== 'string') {
      throw new ConfigurationError('Font name must be a non-empty string', 'fontName');
    }
  }
  /**
   * Normalize file paths
   */
  normalizePaths(options) {
    // Normalize src path
    if (options.src) {
      options.src = path.resolve(options.src);
    }
    // Normalize dist path
    if (options.dist) {
      options.dist = path.resolve(options.dist);
    }
    // Normalize input directories for batch mode
    if (options.inputDirectories && Array.isArray(options.inputDirectories)) {
      options.inputDirectories = options.inputDirectories.map(dir => path.resolve(dir));
    }
  }
  /**
   * Validate specific configuration options
   */
  validateOptions(options) {
    // Validate font formats
    if (options.fontFormats && Array.isArray(options.fontFormats)) {
      const validFormats = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
      const invalidFormats = options.fontFormats.filter(format => !validFormats.includes(format));
      if (invalidFormats.length > 0) {
        throw new ConfigurationError(
          `Invalid font formats: ${invalidFormats.join(', ')}. Valid formats: ${validFormats.join(', ')}`,
          'fontFormats'
        );
      }
    }
    // Validate batch size
    if (options.batchSize && (typeof options.batchSize !== 'number' || options.batchSize < 1)) {
      throw new ConfigurationError('Batch size must be a positive number', 'batchSize');
    }
    // Check source directory exists
    if (options.src && !fs.existsSync(options.src)) {
      throw new ConfigurationError(`Source directory does not exist: ${options.src}`, 'src');
    }
    // Validate batch mode requirements
    if (options.batchMode && (!options.inputDirectories || options.inputDirectories.length === 0)) {
      throw new ConfigurationError(
        'Batch mode requires inputDirectories to be specified',
        'inputDirectories'
      );
    }
  }
}
exports.ConfigurationManager = ConfigurationManager;
/**
 * Factory function to create configuration manager
 */
function createConfiguration(options) {
  return new ConfigurationManager(options);
}
exports.createConfiguration = createConfiguration;
//# sourceMappingURL=ConfigurationManager.js.map
