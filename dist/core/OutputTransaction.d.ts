/** Stage on the output filesystem; roll back only files owned by this build. */
export declare class OutputTransaction {
    private output;
    readonly stage: string;
    private backup;
    private preserveRecovery;
    private lock;
    constructor(output: string, fontName: string);
    commit(relativeFiles: string[]): string[];
    cleanup(): void;
}
//# sourceMappingURL=OutputTransaction.d.ts.map