/**
 * @module SVGBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced SVG to font conversion with elegant architecture
 * @summary Converts individual SVG icons into a single SVG font file
 * @since 2.0.0
 */
import { InitOptionsParams } from '../types/OptionType';
/**
 * Mapping of icon names to unicode strings
 * @interface SvgUnicodeMap
 */
export interface SvgUnicodeMap {
  /** Unicode string for each icon name */
  readonly [iconName: string]: string;
}
/**
 * Legacy type alias for backward compatibility
 * @deprecated Use SvgUnicodeMap instead
 */
export declare type SvgUnicodeObjParams = SvgUnicodeMap;
/**
 * Result of font creation operation
 * @interface FontCreationResult
 */
interface FontCreationResult {
  /** Whether the operation was successful */
  readonly success: boolean;
  /** Mapping of icon names to unicode strings */
  readonly unicodeMap: SvgUnicodeMap;
  /** Error that occurred (if unsuccessful) */
  readonly error?: Error;
  /** Number of SVG files processed */
  readonly processedCount: number;
  /** Total number of SVG files */
  readonly totalCount: number;
}
/**
 * Strategy pattern for Unicode generation
 * @interface UnicodeStrategy
 */
interface UnicodeStrategy {
  /**
   * Generates a unicode code point for an icon
   * @param {string} iconName - Name of the icon
   * @param {Set<number>} existingCodes - Set of already used code points
   * @returns {number} Generated unicode code point
   */
  generate(iconName: string, existingCodes: Set<number>): number;
}
/**
 * Observer pattern for build progress tracking
 * @interface BuildObserver
 */
interface BuildObserver {
  /**
   * Called when progress is made
   * @param {number} current - Current item index
   * @param {number} total - Total number of items
   * @param {string} [currentFile] - Current file being processed
   */
  onProgress(current: number, total: number, currentFile?: string): void;
  /**
   * Called when an error occurs
   * @param {Error} error - Error that occurred
   * @param {string} [context] - Context where the error occurred
   */
  onError(error: Error, context?: string): void;
  /**
   * Called when the build is complete
   * @param {FontCreationResult} result - Result of the build
   */
  onComplete(result: FontCreationResult): void;
}
/**
 * Abstract base class for SVG font builders
 * Uses Template Method pattern for consistent processing flow
 * @abstract
 * @class SVGBuilder
 */
export declare abstract class SVGBuilder {
  /** Build configuration options */
  protected readonly options: InitOptionsParams;
  /** Set of SVG file paths to process */
  protected readonly svgsPaths: ReadonlySet<string>;
  /** Strategy for unicode generation */
  protected readonly unicodeStrategy: UnicodeStrategy;
  /** Observer for build progress */
  protected readonly observer: BuildObserver;
  /** Mapping of icon names to unicode strings */
  protected svgUnicodeObj: SvgUnicodeMap;
  /**
   * Creates a new SVGBuilder
   * @param {Partial<InitOptionsParams>} options - Build options
   */
  constructor(options: Partial<InitOptionsParams>);
  /**
   * Gets the build options
   * @returns {InitOptionsParams} Build options
   */
  get buildOptions(): InitOptionsParams;
  /**
   * Template method that defines the algorithm structure for font creation
   * @returns {Promise<boolean>} True if font creation was successful
   */
  createSvgsFont(): Promise<boolean>;
  /**
   * Hook method for font creation implementation
   * @protected
   * @abstract
   * @returns {Promise<FontCreationResult>} Font creation result
   */
  protected abstract executeFontCreation(): Promise<FontCreationResult>;
  /**
   * Hook method for cleanup implementation
   * @protected
   * @abstract
   */
  protected abstract performCleanup(): void;
  /**
   * Clears the unicode mapping cache
   */
  clearCache(): void;
  /**
   * Gets the unicode mapping
   * @returns {SvgUnicodeMap} Mapping of icon names to unicode strings
   */
  get unicodeMapping(): SvgUnicodeMap;
}
/**
 * Concrete implementation using modern async/await patterns
 * and defensive programming techniques
 */
export default class ConcreteSVGBuilder extends SVGBuilder {
  private static readonly TIMEOUT_MS;
  private static readonly BATCH_LOG_INTERVAL;
  protected executeFontCreation(): Promise<FontCreationResult>;
  private createFontWithStreams;
  private createFontStream;
  private createWriteStream;
  private createCleanupFunction;
  private processSvgFiles;
  private createGlyphStream;
  private extractIconName;
  protected performCleanup(): void;
}
export {};
//# sourceMappingURL=SVGBuilder.d.ts.map
