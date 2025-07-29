/**
 * @module FontsBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced font generation with factory pattern and async pipelines
 * @summary Converts SVG font to various web font formats (TTF, EOT, WOFF, WOFF2)
 * @since 2.0.0
 */

import fs from 'fs';
import { join } from 'path';
import svg2ttf from 'svg2ttf';
import ttf2eot from 'ttf2eot';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';

import { createIconFile } from '../utils/fsUtils';
import { errorLog, log } from '../utils/utils';
import { SVGBuilder } from './SVGBuilder';

/**
 * Font format metadata
 * @interface FontFormat
 */
export interface FontFormat {
  /** File extension (e.g., 'ttf', 'woff') */
  readonly extension: string;
  /** MIME type for HTTP content-type headers */
  readonly mimeType: string;
  /** Human-readable description */
  readonly description: string;
}

/**
 * Result of a single font format generation
 * @interface FontGenerationResult
 */
export interface FontGenerationResult {
  /** Font format identifier (e.g., 'ttf', 'woff2') */
  readonly format: string;
  /** Whether generation was successful */
  readonly success: boolean;
  /** Path to the generated file (if successful) */
  readonly outputPath?: string;
  /** Size of the generated file in bytes (if successful) */
  readonly fileSize?: number;
  /** Error that occurred (if unsuccessful) */
  readonly error?: Error;
  /** Time taken to generate in milliseconds */
  readonly generationTime?: number;
}

/**
 * Result of a batch font generation operation
 * @interface BatchGenerationResult
 */
export interface BatchGenerationResult {
  /** Array of successful generation results */
  readonly successful: readonly FontGenerationResult[];
  /** Array of failed generation results */
  readonly failed: readonly FontGenerationResult[];
  /** Total time taken for batch operation in milliseconds */
  readonly totalTime: number;
  /** Compression ratio between TTF and WOFF2 (if both were generated) */
  readonly compressionRatio?: number;
}

/**
 * Registry of supported font formats using factory pattern
 * @class FontFormatRegistry
 */
class FontFormatRegistry {
  private static readonly formats: ReadonlyMap<string, FontFormat> = new Map([
    ['ttf', { extension: 'ttf', mimeType: 'font/ttf', description: 'TrueType Font' }],
    [
      'eot',
      {
        extension: 'eot',
        mimeType: 'application/vnd.ms-fontobject',
        description: 'Embedded OpenType',
      },
    ],
    ['woff', { extension: 'woff', mimeType: 'font/woff', description: 'Web Open Font Format' }],
    [
      'woff2',
      { extension: 'woff2', mimeType: 'font/woff2', description: 'Web Open Font Format 2' },
    ],
  ]);

  static getFormat(formatName: string): FontFormat | undefined {
    return this.formats.get(formatName.toLowerCase());
  }

  static getAllFormats(): ReadonlyArray<string> {
    return Array.from(this.formats.keys());
  }

  static isValidFormat(formatName: string): boolean {
    return this.formats.has(formatName.toLowerCase());
  }
}

/**
 * Abstract strategy for font format conversion
 * @abstract
 * @class FontConversionStrategy
 */
abstract class FontConversionStrategy {
  /**
   * Converts TTF buffer to target format
   * @param {Buffer} ttfBuffer - TTF font buffer
   * @returns {Promise<Buffer>} Converted font buffer
   */
  abstract convert(ttfBuffer: Buffer): Promise<Buffer>;

  /**
   * Format identifier
   * @type {string}
   */
  abstract readonly formatName: string;
}

/**
 * TTF conversion strategy (pass-through)
 * @class TTFConversionStrategy
 * @extends {FontConversionStrategy}
 */
class TTFConversionStrategy extends FontConversionStrategy {
  /** @inheritdoc */
  readonly formatName = 'ttf';

  /**
   * @inheritdoc
   */
  async convert(ttfBuffer: Buffer): Promise<Buffer> {
    return ttfBuffer; // TTF is already in the correct format
  }
}

/**
 * EOT conversion strategy
 * @class EOTConversionStrategy
 * @extends {FontConversionStrategy}
 */
class EOTConversionStrategy extends FontConversionStrategy {
  /** @inheritdoc */
  readonly formatName = 'eot';

