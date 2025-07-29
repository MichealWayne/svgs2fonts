/**
 * @module BackwardCompatibilityLayer
 * @author Wayne<michealwayne@163.com>
 * @Date 2025-07-18 16:30:00
 * @description Backward compatibility layer for supporting legacy API usage
 */

import { EnhancedOptions, InitOptionsParams } from '../types/OptionType';

/**
 * Backward compatibility layer
 */
export class BackwardCompatibilityLayer {
  private deprecationWarnings: string[] = [];

  /**
   * Convert legacy options to enhanced options
   */
  convertLegacyOptions(
    options: Partial<InitOptionsParams> | Partial<EnhancedOptions>
  ): Partial<EnhancedOptions> {
    if (!options || typeof options !== 'object') {
      return {};
    }

    const converted = { ...options } as Partial<EnhancedOptions>;

    // Handle legacy debug option
    if ('debug' in options && options.debug) {
      this.deprecationWarnings.push('The "debug" option is deprecated. Use "verbose" instead.');
      converted.verbose = true;
      delete (converted as any).debug;
    }

    return converted;
  }

  /**
   * Log deprecation warnings
   */
  logDeprecationWarnings(verbose = false): void {
    if (this.deprecationWarnings.length > 0 && verbose) {
      console.warn('[svgs2fonts] Deprecation warnings:');
      this.deprecationWarnings.forEach(warning => {
        console.warn(`  - ${warning}`);
      });
    }
  }
}

/**
 * Factory function to create backward compatibility layer
 */
export function createBackwardCompatibilityLayer(): BackwardCompatibilityLayer {
  return new BackwardCompatibilityLayer();
}
