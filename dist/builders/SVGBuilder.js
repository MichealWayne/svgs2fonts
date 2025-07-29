'use strict';
/**
 * @module SVGBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2025-01-22
 * @description Advanced SVG to font conversion with elegant architecture
 * @summary Converts individual SVG icons into a single SVG font file
 * @since 2.0.0
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SVGBuilder = void 0;
const fs_1 = __importDefault(require('fs'));
const path_1 = require('path');
const svgicons2svgfont_1 = __importDefault(require('svgicons2svgfont'));
const options_1 = __importDefault(require('./options'));
const fsUtils_1 = require('../utils/fsUtils');
const utils_1 = require('../utils/utils');
/**
 * Safe unicode generation strategy that avoids collisions
 * @class SafeUnicodeStrategy
 * @implements {UnicodeStrategy}
 */
class SafeUnicodeStrategy {
  /**
   * Creates a new SafeUnicodeStrategy
   * @param {number} startUnicode - Starting unicode code point
   */
  constructor(startUnicode) {
    this.startUnicode = startUnicode;
  }
  /**
   * @inheritdoc
   */
  generate(iconName, existingCodes) {
    let unicode = (0, utils_1.getIconStrUnicode)(iconName, this.startUnicode);
    while (existingCodes.has(unicode) && unicode < 59999) {
      unicode++;
    }
    return unicode;
  }
}
/**
 * Default implementation of build observer
 * @class DefaultBuildObserver
 * @implements {BuildObserver}
 */
class DefaultBuildObserver {
  /**
   * Creates a new DefaultBuildObserver
   * @param {boolean} [verbose=false] - Whether to log verbose progress
   */
  constructor(verbose = false) {
    this.verbose = verbose;
  }
  /**
   * @inheritdoc
   */
  onProgress(current, total, currentFile) {
    if (this.verbose && current % 10 === 0) {
      const progress = ((current / total) * 100).toFixed(1);
      (0, utils_1.log)(
        `[SVGBuilder] Progress: ${progress}% (${current}/${total})${currentFile ? ` - ${currentFile}` : ''}`
      );
    }
  }
  /**
   * @inheritdoc
   */
  onError(error, context) {
    (0, utils_1.errorLog)(`[SVGBuilder] ${context ? `${context}: ` : ''}${error.message}`);
  }
  /**
   * @inheritdoc
   */
  onComplete(result) {
    if (result.success) {
      (0, utils_1.log)(
        `[success][SVGBuilder] Font creation completed! Processed ${result.processedCount}/${result.totalCount} files`
      );
    } else {
      (0, utils_1.errorLog)(`[SVGBuilder] Font creation failed: ${result.error?.message}`);
    }
  }
}
/**
 * Abstract base class for SVG font builders
 * Uses Template Method pattern for consistent processing flow
 * @abstract
 * @class SVGBuilder
 */
class SVGBuilder {
  /**
   * Creates a new SVGBuilder
   * @param {Partial<InitOptionsParams>} options - Build options
   */
  constructor(options) {
    /** Mapping of icon names to unicode strings */
    this.svgUnicodeObj = Object.freeze({});
    this.options = Object.freeze({ ...options_1.default, ...options });
    this.svgsPaths = (0, fsUtils_1.filterSvgFiles)(this.options.src);
    this.unicodeStrategy = new SafeUnicodeStrategy(this.options.unicodeStart);
    this.observer = new DefaultBuildObserver(this.options.debug);
  }
  /**
   * Gets the build options
   * @returns {InitOptionsParams} Build options
   */
  get buildOptions() {
    return this.options;
  }
  /**
   * Template method that defines the algorithm structure for font creation
   * @returns {Promise<boolean>} True if font creation was successful
   */
  async createSvgsFont() {
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
   * Clears the unicode mapping cache
   */
  clearCache() {
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
  get unicodeMapping() {
    return this.svgUnicodeObj;
  }
}
exports.SVGBuilder = SVGBuilder;
/**
 * Concrete implementation using modern async/await patterns
 * and defensive programming techniques
 */
class ConcreteSVGBuilder extends SVGBuilder {
  async executeFontCreation() {
    const destinationPath = (0, path_1.join)(this.options.dist, `${this.options.fontName}.svg`);
    (0, utils_1.log)(`[running][SVGBuilder] Starting font creation: ${destinationPath}`);
    // Prepare output directory with error handling
    const dirResult = (0, fsUtils_1.mkdirpSync)(this.options.dist);
    if (!(0, utils_1.isSuccessResult)(dirResult)) {
      throw new Error(`Failed to create output directory (${this.options.dist}): ${dirResult}`);
    }
    return this.createFontWithStreams(destinationPath);
  }
  async createFontWithStreams(destinationPath) {
    const svgPathsArray = Array.from(this.svgsPaths);
    const unicodeCache = new Set();
    const tempUnicodeMap = {};
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
      const handleError = error => {
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
  createFontStream() {
    return new svgicons2svgfont_1.default({
      ...this.options,
      normalize: true,
      fontHeight: 1000,
      centerHorizontally: true,
    });
  }
  createWriteStream(path) {
    return fs_1.default.createWriteStream(path);
  }
  createCleanupFunction(fontStream, writeStream) {
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
  processSvgFiles(fontStream, svgPaths, unicodeCache, unicodeMap) {
    svgPaths.forEach((svgPath, index) => {
      try {
        const glyph = this.createGlyphStream(svgPath, unicodeCache, unicodeMap);
        if (glyph) {
          fontStream.write(glyph);
        }
        // Progress notification
        if (index % ConcreteSVGBuilder.BATCH_LOG_INTERVAL === 0) {
          this.observer.onProgress(index + 1, svgPaths.length, (0, path_1.basename)(svgPath));
        }
      } catch (error) {
        const glyphError = error instanceof Error ? error : new Error(String(error));
        this.observer.onError(glyphError, `Processing ${svgPath}`);
      }
    });
  }
  createGlyphStream(svgPath, unicodeCache, unicodeMap) {
    const iconName = this.extractIconName(svgPath);
    if (!iconName) return null;
    const unicode = this.unicodeStrategy.generate(iconName, unicodeCache);
    unicodeCache.add(unicode);
    unicodeMap[iconName] = `&#${unicode};`;
    const glyph = fs_1.default.createReadStream(svgPath);
    // Use direct property assignment instead of defineProperty for compatibility
    glyph.metadata = {
      unicode: [String.fromCharCode(unicode)],
      name: iconName,
    };
    return glyph;
  }
  extractIconName(svgPath) {
    const fileName = (0, path_1.basename)(svgPath);
    const match = fileName.match(/^(.+)\.svg$/i);
    return match?.[1] || null;
  }
  performCleanup() {
    // Modern SVG builder doesn't need extensive cleanup
    // Memory management is handled by GC and proper scoping
  }
}
exports.default = ConcreteSVGBuilder;
ConcreteSVGBuilder.TIMEOUT_MS = 30000;
ConcreteSVGBuilder.BATCH_LOG_INTERVAL = 10;
//# sourceMappingURL=SVGBuilder.js.map
