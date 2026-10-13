"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleDirectoryProcessor = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const DemoBuilder_1 = __importDefault(require("../builders/DemoBuilder"));
const FontsBuilder_1 = __importDefault(require("../builders/FontsBuilder"));
const SVGBuilder_1 = __importDefault(require("../builders/SVGBuilder"));
const presentation_1 = require("../builders/presentation");
const core_1 = require("../core");
const buildSupport_1 = require("../core/buildSupport");
const CodepointMap_1 = require("../core/CodepointMap");
const OutputTransaction_1 = require("../core/OutputTransaction");
class SingleDirectoryProcessor {
    constructor(configManager, performanceTracker) {
        this.configManager = configManager;
        this.performanceTracker = performanceTracker;
    }
    async process() {
        const report = await this.processDetailed();
        return report.status === 'success'
            ? true
            : new buildSupport_1.BuildError(report.errors[0]?.code || 'BUILD_FAILED', report.errors.map(e => e.message).join('; '));
    }
    async processDetailed(checkOnly = false) {
        const started = Date.now();
        const options = this.configManager.getOptions();
        const report = (0, buildSupport_1.emptyDirectory)(options);
        const tracker = this.performanceTracker ||
            (options.performanceAnalysis ? (0, core_1.createPerformanceTracker)() : undefined);
        let transaction;
        let svgBuilder;
        let fontBuilder;
        try {
            const inspected = (0, buildSupport_1.inspectInput)(options);
            report.warnings.push(...inspected.warnings);
            report.iconCount = inspected.files.length;
            report.sourceHashes = inspected.sourceHashes;
            const names = inspected.files.map(file => path_1.default.basename(file).replace(/\.svg$/i, ''));
            if (new Set(names).size !== names.length)
                throw new buildSupport_1.BuildError('ICON_NAME_CONFLICT', 'Input contains duplicate icon names');
            if (!checkOnly)
                transaction = new OutputTransaction_1.OutputTransaction(options.dist, options.fontName);
            const stable = (0, CodepointMap_1.prepareCodepoints)(options, names, inspected.sourceHashes);
            if (stable) {
                report.codepoints = Object.fromEntries(names.map(name => [name, stable.codepoints[name]]));
                report.changes = stable.changes;
            }
            if (checkOnly) {
                report.status = 'success';
                return report;
            }
            const stagedOptions = {
                ...options,
                dist: transaction.stage,
                codepoints: stable?.codepoints,
            };
            svgBuilder = new SVGBuilder_1.default(stagedOptions, inspected.files);
            fontBuilder = new FontsBuilder_1.default(svgBuilder);
            tracker?.startPhase('SVG Processing');
            (0, buildSupport_1.progress)(options, 'SVG Processing', 0, report.iconCount);
            if (!(await svgBuilder.createSvgsFont()))
                throw (svgBuilder.error ||
                    new buildSupport_1.BuildError('SVG_FAILED', 'SVG processing failed', options.src, 'svg'));
            (0, buildSupport_1.progress)(options, 'SVG Processing', report.iconCount, report.iconCount);
            tracker?.endPhase('SVG Processing');
            report.codepoints = Object.fromEntries(Object.entries(svgBuilder.unicodeMapping).map(([name, entity]) => [
                name,
                Number(entity.replace(/&#|;/g, '')),
            ]));
            tracker?.startPhase('Font Generation');
            const formats = options.fontFormats;
            const nonSvg = formats.filter(format => format !== 'svg');
            (0, buildSupport_1.progress)(options, 'Font Generation', 0, nonSvg.length);
            if (nonSvg.length) {
                const result = await fontBuilder.generateBatch(nonSvg);
                if (result.failed.length) {
                    for (const failure of result.failed)
                        report.errors.push({
                            code: 'FONT_CONVERSION_FAILED',
                            message: failure.error?.message || 'Font generation failed',
                            format: failure.format,
                            directory: options.src,
                            phase: 'font',
                        });
                    throw new buildSupport_1.BuildError('FONT_CONVERSION_FAILED', 'Font generation failed');
                }
            }
            (0, buildSupport_1.progress)(options, 'Font Generation', nonSvg.length, nonSvg.length);
            tracker?.endPhase('Font Generation');
            const outputs = formats.map(format => `${options.fontName}.${format}`);
            if (!formats.includes('svg'))
                fs_1.default.unlinkSync(path_1.default.join(transaction.stage, `${options.fontName}.svg`));
            if (!options.noDemo) {
                tracker?.startPhase('Demo Generation');
                (0, buildSupport_1.progress)(options, 'Demo Generation', 0, 4);
                const demoBuilder = new DemoBuilder_1.default(svgBuilder);
                if (!(await demoBuilder.html()))
                    throw new buildSupport_1.BuildError('DEMO_FAILED', demoBuilder.error?.message || 'Demo generation failed', options.dist, 'demo');
                outputs.push(options.demoUnicodeHTML, options.demoFontClassHTML, options.demoUnicodeHTML.replace(/\.html$/i, '.css'), options.demoFontClassHTML.replace(/\.html$/i, '.css'));
                (0, buildSupport_1.progress)(options, 'Demo Generation', 4, 4);
                tracker?.endPhase('Demo Generation');
            }
            if (options.outputCss) {
                const filename = `${options.fontName}.css`;
                fs_1.default.writeFileSync(path_1.default.join(transaction.stage, filename), (0, presentation_1.iconCss)(options.fontName, formats, svgBuilder.unicodeMapping));
                outputs.push(filename);
            }
            if (options.outputManifest)
                outputs.push(`${options.fontName}.json`);
            if (stable?.path)
                outputs.push(path_1.default.basename(stable.path));
            if (options.outputManifest) {
                const filename = `${options.fontName}.json`;
                fs_1.default.writeFileSync(path_1.default.join(transaction.stage, filename), JSON.stringify({
                    schemaVersion: 1,
                    fontName: options.fontName,
                    fontFormats: formats,
                    codepoints: report.codepoints,
                    sourceHashes: report.sourceHashes,
                    outputs,
                    changes: report.changes,
                }, null, 2) + '\n');
            }
            if (stable?.path) {
                const filename = path_1.default.basename(stable.path);
                fs_1.default.writeFileSync(path_1.default.join(transaction.stage, filename), JSON.stringify({ schemaVersion: 1, codepoints: stable.codepoints, sourceHashes: stable.sourceHashes }, null, 2) + '\n');
            }
            for (const file of inspected.files) {
                const name = path_1.default.basename(file).replace(/\.svg$/i, '');
                const currentHash = (0, crypto_1.createHash)('sha256').update(fs_1.default.readFileSync(file)).digest('hex');
                if (currentHash !== inspected.sourceHashes[name])
                    throw new buildSupport_1.BuildError('INPUT_CHANGED', `Input changed during conversion; rerun the build: ${file}`, file, 'commit');
            }
            report.outputs = transaction.commit(outputs);
            report.status = 'success';
        }
        catch (error) {
            if (!report.errors.length)
                report.errors.push((0, buildSupport_1.issue)(error, options.src));
        }
        finally {
            fontBuilder?.cleanup();
            svgBuilder?.clearCache();
            try {
                transaction?.cleanup();
            }
            catch (e) {
                report.warnings.push({
                    code: 'TEMP_CLEANUP_FAILED',
                    message: `Temporary files retained at ${transaction?.stage}: ${e.message}`,
                });
            }
            report.durationMs = Date.now() - started;
            if (tracker)
                report.timings = Object.fromEntries(Object.entries(tracker.phases).map(([name, phase]) => [
                    name,
                    phase.duration ?? Date.now() - phase.start,
                ]));
        }
        return report;
    }
}
exports.SingleDirectoryProcessor = SingleDirectoryProcessor;
//# sourceMappingURL=SingleDirectoryProcessor.js.map