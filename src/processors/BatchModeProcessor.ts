/**
 * @fileoverview Batch Mode Font Generation Processor
 * @description Processor for handling font generation from multiple directories in batch mode
 *
 * @module processors/BatchModeProcessor
 * @author Wayne <michealwayne@163.com>
 * @since 2.0.0
 * @version 2.1.1
 */

import { ConfigurationManager, createConfiguration } from '../config';
import { createProgressMonitor, PerformanceTracker, ProgressMonitor } from '../core';
import { ProgressInfo } from '../types/core/ProcessingTypes';
import { SingleDirectoryProcessor } from './SingleDirectoryProcessor';

/**
 * Batch mode font generation processor
 *
 * @class BatchModeProcessor
 * @description Processor that handles font generation for multiple directories
 *
 * @since 2.0.0
 */
export class BatchModeProcessor {
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
    private configManager: ConfigurationManager,
    private performanceTracker?: PerformanceTracker
  ) {}

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
  async process(): Promise<true | Error> {
    const options = this.configManager.getOptions();

    try {
      const { inputDirectories } = options;

      if (!inputDirectories || inputDirectories.length === 0) {
        throw new Error('No input directories specified for batch processing');
      }

      // Setup monitoring

      let progressMonitor: ProgressMonitor | undefined;

      if (options.progressCallback || options.verbose) {
        progressMonitor = createProgressMonitor();
        if (options.progressCallback) {
          progressMonitor.onProgress(options.progressCallback);
        }
      }

      this.performanceTracker?.startPhase('Batch Processing');

      const batchSize = options.batchSize || 3;
      const results: Array<true | Error> = [];

      // Process directories in batches
      for (let i = 0; i < inputDirectories.length; i += batchSize) {
        const batch = inputDirectories.slice(i, i + batchSize);

        // Process batch in parallel
        const batchPromises = batch.map(async directory => {
          try {
            // Create configuration for this directory
            const dirOptions = {
              ...options,
              src: directory,
              dist: options.dist ? `${options.dist}/${directory.split('/').pop()}` : undefined,
            };

            const dirConfigManager = createConfiguration(dirOptions);
            const processor = new SingleDirectoryProcessor(
              dirConfigManager,
              this.performanceTracker
            );

            return await processor.process();
          } catch (error) {
            if (options.continueOnError) {
              console.warn(`[svgs2fonts] Failed to process directory ${directory}:`, error);
              return error instanceof Error ? error : new Error(String(error));
            }
            throw error;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Report progress
        if (progressMonitor && options.progressCallback) {
          const progressInfo: ProgressInfo = {
            phase: 'Batch Processing',
            completed: Math.min(i + batchSize, inputDirectories.length),
            total: inputDirectories.length,
            current: `Processed batch ${Math.floor(i / batchSize) + 1}`,
          };
          options.progressCallback(progressInfo);
        }
      }

      this.performanceTracker?.endPhase('Batch Processing');

      // Check results
      const errors = results.filter((result): result is Error => result instanceof Error);
      const successes = results.filter(result => result === true);

      if (options.verbose) {
        const { log } = await import('../utils');
        log(
          `[svgs2fonts] Batch processing completed: ${successes.length} successful, ${errors.length} failed`
        );
      }

      // If all failed or some failed without continueOnError
      if (errors.length > 0 && !options.continueOnError) {
        throw new Error(`Batch processing failed: ${errors.length} directories failed`);
      }

      return true;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }
}
