'use strict';
/**
 * @fileoverview Batch Mode Font Generation Processor
 * @description Processor for handling font generation from multiple directories in batch mode
 *
 * @module processors/BatchModeProcessor
 * @author Wayne <michealwayne@163.com>
 * @since 2.0.0
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
Object.defineProperty(exports, '__esModule', { value: true });
exports.BatchModeProcessor = void 0;
const config_1 = require('../config');
const core_1 = require('../core');
const SingleDirectoryProcessor_1 = require('./SingleDirectoryProcessor');
/**
 * Batch mode font generation processor
 *
 * @class BatchModeProcessor
 * @description Processor that handles font generation for multiple directories
 *
 * @since 2.0.0
 */
class BatchModeProcessor {
  /**
   * Create a new batch mode processor instance
   *
   * @constructor
   * @param {ConfigurationManager} configManager - Validated configuration manager instance
   * @param {PerformanceTracker} [performanceTracker] - Optional performance tracking instance
   *
   * @since 2.0.0
   */
  constructor(configManager, performanceTracker) {
    this.configManager = configManager;
    this.performanceTracker = performanceTracker;
  }
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
  async process() {
    const options = this.configManager.getOptions();
    try {
      const { inputDirectories } = options;
      if (!inputDirectories || inputDirectories.length === 0) {
        throw new Error('No input directories specified for batch processing');
      }
      // Setup monitoring
      let progressMonitor;
      if (options.progressCallback || options.verbose) {
        progressMonitor = (0, core_1.createProgressMonitor)();
        if (options.progressCallback) {
          progressMonitor.onProgress(options.progressCallback);
        }
      }
      this.performanceTracker?.startPhase('Batch Processing');
      const batchSize = options.batchSize || 3;
      const results = [];
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
            const dirConfigManager = (0, config_1.createConfiguration)(dirOptions);
            const processor = new SingleDirectoryProcessor_1.SingleDirectoryProcessor(
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
          const progressInfo = {
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
      const errors = results.filter(result => result instanceof Error);
      const successes = results.filter(result => result === true);
      if (options.verbose) {
        const { log } = await Promise.resolve().then(() => __importStar(require('../utils')));
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
exports.BatchModeProcessor = BatchModeProcessor;
//# sourceMappingURL=BatchModeProcessor.js.map