  /**
   * @inheritdoc
   */
  async convert(ttfBuffer: Buffer): Promise<Buffer> {
    return Buffer.from(ttf2eot(ttfBuffer).buffer);
  }
}

/**
 * WOFF conversion strategy
 * @class WOFFConversionStrategy
 * @extends {FontConversionStrategy}
 */
class WOFFConversionStrategy extends FontConversionStrategy {
  /** @inheritdoc */
  readonly formatName = 'woff';

  /**
   * @inheritdoc
   */
  async convert(ttfBuffer: Buffer): Promise<Buffer> {
    return Buffer.from(ttf2woff(ttfBuffer).buffer);
  }
}

/**
 * WOFF2 conversion strategy
 * @class WOFF2ConversionStrategy
 * @extends {FontConversionStrategy}
 */
class WOFF2ConversionStrategy extends FontConversionStrategy {
  /** @inheritdoc */
  readonly formatName = 'woff2';

  /**
   * @inheritdoc
   */
  async convert(ttfBuffer: Buffer): Promise<Buffer> {
    return Buffer.from(ttf2woff2(ttfBuffer).buffer);
  }
}

/**
 * Factory for creating font conversion strategies
 * @class ConversionStrategyFactory
 */
class ConversionStrategyFactory {
  /**
   * Map of format names to strategy factory functions
   * @private
   * @static
   * @readonly
   */
  private static readonly strategies = new Map<string, () => FontConversionStrategy>([
    ['ttf', () => new TTFConversionStrategy()],
    ['eot', () => new EOTConversionStrategy()],
    ['woff', () => new WOFFConversionStrategy()],
    ['woff2', () => new WOFF2ConversionStrategy()],
  ]);

  /**
   * Creates a conversion strategy for the specified format
   * @param {string} format - Font format identifier
   * @returns {FontConversionStrategy | null} Strategy instance or null if format not supported
   */
  static createStrategy(format: string): FontConversionStrategy | null {
    const strategyFactory = this.strategies.get(format.toLowerCase());
    return strategyFactory ? strategyFactory() : null;
  }
}

/**
 * Resource manager for font generation with automatic cleanup
 * @class FontResourceManager
 */
class FontResourceManager {
  /** Cached SVG content */
  private svgContent?: string;
  /** Cached TTF buffer */
  private ttfBuffer?: Buffer;
  /** Path to SVG file */
  private readonly svgPath: string;

  /**
   * Creates a new resource manager
   * @param {string} svgPath - Path to SVG file
   */
  constructor(svgPath: string) {
    this.svgPath = svgPath;
  }

  /**
   * Gets SVG content with caching
   * @returns {Promise<string>} SVG content
   * @throws {Error} If file cannot be read
   */
  async getSvgContent(): Promise<string> {
    if (!this.svgContent) {
      try {
        this.svgContent = await fs.promises.readFile(this.svgPath, 'utf8');
      } catch (error) {
        const readError = error instanceof Error ? error : new Error(String(error));
        throw new Error(`Failed to read SVG file (${this.svgPath}): ${readError.message}`);
      }
    }
    return this.svgContent;
  }

  /**
   * Gets TTF buffer with caching
   * @returns {Promise<Buffer>} TTF buffer
   * @throws {Error} If conversion fails
   */
  async getTTFBuffer(): Promise<Buffer> {
    if (!this.ttfBuffer) {
      try {
        const svgContent = await this.getSvgContent();
        const ttfResult = svg2ttf(svgContent);
        this.ttfBuffer = Buffer.from(ttfResult.buffer);
      } catch (error) {
        const ttfError = error instanceof Error ? error : new Error(String(error));
        throw new Error(`Failed to create TTF buffer: ${ttfError.message}`);
      }
    }
    return this.ttfBuffer;
  }

  /**
   * Cleans up cached resources
   */
  cleanup(): void {
    this.svgContent = undefined;
    this.ttfBuffer = undefined;
  }

  /**
   * Gets memory usage statistics
   * @returns {{ svg: number; ttf: number }} Memory usage in bytes
   */
  getMemoryUsage(): { svg: number; ttf: number } {
    return {
      svg: this.svgContent ? Buffer.byteLength(this.svgContent, 'utf8') : 0,
      ttf: this.ttfBuffer ? this.ttfBuffer.length : 0,
    };
  }
}

