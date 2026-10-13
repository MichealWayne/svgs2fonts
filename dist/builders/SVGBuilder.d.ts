import { EnhancedOptions, InitOptionsParams } from '../types/OptionType';
export interface SvgUnicodeMap {
    readonly [iconName: string]: string;
}
export declare type SvgUnicodeObjParams = SvgUnicodeMap;
export declare abstract class SVGBuilder {
    protected readonly options: InitOptionsParams & EnhancedOptions;
    protected readonly svgsPaths: ReadonlySet<string>;
    protected svgUnicodeObj: SvgUnicodeMap;
    protected lastError?: Error;
    constructor(options: Partial<EnhancedOptions>, files?: string[]);
    get buildOptions(): InitOptionsParams & EnhancedOptions;
    get unicodeMapping(): SvgUnicodeMap;
    get error(): Error | undefined;
    createSvgsFont(): Promise<boolean>;
    protected abstract executeFontCreation(): Promise<void>;
    clearCache(): void;
}
export default class ConcreteSVGBuilder extends SVGBuilder {
    protected executeFontCreation(): Promise<void>;
}
//# sourceMappingURL=SVGBuilder.d.ts.map