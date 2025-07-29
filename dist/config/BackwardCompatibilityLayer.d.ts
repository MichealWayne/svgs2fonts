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
export declare class BackwardCompatibilityLayer {
  private deprecationWarnings;
  /**
   * Convert legacy options to enhanced options
   */
  convertLegacyOptions(
    options: Partial<InitOptionsParams> | Partial<EnhancedOptions>
  ): Partial<EnhancedOptions>;
  /**
   * Log deprecation warnings
   */
  logDeprecationWarnings(verbose?: boolean): void;
}
/**
 * Factory function to create backward compatibility layer
 */
export declare function createBackwardCompatibilityLayer(): BackwardCompatibilityLayer;
//# sourceMappingURL=BackwardCompatibilityLayer.d.ts.map