/**
 * Advanced font builder using modern patterns and async processing
 * Converts SVG font to various web font formats
 * @class FontsBuilder
 */
export default class FontsBuilder {
  /** SVG builder instance providing font data */
  protected readonly svgBuilder: SVGBuilder;
  /** Base path for generated font files */
  protected readonly fontsPath: string;
  /** Resource manager for font generation */
  private readonly resourceManager: FontResourceManager;

  /**
   * Creates a new FontsBuilder instance
   * @param {SVGBuilder} svgBuilder - SVG builder with font data
   */
  constructor(svgBuilder: SVGBuilder) {
    this.svgBuilder = svgBuilder;
    this.fontsPath = join(this.svgBuilder.buildOptions.dist, this.svgBuilder.buildOptions.fontName);

    const svgPath = join(
      this.svgBuilder.buildOptions.dist,
      `${this.svgBuilder.buildOptions.fontName}.svg`
    );
    this.resourceManager = new FontResourceManager(svgPath);
  }

  /**
   * Generate a single font format with detailed result
   * @param {string} format - Font format to generate
   * @returns {Promise<FontGenerationResult>} Generation result
   */
  async generateFormat(format: string): Promise<FontGenerationResult> {
    const startTime = performance.now();

    try {
      if (!FontFormatRegistry.isValidFormat(format)) {
        throw new Error(`Unsupported font format: ${format}`);
      }

      const strategy = ConversionStrategyFactory.createStrategy(format);
      if (!strategy) {
        throw new Error(`No conversion strategy available for format: ${format}`);
      }

      const ttfBuffer = await this.resourceManager.getTTFBuffer();
      const convertedBuffer = await strategy.convert(ttfBuffer);

      const outputPath = `${this.fontsPath}.${format}`;
      const success = await createIconFile(outputPath, convertedBuffer, format);

      const endTime = performance.now();

      if (!success) {
        throw new Error(`Failed to write ${format} file`);
      }

      // Get file size for statistics
      const stats = await fs.promises.stat(outputPath);

      return {
        format,
        success: true,
        outputPath,
        fileSize: stats.size,
        generationTime: endTime - startTime,
      };
    } catch (error) {
      const endTime = performance.now();
      const fontError = error instanceof Error ? error : new Error(String(error));

      return {
        format,
        success: false,
        error: fontError,
        generationTime: endTime - startTime,
      };
    }
  }

  /**
   * Legacy methods for backward compatibility
   * @deprecated Use generateFormat('ttf') instead
   * @returns {Promise<boolean>} Success flag
   */
  async ttf(): Promise<boolean> {
    const result = await this.generateFormat('ttf');
    return result.success;
  }

  /**
   * @deprecated Use generateFormat('eot') instead
   * @returns {Promise<boolean>} Success flag
   */
  async eot(): Promise<boolean> {
    const result = await this.generateFormat('eot');
    return result.success;
  }

  /**
   * @deprecated Use generateFormat('woff') instead
   * @returns {Promise<boolean>} Success flag
   */
  async woff(): Promise<boolean> {
    const result = await this.generateFormat('woff');
    return result.success;
  }

  /**
   * @deprecated Use generateFormat('woff2') instead
   * @returns {Promise<boolean>} Success flag
   */
  async woff2(): Promise<boolean> {
    const result = await this.generateFormat('woff2');
    return result.success;
  }

