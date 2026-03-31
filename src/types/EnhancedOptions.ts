/**
 * Compatibility re-export for the canonical EnhancedOptions type.
 *
 * Keep OptionType as the single authority for public option types so the
 * runtime contract, tests, and docs do not drift independently.
 */

export type {
  EnhancedOptions,
  FontMetrics,
  OptimizationOptions,
  SubsettingOptions,
} from './OptionType';
