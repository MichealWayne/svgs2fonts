import { ValidatedOptions } from '../config/ConfigurationManager';
import { BuildIssue, DirectoryReport } from '../types/BuildReport';
export declare class BuildError extends Error {
    code: string;
    file?: string | undefined;
    phase?: string | undefined;
    constructor(code: string, message: string, file?: string | undefined, phase?: string | undefined);
}
export declare function issue(error: unknown, directory?: string): BuildIssue;
export declare function emptyDirectory(options: ValidatedOptions): DirectoryReport;
export declare function inspectInput(options: ValidatedOptions): {
    files: string[];
    warnings: BuildIssue[];
    sourceHashes: Record<string, string>;
};
export declare function experimentalWarnings(options: ValidatedOptions): BuildIssue[];
export declare function progress(options: ValidatedOptions, phase: string, completed: number, total: number, current?: string): void;
/** Canonicalize existing ancestors without creating paths (also used in read-only checks). */
export declare function canonicalPath(value: string): string;
//# sourceMappingURL=buildSupport.d.ts.map