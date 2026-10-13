"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.ConfigurationManager = exports.ConfigurationError = exports.VALID_FONT_FORMATS = exports.DEFAULT_FONT_FORMATS = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const options_1 = __importDefault(require("../builders/options"));
exports.DEFAULT_FONT_FORMATS = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
exports.VALID_FONT_FORMATS = [...exports.DEFAULT_FONT_FORMATS];
class ConfigurationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.code = 'INVALID_CONFIG';
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
class ConfigurationManager {
    constructor(rawOptions) {
        if (!rawOptions || typeof rawOptions !== 'object' || Array.isArray(rawOptions)) {
            throw new ConfigurationError('Options must be an object');
        }
        const supplied = Object.fromEntries(Object.entries(rawOptions).filter(([, value]) => value !== undefined));
        const options = {
            ...options_1.default,
            fontFormats: [...exports.DEFAULT_FONT_FORMATS],
            batchMode: false,
            batchSize: 3,
            continueOnError: true,
            verbose: false,
            ...supplied,
        };
        const fail = (message, field) => {
            throw new ConfigurationError(message, field);
        };
        for (const field of [
            'batchMode',
            'noDemo',
            'verbose',
            'debug',
            'continueOnError',
            'preserveDirectoryStructure',
            'outputCss',
            'outputManifest',
            'performanceAnalysis',
        ]) {
            if (options[field] !== undefined && typeof options[field] !== 'boolean')
                fail(`${field} must be a boolean`, field);
        }
        if (!options.dist || typeof options.dist !== 'string')
            fail('Output directory (dist) is required', 'dist');
        if (typeof options.fontName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(options.fontName))
            fail('Font name must contain only letters, numbers, hyphens and underscores', 'fontName');
        if (!Number.isInteger(options.unicodeStart) ||
            options.unicodeStart < 0 ||
            options.unicodeStart >= 59999 ||
            (options.unicodeStart >= 0xd800 && options.unicodeStart <= 0xdfff))
            fail('unicodeStart must be an integer from 0 to 59998 outside the surrogate range', 'unicodeStart');
        if (!Number.isInteger(options.batchSize) ||
            !Number.isFinite(options.batchSize) ||
            options.batchSize < 1)
            fail('Batch size must be a positive finite integer', 'batchSize');
        if (!Array.isArray(options.fontFormats) ||
            !options.fontFormats.length ||
            options.fontFormats.some(format => !exports.VALID_FONT_FORMATS.includes(format)))
            fail(`Invalid font formats. Use a non-empty array of: ${exports.VALID_FONT_FORMATS.join(', ')}`, 'fontFormats');
        options.fontFormats = [...new Set(options.fontFormats)];
        if (options.progressCallback !== undefined && typeof options.progressCallback !== 'function')
            fail('progressCallback must be a function', 'progressCallback');
        for (const field of ['fontHeight', 'round']) {
            const value = options[field];
            if (value !== undefined &&
                (typeof value !== 'number' || !Number.isFinite(value) || value <= 0))
                fail(`${field} must be a positive finite number`, field);
        }
        for (const field of ['normalize', 'centerHorizontally']) {
            if (options[field] !== undefined && typeof options[field] !== 'boolean')
                fail(`${field} must be a boolean`, field);
        }
        for (const field of ['demoUnicodeHTML', 'demoFontClassHTML']) {
            const value = options[field];
            if (typeof value !== 'string' || !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.html$/i.test(value))
                fail(`${field} must be a plain .html filename`, field);
        }
        if (options.outputPattern !== undefined &&
            (typeof options.outputPattern !== 'string' ||
                !options.outputPattern ||
                path_1.default.isAbsolute(options.outputPattern) ||
                /(^|[\\/])\.\.?([\\/]|$)/.test(options.outputPattern) ||
                /\[[^\]]+\]/.test(options.outputPattern.replace(/\[(name|fontname)\]/g, ''))))
            fail('outputPattern must be a relative path using only [name] and [fontname] placeholders', 'outputPattern');
        if (options.codepointMap !== undefined &&
            (typeof options.codepointMap !== 'string' ||
                !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.json$/i.test(options.codepointMap)))
            fail('codepointMap must be a plain .json filename relative to the output directory', 'codepointMap');
        if (options.codepoints !== undefined &&
            (!options.codepoints ||
                typeof options.codepoints !== 'object' ||
                Array.isArray(options.codepoints)))
            fail('codepoints must be a name-to-codepoint object', 'codepoints');
        const outputs = [...options.fontFormats.map(format => `${options.fontName}.${format}`)];
        if (!options.noDemo) {
            outputs.push(options.demoUnicodeHTML, options.demoFontClassHTML, options.demoUnicodeHTML.replace(/\.html$/i, '.css'), options.demoFontClassHTML.replace(/\.html$/i, '.css'));
        }
        if (options.outputCss)
            outputs.push(`${options.fontName}.css`);
        if (options.outputManifest)
            outputs.push(`${options.fontName}.json`);
        if (options.codepointMap)
            outputs.push(options.codepointMap);
        if (new Set(outputs.map(name => name.toLowerCase())).size !== outputs.length)
            fail('Requested output filenames collide', 'dist');
        options.dist = path_1.default.resolve(options.dist);
        if (fs_1.default.existsSync(options.dist) && !fs_1.default.statSync(options.dist).isDirectory())
            fail(`Output is not a directory: ${options.dist}`, 'dist');
        if (options.src) {
            if (typeof options.src !== 'string')
                fail('src must be a directory path', 'src');
            options.src = path_1.default.resolve(options.src);
        }
        if (!options.batchMode) {
            if (!options.src)
                fail('Source directory (src) is required', 'src');
            if (!fs_1.default.existsSync(options.src))
                fail(`Source directory does not exist: ${options.src}`, 'src');
            if (!fs_1.default.statSync(options.src).isDirectory())
                fail(`Source is not a directory: ${options.src}`, 'src');
        }
        else {
            if (!Array.isArray(options.inputDirectories) ||
                !options.inputDirectories.length ||
                options.inputDirectories.some(dir => typeof dir !== 'string' || !dir))
                fail('Batch mode requires inputDirectories to be a non-empty array of paths', 'inputDirectories');
            options.inputDirectories = options.inputDirectories.map(dir => path_1.default.resolve(dir));
            // Missing batch inputs are diagnosed per item so continueOnError can work.
        }
        this.options = options;
    }
    getOptions() {
        return {
            ...this.options,
            fontFormats: [...this.options.fontFormats],
            inputDirectories: this.options.inputDirectories && [...this.options.inputDirectories],
            codepoints: this.options.codepoints && { ...this.options.codepoints },
        };
    }
    getSummary() {
        const o = this.options;
        return `Source: ${o.src}\nOutput: ${o.dist}\nFont Name: ${o.fontName}\nFormats: ${o.fontFormats.join(', ')}\nBatch Mode: ${o.batchMode}`;
    }
}
exports.ConfigurationManager = ConfigurationManager;
function createConfiguration(options) {
    return new ConfigurationManager(options);
}
exports.createConfiguration = createConfiguration;
//# sourceMappingURL=ConfigurationManager.js.map