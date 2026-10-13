"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.check = exports.generate = exports.createBackwardCompatibilityLayer = exports.createConfiguration = exports.migrateCodepoints = void 0;
const config_1 = require("./config");
const core_1 = require("./core");
const processors_1 = require("./processors");
const buildSupport_1 = require("./core/buildSupport");
const CodepointMigration_1 = require("./core/CodepointMigration");
Object.defineProperty(exports, "migrateCodepoints", { enumerable: true, get: function () { return CodepointMigration_1.migrateCodepoints; } });
var config_2 = require("./config");
Object.defineProperty(exports, "createConfiguration", { enumerable: true, get: function () { return config_2.createConfiguration; } });
Object.defineProperty(exports, "createBackwardCompatibilityLayer", { enumerable: true, get: function () { return config_2.createBackwardCompatibilityLayer; } });
/** Detailed, serializable results; expected input/build failures are returned in the report. */
async function generate(options, execution = {}) {
    const start = Date.now();
    const report = {
        schemaVersion: 1,
        status: 'failed',
        success: false,
        mode: execution.checkOnly ? 'check' : 'generate',
        directories: [],
        outputs: [],
        errors: [],
        warnings: [],
        durationMs: 0,
    };
    try {
        if (!options || typeof options !== 'object' || Array.isArray(options))
            throw new buildSupport_1.BuildError('INVALID_CONFIG', 'Options must be an object');
        const compat = (0, config_1.createBackwardCompatibilityLayer)();
        const config = (0, config_1.createConfiguration)(compat.convertLegacyOptions(options));
        const validated = config.getOptions();
        report.warnings.push(...(0, buildSupport_1.experimentalWarnings)(validated));
        if (options && options.debug)
            report.warnings.push({
                code: 'DEPRECATED_OPTION',
                message: 'debug is deprecated; use verbose.',
            });
        if (validated.verbose)
            console.error(`[svgs2fonts] Configuration:\n${config.getSummary()}`);
        report.directories = validated.batchMode
            ? await new processors_1.BatchModeProcessor(config).processDetailed(Boolean(execution.checkOnly))
            : [
                await new processors_1.SingleDirectoryProcessor(config, validated.performanceAnalysis ? (0, core_1.createPerformanceTracker)() : undefined).processDetailed(Boolean(execution.checkOnly)),
            ];
        report.outputs = report.directories.flatMap(result => result.outputs);
        report.errors = report.directories.flatMap(result => result.errors);
        report.warnings.push(...report.directories.flatMap(result => result.warnings));
        const successes = report.directories.filter(result => result.status === 'success').length;
        report.status =
            successes === report.directories.length ? 'success' : successes ? 'partial' : 'failed';
        report.success = report.status === 'success';
    }
    catch (error) {
        report.errors.push((0, buildSupport_1.issue)(error));
    }
    report.durationMs = Date.now() - start;
    return report;
}
exports.generate = generate;
/** Read-only structural diagnostics. This does not guarantee visual fidelity or successful font conversion. */
async function check(options) {
    return generate(options, { checkOnly: true });
}
exports.check = check;
/** Legacy contract: partial batch success can resolve true when continueOnError is enabled. */
async function init(options) {
    const report = await generate(options);
    report.warnings.forEach(warning => console.warn(`[svgs2fonts] ${warning.code}: ${warning.message}`));
    if (options?.performanceAnalysis) {
        console.error(`[svgs2fonts] Total time: ${report.durationMs}ms`);
        report.directories.forEach(result => {
            console.error(`  ${result.source}: ${result.durationMs}ms (${result.status})`);
            Object.entries(result.timings || {}).forEach(([phase, ms]) => console.error(`    ${phase}: ${ms}ms`));
        });
    }
    if (report.success)
        return true;
    if (report.status === 'partial' &&
        options?.batchMode &&
        options.continueOnError !== false) {
        console.warn('[svgs2fonts] Partial batch success:', report.errors.map(e => e.message).join('; '));
        return true;
    }
    const error = new buildSupport_1.BuildError(report.errors[0]?.code || 'BUILD_FAILED', report.errors.map(e => e.message).join('; ') || 'Build failed', report.errors[0]?.file, report.errors[0]?.phase);
    console.error('[svgs2fonts]', error.message);
    return error;
}
exports.init = init;
exports.default = {
    init,
    generate,
    check,
    migrateCodepoints: CodepointMigration_1.migrateCodepoints,
    createConfiguration: config_1.createConfiguration,
    createBackwardCompatibilityLayer: config_1.createBackwardCompatibilityLayer,
};
//# sourceMappingURL=index.js.map