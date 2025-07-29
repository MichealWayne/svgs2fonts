/**
 * @fileoverview Configuration Management System
 * @description Configuration manager for font generation
 *
 * @module config/ConfigurationManager
 * @author Wayne <michealwayne@163.com>
 * @since 1.0.0
 * @version 2.1.1
 */

import * as fs from 'fs';
import * as path from 'path';
import DEFAULT_OPTIONS from '../builders/options';
import { EnhancedOptions, FontFormat } from '../types/OptionType';

/**
 * Default enhanced options extending the base options
 */
const ENHANCED_DEFAULT_OPTIONS: Partial<EnhancedOptions> = {
  // Font options
  fontFormats: ['svg', 'ttf', 'eot', 'woff', 'woff2'] as FontFormat[],

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
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Advanced configuration manager with validation and defaults
 */
export class ConfigurationManager {
  private options: EnhancedOptions;

  /**
   * Create new configuration manager
   *
   * @param rawOptions - Raw configuration options
   */
  constructor(rawOptions: Partial<EnhancedOptions>) {
    this.options = this.createValidatedOptions(rawOptions);
  }

  /**
   * Get validated and processed options
   */
  getOptions(): EnhancedOptions {
    return { ...this.options };
  }

  /**
   * Get configuration summary for debugging
   */
  getSummary(): string {
    const { src, dist, fontName, fontFormats, batchMode } = this.options;
    return `Source: ${src}\nOutput: ${dist}\nFont Name: ${fontName}\nFormats: ${fontFormats?.join(
      ', '
    )}\nBatch Mode: ${batchMode}`;
  }

  /**
   * Create validated options by merging defaults with user input
   */
  private createValidatedOptions(rawOptions: Partial<EnhancedOptions>): EnhancedOptions {
    // Start with base defaults
    const baseOptions = { ...DEFAULT_OPTIONS };

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

    return mergedOptions as EnhancedOptions;
  }

  /**
   * Validate required configuration fields
   */
  private validateRequiredFields(options: any): void {
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
  private normalizePaths(options: any): void {
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
      options.inputDirectories = options.inputDirectories.map((dir: string) => path.resolve(dir));
    }
  }

  /**
   * Validate specific configuration options
   */
  private validateOptions(options: any): void {
    // Validate font formats
    if (options.fontFormats && Array.isArray(options.fontFormats)) {
      const validFormats: FontFormat[] = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
      const invalidFormats = options.fontFormats.filter(
        (format: string) => !validFormats.includes(format as FontFormat)
      );

      if (invalidFormats.length > 0) {
        throw new ConfigurationError(
          `Invalid font formats: ${invalidFormats.join(', ')}. Valid formats: ${validFormats.join(
            ', '
          )}`,
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

/**
 * Factory function to create configuration manager
 */
export function createConfiguration(options: Partial<EnhancedOptions>): ConfigurationManager {
  return new ConfigurationManager(options);
}
