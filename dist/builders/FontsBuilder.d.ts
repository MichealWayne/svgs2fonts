/**
 * @module FontsBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced font generation with factory pattern and async pipelines
 * @summary Converts SVG font to various web font formats (TTF, EOT, WOFF, WOFF2)
 * @since 2.0.0
 */
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
  private readonly resourceManager;
  /**
   * Creates a new FontsBuilder instance
   * @param {SVGBuilder} svgBuilder - SVG builder with font data
   */
  constructor(svgBuilder: SVGBuilder);
  /**
   * Generate a single font format with detailed result
   * @param {string} format - Font format to generate
   * @returns {Promise<FontGenerationResult>} Generation result
   */
  generateFormat(format: string): Promise<FontGenerationResult>;
  /**
   * Legacy methods for backward compatibility
   * @deprecated Use generateFormat('ttf') instead
   * @returns {Promise<boolean>} Success flag
   */
  ttf(): Promise<boolean>;
  /**
   * @deprecated Use generateFormat('eot') instead
   * @returns {Promise<boolean>} Success flag
   */
  eot(): Promise<boolean>;
  /**
   * @deprecated Use generateFormat('woff') instead
   * @returns {Promise<boolean>} Success flag
   */
  woff(): Promise<boolean>;
  /**
   * @deprecated Use generateFormat('woff2') instead
   * @returns {Promise<boolean>} Success flag
   */
  woff2(): Promise<boolean>;
  /**
   * Generate multiple font formats in parallel with detailed results
   * @param {readonly string[]} [formats=['ttf', 'eot', 'woff', 'woff2']] - Formats to generate
   * @returns {Promise<BatchGenerationResult>} Batch generation results
   */
  generateBatch(formats?: readonly string[]): Promise<BatchGenerationResult>;
  /**
   * Legacy batch generation method for backward compatibility
   * @deprecated Use generateBatch instead
   * @param {string[]} [formats=['ttf', 'eot', 'woff', 'woff2']] - Formats to generate
   * @returns {Promise<{ success: string[]; failed: string[] }>} Simple result object
   */
  generateAll(formats?: string[]): Promise<{
    success: string[];
    failed: string[];
  }>;
  /**
   * Calculates compression ratio between TTF and WOFF2
   * @private
   * @param {readonly FontGenerationResult[]} results - Generation results
   * @returns {number | undefined} Compression percentage or undefined if not calculable
   */
  private calculateCompressionRatio;
  /**
   * Logs batch generation results
   * @private
   * @param {readonly FontGenerationResult[]} successful - Successful generation results
   * @param {readonly FontGenerationResult[]} failed - Failed generation results
   * @param {number} totalTime - Total generation time in milliseconds
   */
  private logBatchResults;
  /**
   * Get memory usage statistics
   * @returns {{ svg: number; ttf: number }} Memory usage in bytes
   */
  getMemoryUsage(): {
    svg: number;
    ttf: number;
  };
  /**
   * Clean up resources
   */
  cleanup(): void;
  /**
   * Get supported font formats
   * @static
   * @returns {ReadonlyArray<string>} Array of supported format names
   */
  static getSupportedFormats(): ReadonlyArray<string>;
}
//# sourceMappingURL=FontsBuilder.d.ts.map
