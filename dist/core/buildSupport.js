"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalPath = exports.progress = exports.experimentalWarnings = exports.inspectInput = exports.emptyDirectory = exports.issue = exports.BuildError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
class BuildError extends Error {
    constructor(code, message, file, phase) {
        super(message);
        this.code = code;
        this.file = file;
        this.phase = phase;
        this.name = 'BuildError';
    }
}
exports.BuildError = BuildError;
function issue(error, directory) {
    const e = error instanceof Error ? error : new Error(String(error));
    return {
        code: e.code || 'BUILD_FAILED',
        message: e.message,
        file: e.file,
        phase: e.phase,
        directory,
    };
}
exports.issue = issue;
function emptyDirectory(options) {
    return {
        source: options.src,
        output: options.dist,
        status: 'failed',
        outputs: [],
        iconCount: 0,
        codepoints: {},
        errors: [],
        warnings: [],
        durationMs: 0,
    };
}
exports.emptyDirectory = emptyDirectory;
function inspectInput(options) {
    const warnings = [];
    const files = [];
    const sourceHashes = Object.create(null);
    const outputNames = options.fontFormats.map(format => `${options.fontName}.${format}`);
    if (!options.noDemo)
        outputNames.push(options.demoUnicodeHTML, options.demoFontClassHTML, options.demoUnicodeHTML.replace(/\.html$/i, '.css'), options.demoFontClassHTML.replace(/\.html$/i, '.css'));
    if (options.outputCss)
        outputNames.push(`${options.fontName}.css`);
    if (options.outputManifest)
        outputNames.push(`${options.fontName}.json`);
    if (options.codepointMap)
        outputNames.push(options.codepointMap);
    for (const name of outputNames) {
        const output = path_1.default.join(options.dist, name);
        try {
            const stat = fs_1.default.lstatSync(output);
            if (!stat.isFile() || stat.isSymbolicLink())
                throw new BuildError('OUTPUT_COLLISION', `Output is not a regular file: ${output}`, output, 'check');
        }
        catch (e) {
            if (e.code !== 'ENOENT')
                throw e;
        }
    }
    for (const name of fs_1.default.readdirSync(options.src)) {
        if (path_1.default.extname(name).toLowerCase() !== '.svg')
            continue;
        const iconName = name.replace(/\.svg$/i, '');
        if (/\s|[\x00-\x1f\x7f]/.test(iconName))
            throw new BuildError('INVALID_ICON_NAME', `Icon names must not contain whitespace or control characters: ${name}`, path_1.default.join(options.src, name), 'check');
        const file = path_1.default.join(options.src, name);
        if (!fs_1.default.statSync(file).isFile())
            continue;
        const bytes = fs_1.default.readFileSync(file);
        const content = bytes.toString('utf8');
        // The CLI historically outputs into src. Exclude only a recognizable generated font.
        if (path_1.default.resolve(options.src) === path_1.default.resolve(options.dist) &&
            name.toLowerCase() === `${options.fontName}.svg`.toLowerCase() &&
            /<font\b/i.test(content)) {
            warnings.push({
                code: 'GENERATED_INPUT_SKIPPED',
                file,
                message: 'Previous generated SVG font excluded from input.',
            });
            continue;
        }
        if (!/<svg(?:\s|>)/i.test(content) || !/<\/svg\s*>/i.test(content)) {
            throw new BuildError('INVALID_SVG', `Not a complete SVG document: ${file}`, file, 'check');
        }
        if (/<(?:script|image|foreignObject)\b|<!DOCTYPE|<!ENTITY/i.test(content)) {
            throw new BuildError('UNSUPPORTED_SVG', `SVG contains unsupported embedded content or declarations: ${file}`, file, 'check');
        }
        if (/<(?:linearGradient|radialGradient|filter|mask|clipPath)\b|\bstroke\s*=/i.test(content)) {
            warnings.push({
                code: 'SVG_REVIEW_REQUIRED',
                file,
                message: 'Review gradients, filters, masks, clipping or strokes after font conversion.',
            });
        }
        if (options.fontFormats.includes('svg') &&
            canonicalPath(file) === canonicalPath(path_1.default.join(options.dist, `${options.fontName}.svg`))) {
            throw new BuildError('OUTPUT_COLLISION', `Output would overwrite source icon: ${file}`, file, 'check');
        }
        files.push(file);
        sourceHashes[iconName] = (0, crypto_1.createHash)('sha256').update(bytes).digest('hex');
    }
    if (!files.length)
        throw new BuildError('NO_SVG_FILES', `No SVG icons found in ${options.src}`, options.src, 'check');
    return { files, warnings, sourceHashes };
}
exports.inspectInput = inspectInput;
function experimentalWarnings(options) {
    const keys = [
        'maxConcurrency',
        'enableCache',
        'cacheDir',
        'streamProcessing',
        'streamProcessingThreshold',
        'streamChunkSize',
        'memoryLimit',
        'maxMemoryCacheSize',
        'cacheMaxAge',
        'compressCache',
        'compressionThreshold',
        'compressFiles',
        'maxBatchSize',
        'optimization',
        'subsetting',
        'fontMetrics',
        'outputNamingConvention',
    ];
    return keys
        .filter(key => options[key] !== undefined && options[key] !== false)
        .map(key => ({
        code: 'EXPERIMENTAL_OPTION_IGNORED',
        message: `${key} is accepted for compatibility but has no implemented execution effect.`,
    }));
}
exports.experimentalWarnings = experimentalWarnings;
function progress(options, phase, completed, total, current) {
    // A consumer's observer must not turn a committed build into a reported failure.
    if (options.progressCallback) {
        try {
            options.progressCallback({ phase: phase, completed, total, current });
        }
        catch (e) {
            console.warn('[svgs2fonts] Progress callback failed:', e instanceof Error ? e.message : String(e));
        }
    }
}
exports.progress = progress;
/** Canonicalize existing ancestors without creating paths (also used in read-only checks). */
function canonicalPath(value) {
    let current = path_1.default.resolve(value);
    const suffix = [];
    while (!fs_1.default.existsSync(current)) {
        suffix.unshift(path_1.default.basename(current));
        const parent = path_1.default.dirname(current);
        if (parent === current)
            break;
        current = parent;
    }
    return path_1.default.join(fs_1.default.realpathSync(current), ...suffix);
}
exports.canonicalPath = canonicalPath;
//# sourceMappingURL=buildSupport.js.map