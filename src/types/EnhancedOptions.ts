/**
 * @module EnhancedOptions
 * @description Enhanced configuration options
 */

import { InitOptionsParams } from './OptionType';
import { FontFormat } from './FontTypes';
import { ProgressCallback } from './core/ProcessingTypes';

export interface EnhancedOptions extends InitOptionsParams {
  // Font options
  fontFormats?: FontFormat[];

  // Batch processing
  batchMode?: boolean;
  inputDirectories?: string[];
  batchSize?: number;
  continueOnError?: boolean;

  // Monitoring
  verbose?: boolean;
  progressCallback?: ProgressCallback;
  performanceAnalysis?: boolean;
}
