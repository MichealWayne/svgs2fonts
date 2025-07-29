'use strict';
/**
 * @fileoverview Single Directory Font Generation Processor
 * @description Processor for handling font generation from a single directory of SVG files
 *
 * @module processors/SingleDirectoryProcessor
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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SingleDirectoryProcessor = void 0;
const DemoBuilder_1 = __importDefault(require('../builders/DemoBuilder'));
const FontsBuilder_1 = __importDefault(require('../builders/FontsBuilder'));
const SVGBuilder_1 = __importDefault(require('../builders/SVGBuilder'));
/**
 * Single directory font generation processor
 *
 * @class SingleDirectoryProcessor
 * @description Processor that orchestrates the entire font generation
 * pipeline for a single directory of SVG files
 *
 * @since 2.0.0
 */
class SingleDirectoryProcessor {
  /**
   * Create a new single directory processor instance
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
  async process() {
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
  createBuilders() {
    const options = this.configManager.getOptions();
    // Create SVG builder
    const svgBuilder = new SVGBuilder_1.default(options);
    // Create font builder
    const fontBuilder = new FontsBuilder_1.default(svgBuilder);
    // Create demo builder if needed
    const demoBuilder = !options.noDemo ? new DemoBuilder_1.default(svgBuilder) : undefined;
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
  async logSuccess() {
    const options = this.configManager.getOptions();
    if (options.verbose) {
      const { log } = await Promise.resolve().then(() => __importStar(require('../utils')));
      log('[svgs2fonts] Font generation completed successfully');
    }
  }
}
exports.SingleDirectoryProcessor = SingleDirectoryProcessor;
//# sourceMappingURL=SingleDirectoryProcessor.js.map
