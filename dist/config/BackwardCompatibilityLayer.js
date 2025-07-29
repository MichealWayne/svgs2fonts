'use strict';
/**
 * @module BackwardCompatibilityLayer
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-18 16:30:00
 * @description Backward compatibility layer for supporting legacy API usage
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.createBackwardCompatibilityLayer = exports.BackwardCompatibilityLayer = void 0;
/**
 * Backward compatibility layer
 */
class BackwardCompatibilityLayer {
  constructor() {
    this.deprecationWarnings = [];
  }
  /**
   * Convert legacy options to enhanced options
   */
  convertLegacyOptions(options) {
    if (!options || typeof options !== 'object') {
      return {};
    }
    const converted = { ...options };
    // Handle legacy debug option
    if ('debug' in options && options.debug) {
      this.deprecationWarnings.push('The "debug" option is deprecated. Use "verbose" instead.');
      converted.verbose = true;
      delete converted.debug;
    }
    return converted;
  }
  /**
   * Log deprecation warnings
   */
  logDeprecationWarnings(verbose = false) {
    if (this.deprecationWarnings.length > 0 && verbose) {
      console.warn('[svgs2fonts] Deprecation warnings:');
      this.deprecationWarnings.forEach(warning => {
        console.warn(`  - ${warning}`);
      });
    }
  }
}
exports.BackwardCompatibilityLayer = BackwardCompatibilityLayer;
/**
 * Factory function to create backward compatibility layer
 */
function createBackwardCompatibilityLayer() {
  return new BackwardCompatibilityLayer();
}
exports.createBackwardCompatibilityLayer = createBackwardCompatibilityLayer;
//# sourceMappingURL=BackwardCompatibilityLayer.js.map
