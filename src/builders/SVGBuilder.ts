/**
 * @module SVGBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced SVG to font conversion with elegant architecture
 * @summary Converts individual SVG icons into a single SVG font file
 * @since 2.0.0
 */

import fs from 'fs';
import { basename, join } from 'path';
import SVGIcons2SVGFont from 'svgicons2svgfont';

import { InitOptionsParams } from '../types/OptionType';
import DEFAULT_OPTIONS from './options';

import { filterSvgFiles, mkdirpSync } from '../utils/fsUtils';
import { errorLog, getIconStrUnicode, isSuccessResult, log } from '../utils/utils';

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
export type SvgUnicodeObjParams = SvgUnicodeMap;

/**
 * Metadata for SVG font stream
 * @interface SvgFontStreamMetadata
 */
interface SvgFontStreamMetadata {
  /** Unicode characters for the glyph */
  readonly unicode: readonly string[];
  /** Name of the icon */
  readonly name: string;
}

/**
 * Extended ReadStream with metadata for SVG font generation
 * @interface SvgFontStream
 * @extends {fs.ReadStream}
 */
interface SvgFontStream extends fs.ReadStream {
  /** Metadata for the glyph */
  readonly metadata: SvgFontStreamMetadata;
}

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
 * Safe unicode generation strategy that avoids collisions
 * @class SafeUnicodeStrategy
 * @implements {UnicodeStrategy}
 */
class SafeUnicodeStrategy implements UnicodeStrategy {
  /**
   * Creates a new SafeUnicodeStrategy
   * @param {number} startUnicode - Starting unicode code point
   */
  constructor(private readonly startUnicode: number) {}

  /**
   * @inheritdoc
   */
  generate(iconName: string, existingCodes: Set<number>): number {
    let unicode = getIconStrUnicode(iconName, this.startUnicode);

    while (existingCodes.has(unicode) && unicode < 59999) {
      unicode++;
    }

    return unicode;
  }
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
 * Default implementation of build observer
 * @class DefaultBuildObserver
 * @implements {BuildObserver}
 */
class DefaultBuildObserver implements BuildObserver {
  /**
   * Creates a new DefaultBuildObserver
   * @param {boolean} [verbose=false] - Whether to log verbose progress
   */
  constructor(private readonly verbose: boolean = false) {}

  /**
   * @inheritdoc
   */
  onProgress(current: number, total: number, currentFile?: string): void {
    if (this.verbose && current % 10 === 0) {
      const progress = ((current / total) * 100).toFixed(1);
      log(
        `[SVGBuilder] Progress: ${progress}% (${current}/${total})${
          currentFile ? ` - ${currentFile}` : ''
        }`
      );
    }
  }

  /**
   * @inheritdoc
   */
  onError(error: Error, context?: string): void {
    errorLog(`[SVGBuilder] ${context ? `${context}: ` : ''}${error.message}`);
  }

  /**
   * @inheritdoc
   */
  onComplete(result: FontCreationResult): void {
    if (result.success) {
      log(
        `[success][SVGBuilder] Font creation completed! Processed ${result.processedCount}/${result.totalCount} files`
      );
    } else {
      errorLog(`[SVGBuilder] Font creation failed: ${result.error?.message}`);
    }
  }
}

/**
 * Abstract base class for SVG font builders
 * Uses Template Method pattern for consistent processing flow
 * @abstract
 * @class SVGBuilder
 */
export abstract class SVGBuilder {
  /** Build configuration options */
  protected readonly options: InitOptionsParams;
  /** Set of SVG file paths to process */
  protected readonly svgsPaths: ReadonlySet<string>;
  /** Strategy for unicode generation */
  protected readonly unicodeStrategy: UnicodeStrategy;
  /** Observer for build progress */
  protected readonly observer: BuildObserver;
  /** Mapping of icon names to unicode strings */
  protected svgUnicodeObj: SvgUnicodeMap = Object.freeze({});

  /**
   * Creates a new SVGBuilder
   * @param {Partial<InitOptionsParams>} options - Build options
   */
  constructor(options: Partial<InitOptionsParams>) {
    this.options = Object.freeze({ ...DEFAULT_OPTIONS, ...options });
    this.svgsPaths = filterSvgFiles(this.options.src);
    this.unicodeStrategy = new SafeUnicodeStrategy(this.options.unicodeStart);
    this.observer = new DefaultBuildObserver(this.options.debug);
  }

  /**
   * Gets the build options
   * @returns {InitOptionsParams} Build options
   */
  public get buildOptions(): InitOptionsParams {
    return this.options;
  }

  /**
   * Template method that defines the algorithm structure for font creation
   * @returns {Promise<boolean>} True if font creation was successful
   */
  public async createSvgsFont(): Promise<boolean> {
    try {
      const result = await this.executeFontCreation();
      this.observer.onComplete(result);
      return result.success;
    } catch (error) {
      const fontError = error instanceof Error ? error : new Error(String(error));
      this.observer.onError(fontError, 'Font creation');
      return false;
    }
  }

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
  public clearCache(): void {
    try {
      this.performCleanup();
      this.svgUnicodeObj = Object.freeze({});
    } catch (error) {
      const cleanupError = error instanceof Error ? error : new Error(String(error));
      this.observer.onError(cleanupError, 'Cache cleanup');
    }
  }

