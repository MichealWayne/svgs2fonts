import { EnhancedOptions, FontFormat, InitOptionsParams } from '../types/OptionType';
export declare type ValidatedOptions = EnhancedOptions & InitOptionsParams;
export declare const DEFAULT_FONT_FORMATS: FontFormat[];
export declare const VALID_FONT_FORMATS: FontFormat[];
export declare class ConfigurationError extends Error {
    field?: string | undefined;
    readonly code = "INVALID_CONFIG";
    constructor(message: string, field?: string | undefined);
}
export declare class ConfigurationManager {
    private options;
    constructor(rawOptions: Partial<EnhancedOptions>);
    getOptions(): ValidatedOptions;
    getSummary(): string;
}
export declare function createConfiguration(options: Partial<EnhancedOptions>): ConfigurationManager;
//# sourceMappingURL=ConfigurationManager.d.ts.map