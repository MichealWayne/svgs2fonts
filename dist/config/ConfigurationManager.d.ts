/**
 * @fileoverview Configuration Management System
 * @description Configuration manager for font generation
 *
 * @module config/ConfigurationManager
 * @author Wayne <michealwayne@163.com>
 * @since 1.0.0
 * @version 2.1.0
 */
import { EnhancedOptions } from '../types/OptionType';
/**
 * Configuration validation errors
 */
export declare class ConfigurationError extends Error {
  field?: string | undefined;
  constructor(message: string, field?: string | undefined);
}
/**
 * Advanced configuration manager with validation and defaults
 */
export declare class ConfigurationManager {
  private options;
  /**
   * Create new configuration manager
   *
   * @param rawOptions - Raw configuration options
   */
  constructor(rawOptions: Partial<EnhancedOptions>);
  /**
   * Get validated and processed options
   */
  getOptions(): EnhancedOptions;
  /**
   * Get configuration summary for debugging
   */
  getSummary(): string;
  /**
   * Create validated options by merging defaults with user input
   */
  private createValidatedOptions;
  /**
   * Validate required configuration fields
   */
  private validateRequiredFields;
  /**
   * Normalize file paths
   */
  private normalizePaths;
  /**
   * Validate specific configuration options
   */
  private validateOptions;
}
/**
 * Factory function to create configuration manager
 */
export declare function createConfiguration(
  options: Partial<EnhancedOptions>
): ConfigurationManager;
//# sourceMappingURL=ConfigurationManager.d.ts.map
