"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGBuilder = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const stream_1 = require("stream");
const svgicons2svgfont_1 = __importDefault(require("svgicons2svgfont"));
const options_1 = __importDefault(require("./options"));
const fsUtils_1 = require("../utils/fsUtils");
const utils_1 = require("../utils/utils");
const buildSupport_1 = require("../core/buildSupport");
class SVGBuilder {
    constructor(options, files) {
        this.svgUnicodeObj = Object.freeze({});
        this.options = Object.freeze({ ...options_1.default, ...options });
        this.svgsPaths = files ? new Set(files) : (0, fsUtils_1.filterSvgFiles)(this.options.src);
    }
    get buildOptions() {
        return this.options;
    }
    get unicodeMapping() {
        return this.svgUnicodeObj;
    }
    get error() {
        return this.lastError;
    }
    async createSvgsFont() {
        this.lastError = undefined;
        try {
            await this.executeFontCreation();
            return true;
        }
        catch (e) {
            this.lastError = e instanceof Error ? e : new Error(String(e));
            return false;
        }
    }
    clearCache() {
        this.svgUnicodeObj = Object.freeze({});
    }
}
exports.SVGBuilder = SVGBuilder;
class ConcreteSVGBuilder extends SVGBuilder {
    async executeFontCreation() {
        const files = [...this.svgsPaths];
        if (!files.length)
            throw new buildSupport_1.BuildError('NO_SVG_FILES', `No SVG icons found in ${this.options.src}`, this.options.src, 'svg');
        fs_1.default.mkdirSync(this.options.dist, { recursive: true });
        const destination = (0, path_1.join)(this.options.dist, `${this.options.fontName}.svg`);
        const generateUnicode = (0, utils_1.createUnicodeGenerator)(this.options.unicodeStart);
        const unicodeMap = Object.create(null);
        const used = new Set();
        const font = new svgicons2svgfont_1.default({
            ...this.options,
            normalize: this.options.normalize ?? true,
            fontHeight: this.options.fontHeight ?? 1000,
            centerHorizontally: this.options.centerHorizontally ?? true,
            log: this.options.verbose
                ? (message) => console.error(`[svgs2fonts] ${message}`)
                : () => { },
        });
        const output = fs_1.default.createWriteStream(destination);
        const glyphs = [];
        let timer;
        let currentFile = this.options.src;
        try {
            await new Promise((resolve, reject) => {
                let settled = false;
                const fail = (e) => {
                    if (settled)
                        return;
                    settled = true;
                    reject(e instanceof buildSupport_1.BuildError
                        ? e
                        : new buildSupport_1.BuildError('INVALID_SVG', `${currentFile}: ${e.message}`, currentFile, 'svg'));
                    font.destroy();
                    output.destroy();
                    glyphs.forEach(glyph => glyph.destroy());
                };
                timer = setTimeout(() => fail(new buildSupport_1.BuildError('SVG_TIMEOUT', 'SVG font creation exceeded 30 seconds', this.options.src, 'svg')), 30000);
                font.on('error', fail);
                output.on('error', fail);
                output.on('finish', () => {
                    if (!settled) {
                        settled = true;
                        resolve();
                    }
                });
                font.pipe(output);
                const feed = async () => {
                    for (const file of files) {
                        currentFile = file;
                        if (settled)
                            return;
                        const name = (0, path_1.basename)(file).replace(/\.svg$/i, '');
                        const code = this.options.codepoints &&
                            Object.prototype.hasOwnProperty.call(this.options.codepoints, name)
                            ? this.options.codepoints[name]
                            : generateUnicode(name);
                        if (!Number.isInteger(code) ||
                            code < 0 ||
                            code > 65535 ||
                            (code >= 0xd800 && code <= 0xdfff) ||
                            used.has(code)) {
                            throw new buildSupport_1.BuildError('CODEPOINT_CONFLICT', `Invalid or duplicate codepoint for ${name}`, file, 'svg');
                        }
                        used.add(code);
                        unicodeMap[name] = `&#${code};`;
                        const content = await fs_1.default.promises.readFile(file, 'utf8');
                        if (settled)
                            return;
                        const glyph = stream_1.Readable.from([content]);
                        glyph.metadata = {
                            unicode: [String.fromCharCode(code)],
                            name: name
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&apos;'),
                        };
                        glyph.on('error', e => fail(new buildSupport_1.BuildError('INVALID_SVG', `${file}: ${e.message}`, file, 'svg')));
                        glyphs.push(glyph);
                        await new Promise((done, rejectWrite) => {
                            font.write(glyph, (error) => (error ? rejectWrite(error) : done()));
                        });
                        (0, buildSupport_1.progress)(this.options, 'SVG Processing', glyphs.length, files.length, name);
                    }
                    if (!settled)
                        font.end();
                };
                feed().catch(e => fail(e instanceof Error ? e : new Error(String(e))));
            });
            this.svgUnicodeObj = Object.freeze(unicodeMap);
        }
        finally {
            clearTimeout(timer);
            font.destroy();
            output.destroy();
            glyphs.forEach(glyph => glyph.destroy());
        }
    }
}
exports.default = ConcreteSVGBuilder;
//# sourceMappingURL=SVGBuilder.js.map