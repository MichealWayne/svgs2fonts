/**
 * @fileoverview Batch Mode Font Generation Processor
 * @description Processor for handling font generation from multiple directories in batch mode
 *
 * @module processors/BatchModeProcessor
 * @author Wayne <michealwayne@163.com>
 * @since 2.0.0
 * @version 2.1.0
 */
import { ConfigurationManager } from '../config';
import { PerformanceTracker } from '../core';
/**
 * Batch mode font generation processor
 *
 * @class BatchModeProcessor
 * @description Processor that handles font generation for multiple directories
 *
 * @since 2.0.0
 */
export declare class BatchModeProcessor {
  private configManager;
  private performanceTracker?;
  /**
   * Create a new batch mode processor instance
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
   * Execute batch font generation process
   *
   * @async
   * @method process
   * @description Processes multiple directories of SVG files in batch mode
   *
   * @returns {Promise<true | Error>} Promise resolving to true on success, Error on failure
   *
   * @since 2.0.0
   */
  process(): Promise<true | Error>;
}
//# sourceMappingURL=BatchModeProcessor.d.ts.map
