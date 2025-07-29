/**
 * @fileoverview Single Directory Font Generation Processor
 * @description Processor for handling font generation from a single directory of SVG files
 *
 * @module processors/SingleDirectoryProcessor
 * @author Wayne <michealwayne@163.com>
 * @since 2.0.0
 * @version 2.1.0
 */
import { ConfigurationManager } from '../config';
import { PerformanceTracker } from '../core';
/**
 * Single directory font generation processor
 *
 * @class SingleDirectoryProcessor
 * @description Processor that orchestrates the entire font generation
 * pipeline for a single directory of SVG files
 *
 * @since 2.0.0
 */
export declare class SingleDirectoryProcessor {
  private configManager;
  private performanceTracker?;
  /**
   * Create a new single directory processor instance
   *
   * @constructor
   * @param {ConfigurationManager} configManager - Validated configuration manager instance
   * @param {PerformanceTracker} [performanceTracker] - Optional performance tracking instance
   *
   * @since 2.0.0
   */
  constructor(
    configManager: ConfigurationManager,
    performanceTracker?: PerformanceTracker | undefined
  );
  /**
   * Execute font generation process for single directory
   *
   * @async
   * @method process
   * @description Orchestrates the complete font generation pipeline
   *
   * @returns {Promise<true | Error>} Promise resolving to true on success, Error on failure
   *
   * @since 2.0.0
   */
  process(): Promise<true | Error>;
  /**
   * Create and configure font generation builders
   *
   * @private
   * @method createBuilders
   * @description Instantiates and configures all required builders
   *
   * @returns {BuilderSetup} Object containing configured builders
   *
   * @since 2.0.0
   */
  private createBuilders;
  /**
   * Log successful execution completion details
   *
   * @private
   * @async
   * @method logSuccess
   * @description Outputs execution success information when verbose mode is enabled
   *
   * @returns {Promise<void>} Promise that resolves when logging is complete
   *
   * @since 2.0.0
   */
  private logSuccess;
}
//# sourceMappingURL=SingleDirectoryProcessor.d.ts.map
