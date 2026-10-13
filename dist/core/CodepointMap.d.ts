import { ValidatedOptions } from '../config/ConfigurationManager';
import { CodepointChanges } from '../types/BuildReport';
export interface StableCodepoints {
    path?: string;
    codepoints: Record<string, number>;
    changes: CodepointChanges;
    sourceHashes?: Record<string, string>;
}
export declare function prepareCodepoints(options: ValidatedOptions, names: string[], sourceHashes?: Record<string, string>): StableCodepoints | undefined;
//# sourceMappingURL=CodepointMap.d.ts.map