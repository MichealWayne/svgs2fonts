/**
 * @fileoverview Single Directory Font Generation Processor
 * @description Processor for handling font generation from a single directory of SVG files
 *
 * @module processors/SingleDirectoryProcessor
 * @author Wayne <michealwayne@163.com>
 * @since 2.0.0
 * @version 2.1.1
 */

import DemoBuilder from '../builders/DemoBuilder';
import FontsBuilder from '../builders/FontsBuilder';
import SVGBuilder from '../builders/SVGBuilder';
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
export class SingleDirectoryProcessor {
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
    private configManager: ConfigurationManager,
    private performanceTracker?: PerformanceTracker
  ) {}

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
  async process(): Promise<true | Error> {
    try {
      // Create builders
      const { svgBuilder, fontBuilder, demoBuilder } = this.createBuilders();

      // Track performance phases
      this.performanceTracker?.startPhase('SVG Processing');

      // Execute SVG processing
      const svgResult = await svgBuilder.createSvgsFont();
      if (!svgResult) {
        throw new Error('SVG processing failed');
      }

      this.performanceTracker?.endPhase('SVG Processing');
      this.performanceTracker?.startPhase('Font Generation');

      // Execute font generation
      const fontResults = await Promise.all([
        fontBuilder.ttf(),
        fontBuilder.eot(),
        fontBuilder.woff(),
        fontBuilder.woff2(),
      ]);

      // Check if all font generation succeeded
      if (fontResults.some(result => !result)) {
        throw new Error('Font generation failed');
      }

      this.performanceTracker?.endPhase('Font Generation');

      // Execute demo generation if not disabled
      if (demoBuilder) {
        this.performanceTracker?.startPhase('Demo Generation');
        const demoResult = await demoBuilder.html();
        if (!demoResult) {
          throw new Error('Demo generation failed');
        }
        this.performanceTracker?.endPhase('Demo Generation');
      }

      await this.logSuccess();

      // Cleanup
      svgBuilder.clearCache();

      return true;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

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
  private createBuilders() {
    const options = this.configManager.getOptions();

    // Create SVG builder
    const svgBuilder = new SVGBuilder(options);

    // Create font builder
    const fontBuilder = new FontsBuilder(svgBuilder);

    // Create demo builder if needed
    const demoBuilder = !options.noDemo ? new DemoBuilder(svgBuilder) : undefined;

    return { svgBuilder, fontBuilder, demoBuilder };
  }

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
  private async logSuccess() {
    const options = this.configManager.getOptions();

    if (options.verbose) {
      const { log } = await import('../utils');
      log('[svgs2fonts] Font generation completed successfully');
    }
  }
}
