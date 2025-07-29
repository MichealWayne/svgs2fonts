/**
 * @module ProcessingTypes
 * @description Processing and monitoring related types
 * @deprecated - These types are now defined in OptionType.d.ts for better organization
 */

// Re-export types from OptionType for backward compatibility
export type {
  BuildResult,
  FontGenerationResult,
  ProcessingStats,
  BuildPhase,
  ProgressInfo,
  ProgressCallback,
} from '../OptionType';