  /**
   * Generate multiple font formats in parallel with detailed results
   * @param {readonly string[]} [formats=['ttf', 'eot', 'woff', 'woff2']] - Formats to generate
   * @returns {Promise<BatchGenerationResult>} Batch generation results
   */
  async generateBatch(
    formats: readonly string[] = ['ttf', 'eot', 'woff', 'woff2']
  ): Promise<BatchGenerationResult> {
    const startTime = performance.now();

    // Validate all formats before starting
    const invalidFormats = formats.filter(format => !FontFormatRegistry.isValidFormat(format));
    if (invalidFormats.length > 0) {
      throw new Error(`Invalid font formats: ${invalidFormats.join(', ')}`);
    }

    try {
      // Pre-load TTF buffer to avoid repeated SVG parsing
      await this.resourceManager.getTTFBuffer();

      // Generate all formats in parallel
      const generationPromises = formats.map(format => this.generateFormat(format));
      const results = await Promise.all(generationPromises);

      const endTime = performance.now();

      // Separate successful and failed results
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);

      // Calculate compression statistics
      const compressionRatio = this.calculateCompressionRatio(successful);

      // Log results if debug mode is enabled
      if (this.svgBuilder.buildOptions.debug) {
        this.logBatchResults(successful, failed, endTime - startTime);
      }

      return {
        successful,
        failed,
        totalTime: endTime - startTime,
        compressionRatio,
      };
    } catch (error) {
      const endTime = performance.now();
      const batchError = error instanceof Error ? error : new Error(String(error));

      // Return all formats as failed
      const failedResults = formats.map(format => ({
        format,
        success: false as const,
        error: batchError,
        generationTime: 0,
      }));

      return {
        successful: [],
        failed: failedResults,
        totalTime: endTime - startTime,
      };
    }
  }

  /**
   * Legacy batch generation method for backward compatibility
   * @deprecated Use generateBatch instead
   * @param {string[]} [formats=['ttf', 'eot', 'woff', 'woff2']] - Formats to generate
   * @returns {Promise<{ success: string[]; failed: string[] }>} Simple result object
   */
  async generateAll(
    formats: string[] = ['ttf', 'eot', 'woff', 'woff2']
  ): Promise<{ success: string[]; failed: string[] }> {
    const result = await this.generateBatch(formats);

    return {
      success: result.successful.map(r => r.format),
      failed: result.failed.map(r => r.format),
    };
  }

  /**
   * Calculates compression ratio between TTF and WOFF2
   * @private
   * @param {readonly FontGenerationResult[]} results - Generation results
   * @returns {number | undefined} Compression percentage or undefined if not calculable
   */
  private calculateCompressionRatio(results: readonly FontGenerationResult[]): number | undefined {
    const ttfResult = results.find(r => r.format === 'ttf' && r.fileSize);
    const woff2Result = results.find(r => r.format === 'woff2' && r.fileSize);

    if (ttfResult?.fileSize && woff2Result?.fileSize) {
      return Math.round((1 - woff2Result.fileSize / ttfResult.fileSize) * 100);
    }

    return undefined;
  }

  /**
   * Logs batch generation results
   * @private
   * @param {readonly FontGenerationResult[]} successful - Successful generation results
   * @param {readonly FontGenerationResult[]} failed - Failed generation results
   * @param {number} totalTime - Total generation time in milliseconds
   */
  private logBatchResults(
    successful: readonly FontGenerationResult[],
    failed: readonly FontGenerationResult[],
    totalTime: number
  ): void {
    log(`[FontsBuilder] Batch generation completed in ${totalTime.toFixed(2)}ms`);

    if (successful.length > 0) {
      const successFormats = successful.map(r => r.format).join(', ');
      log(`[FontsBuilder] Successfully generated: ${successFormats}`);

      // Log file sizes
      successful.forEach(result => {
        if (result.fileSize) {
          const sizeKB = (result.fileSize / 1024).toFixed(2);
          log(`[FontsBuilder] ${result.format.toUpperCase()}: ${sizeKB}KB`);
        }
      });
    }

    if (failed.length > 0) {
      const failedFormats = failed.map(r => r.format).join(', ');
      errorLog(`[FontsBuilder] Failed to generate: ${failedFormats}`);

      // Log specific errors
      failed.forEach(result => {
        if (result.error) {
          errorLog(`[FontsBuilder] ${result.format.toUpperCase()} error: ${result.error.message}`);
        }
      });
    }
  }

  /**
   * Get memory usage statistics
   * @returns {{ svg: number; ttf: number }} Memory usage in bytes
   */
  getMemoryUsage(): { svg: number; ttf: number } {
    return this.resourceManager.getMemoryUsage();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.resourceManager.cleanup();
  }

  /**
   * Get supported font formats
   * @static
   * @returns {ReadonlyArray<string>} Array of supported format names
   */
  static getSupportedFormats(): ReadonlyArray<string> {
    return FontFormatRegistry.getAllFormats();
  }
}
