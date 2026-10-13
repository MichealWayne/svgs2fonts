import { ConfigurationManager } from '../config';
import { PerformanceTracker } from '../core';
import { DirectoryReport } from '../types/BuildReport';
export declare class SingleDirectoryProcessor {
    private configManager;
    private performanceTracker?;
    constructor(configManager: ConfigurationManager, performanceTracker?: PerformanceTracker | undefined);
    process(): Promise<true | Error>;
    processDetailed(checkOnly?: boolean): Promise<DirectoryReport>;
}
//# sourceMappingURL=SingleDirectoryProcessor.d.ts.map