  /**
   * Gets the unicode mapping
   * @returns {SvgUnicodeMap} Mapping of icon names to unicode strings
   */
  public get unicodeMapping(): SvgUnicodeMap {
    return this.svgUnicodeObj;
  }
}

/**
 * Concrete implementation using modern async/await patterns
 * and defensive programming techniques
 */
export default class ConcreteSVGBuilder extends SVGBuilder {
  private static readonly TIMEOUT_MS = 30000;
  private static readonly BATCH_LOG_INTERVAL = 10;

  protected async executeFontCreation(): Promise<FontCreationResult> {
    const destinationPath = join(this.options.dist, `${this.options.fontName}.svg`);

    log(`[running][SVGBuilder] Starting font creation: ${destinationPath}`);

    // Prepare output directory with error handling
    const dirResult = mkdirpSync(this.options.dist);
    if (!isSuccessResult(dirResult)) {
      throw new Error(`Failed to create output directory (${this.options.dist}): ${dirResult}`);
    }

    return this.createFontWithStreams(destinationPath);
  }

  private async createFontWithStreams(destinationPath: string): Promise<FontCreationResult> {
    const svgPathsArray = Array.from(this.svgsPaths);
    const unicodeCache = new Set<number>();
    const tempUnicodeMap: Record<string, string> = {};

    return new Promise((resolve, reject) => {
      const fontStream = this.createFontStream();
      const writeStream = this.createWriteStream(destinationPath);

      // Error handling with cleanup
      const cleanup = this.createCleanupFunction(fontStream, writeStream);
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Font creation timeout'));
      }, ConcreteSVGBuilder.TIMEOUT_MS);

      // Success handler
      writeStream.on('finish', () => {
        clearTimeout(timeoutId);
        cleanup();

        this.svgUnicodeObj = Object.freeze(tempUnicodeMap);
        resolve({
          success: true,
          unicodeMap: this.svgUnicodeObj,
          processedCount: svgPathsArray.length,
          totalCount: svgPathsArray.length,
        });
      });

      // Error handlers
      const handleError = (error: Error) => {
        clearTimeout(timeoutId);
        cleanup();
        resolve({
          success: false,
          unicodeMap: Object.freeze({}),
          error,
          processedCount: 0,
          totalCount: svgPathsArray.length,
        });
      };

      fontStream.on('error', handleError);
      writeStream.on('error', handleError);

      // Process SVG files
      fontStream.pipe(writeStream);
      this.processSvgFiles(fontStream, svgPathsArray, unicodeCache, tempUnicodeMap);
      fontStream.end();
    });
  }

  private createFontStream(): SVGIcons2SVGFont {
    return new SVGIcons2SVGFont({
      ...this.options,
      normalize: true,
      fontHeight: 1000,
      centerHorizontally: true,
    });
  }

  private createWriteStream(path: string): fs.WriteStream {
    return fs.createWriteStream(path);
  }

  private createCleanupFunction(
    fontStream: SVGIcons2SVGFont,
    writeStream: fs.WriteStream
  ): () => void {
    return () => {
      try {
        if (fontStream && !fontStream.destroyed) {
          fontStream.removeAllListeners();
        }
        if (writeStream && !writeStream.destroyed) {
          writeStream.removeAllListeners();
          writeStream.destroy();
        }
      } catch (error) {
        // Silent cleanup - errors here are not critical
      }
    };
  }

  private processSvgFiles(
    fontStream: SVGIcons2SVGFont,
    svgPaths: readonly string[],
    unicodeCache: Set<number>,
    unicodeMap: Record<string, string>
  ): void {
    svgPaths.forEach((svgPath, index) => {
      try {
        const glyph = this.createGlyphStream(svgPath, unicodeCache, unicodeMap);
        if (glyph) {
          fontStream.write(glyph);
        }

        // Progress notification
        if (index % ConcreteSVGBuilder.BATCH_LOG_INTERVAL === 0) {
          this.observer.onProgress(index + 1, svgPaths.length, basename(svgPath));
        }
      } catch (error) {
        const glyphError = error instanceof Error ? error : new Error(String(error));
        this.observer.onError(glyphError, `Processing ${svgPath}`);
      }
    });
  }

  private createGlyphStream(
    svgPath: string,
    unicodeCache: Set<number>,
    unicodeMap: Record<string, string>
  ): SvgFontStream | null {
    const iconName = this.extractIconName(svgPath);
    if (!iconName) return null;

    const unicode = this.unicodeStrategy.generate(iconName, unicodeCache);
    unicodeCache.add(unicode);
    unicodeMap[iconName] = `&#${unicode};`;

    const glyph = fs.createReadStream(svgPath) as SvgFontStream;

    // Use direct property assignment instead of defineProperty for compatibility
    (glyph as any).metadata = {
      unicode: [String.fromCharCode(unicode)],
      name: iconName,
    };

    return glyph;
  }

  private extractIconName(svgPath: string): string | null {
    const fileName = basename(svgPath);
    const match = fileName.match(/^(.+)\.svg$/i);
    return match?.[1] || null;
  }

  protected performCleanup(): void {
    // Modern SVG builder doesn't need extensive cleanup
    // Memory management is handled by GC and proper scoping
  }
}
