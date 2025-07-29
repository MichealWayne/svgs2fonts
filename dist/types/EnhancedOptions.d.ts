/**
 * @module EnhancedOptions
 * @description Enhanced configuration options
 */
import { InitOptionsParams } from './OptionType';
import { FontFormat } from './FontTypes';
import { ProgressCallback } from './core/ProcessingTypes';
export interface EnhancedOptions extends InitOptionsParams {
  fontFormats?: FontFormat[];
  batchMode?: boolean;
  inputDirectories?: string[];
  batchSize?: number;
  continueOnError?: boolean;
  verbose?: boolean;
  progressCallback?: ProgressCallback;
  performanceAnalysis?: boolean;
}
//# sourceMappingURL=EnhancedOptions.d.ts.map
