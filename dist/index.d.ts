import { createBackwardCompatibilityLayer, createConfiguration } from './config';
import { BuildReport } from './types/BuildReport';
import { EnhancedOptions, InitOptionsParams } from './types/OptionType';
import { migrateCodepoints } from './core/CodepointMigration';
export { migrateCodepoints };
export type { MigrationOptions, MigrationReport } from './types/MigrationReport';
export type { BuildReport, BuildIssue, DirectoryReport, CodepointChanges, } from './types/BuildReport';
export type { EnhancedOptions, InitOptionsParams, FontFormat, ProgressInfo, } from './types/OptionType';
export { createConfiguration, createBackwardCompatibilityLayer } from './config';
/** Detailed, serializable results; expected input/build failures are returned in the report. */
export declare function generate(options: Partial<EnhancedOptions>, execution?: {
    checkOnly?: boolean;
}): Promise<BuildReport>;
/** Read-only structural diagnostics. This does not guarantee visual fidelity or successful font conversion. */
export declare function check(options: Partial<EnhancedOptions>): Promise<BuildReport>;
/** Legacy contract: partial batch success can resolve true when continueOnError is enabled. */
export declare function init(options: Partial<InitOptionsParams> | Partial<EnhancedOptions>): Promise<true | Error>;
declare const _default: {
    readonly init: typeof init;
    readonly generate: typeof generate;
    readonly check: typeof check;
    readonly migrateCodepoints: typeof migrateCodepoints;
    readonly createConfiguration: typeof createConfiguration;
    readonly createBackwardCompatibilityLayer: typeof createBackwardCompatibilityLayer;
};
export default _default;
//# sourceMappingURL=index.d.ts.map