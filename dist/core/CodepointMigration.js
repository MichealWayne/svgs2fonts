"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateCodepoints = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const buildSupport_1 = require("./buildSupport");
const OutputTransaction_1 = require("./OutputTransaction");
// sax is already used by the font conversion stack; declare it directly for this entry.
const sax = require('sax');
function fail(code, message, file) {
    throw new buildSupport_1.BuildError(code, message, file, 'migration');
}
function addCode(codes, used, name, value, file) {
    if (!name || /\s|[\x00-\x1f\x7f]/.test(name))
        fail('MIGRATION_INVALID_NAME', `Glyph name cannot be empty or contain whitespace/control characters: ${JSON.stringify(name)}`, file);
    let code = value;
    if (typeof value === 'string') {
        if (/^&#\d+;$/.test(value))
            code = Number(value.slice(2, -1));
        else if (/^&#x[\da-f]+;$/i.test(value))
            code = parseInt(value.slice(3, -1), 16);
    }
    if (typeof code !== 'number' ||
        !Number.isInteger(code) ||
        code < 0 ||
        code > 65535 ||
        (code >= 0xd800 && code <= 0xdfff))
        fail('MIGRATION_INVALID_CODEPOINT', `Expected a single BMP codepoint for ${name}`, file);
    if (Object.prototype.hasOwnProperty.call(codes, name) || used.has(code))
        fail('MIGRATION_CONFLICT', `Duplicate glyph name or codepoint for ${name}`, file);
    codes[name] = code;
    used.add(code);
}
function jsonCodes(content, file) {
    let data;
    try {
        data = JSON.parse(content);
    }
    catch (e) {
        fail('MIGRATION_INVALID_JSON', `Invalid JSON: ${e.message}`, file);
    }
    // JSON.parse silently keeps the last duplicate key; a deployed map must be unambiguous.
    const stack = [];
    for (const match of content.matchAll(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\]:,]|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) {
        const token = match[0];
        const frame = stack[stack.length - 1];
        if (token === '{')
            stack.push({ keys: new Set(), expectingKey: true });
        else if (token === '[')
            stack.push({ expectingKey: false });
        else if (token === '}' || token === ']')
            stack.pop();
        else if (token === ',' && frame?.keys)
            frame.expectingKey = true;
        else if (token.startsWith('"') && frame?.keys && frame.expectingKey) {
            const key = JSON.parse(token);
            if (frame.keys.has(key))
                fail('MIGRATION_CONFLICT', `Duplicate JSON key: ${key}`, file);
            frame.keys.add(key);
            frame.expectingKey = false;
        }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data))
        fail('MIGRATION_INVALID_JSON', 'Expected a JSON mapping object', file);
    const object = data;
    const has = (key) => Object.prototype.hasOwnProperty.call(object, key);
    if (has('schemaVersion') && object.schemaVersion !== 1)
        fail('MIGRATION_INVALID_JSON', 'Only schemaVersion 1 is supported', file);
    if (has('codepoints') && has('unicodeMapping'))
        fail('MIGRATION_CONFLICT', 'Both codepoints and unicodeMapping are present; provide one explicit mapping', file);
    const entries = has('codepoints')
        ? object.codepoints
        : has('unicodeMapping')
            ? object.unicodeMapping
            : object;
    if (!entries || typeof entries !== 'object' || Array.isArray(entries))
        fail('MIGRATION_INVALID_JSON', 'Expected a codepoints/unicodeMapping object or a bare mapping', file);
    const codes = Object.create(null);
    const used = new Set();
    for (const [name, value] of Object.entries(entries))
        addCode(codes, used, name, value, file);
    return codes;
}
function svgCodes(content, file, report) {
    const codes = Object.create(null);
    const used = new Set();
    const parser = sax.parser(true, { strictEntities: true });
    let fontCount = 0, depth = 0, fontDepth = 0, roots = 0;
    const local = (name) => name.split(':').pop();
    parser.onerror = e => fail('MIGRATION_INVALID_SVG', `Invalid SVG font XML: ${e.message}`, file);
    // Standard SVG PUBLIC doctypes are allowed; no DTD or entity is fetched or expanded.
    parser.ondoctype = value => {
        if (/\[|\bENTITY\b/i.test(value))
            fail('MIGRATION_INVALID_SVG', 'DTD internal subsets and entity declarations are unsupported', file);
    };
    parser.onopentag = node => {
        depth++;
        if (depth === 1 && (++roots > 1 || local(node.name) !== 'svg'))
            fail('MIGRATION_INVALID_SVG', 'Expected one SVG font document', file);
        if (local(node.name) === 'font') {
            if (++fontCount > 1)
                fail('MIGRATION_CONFLICT', 'Multiple fonts found; supply a document containing one font', file);
            fontDepth = depth;
        }
        if (local(node.name) !== 'glyph' || !fontDepth)
            return;
        const name = node.attributes['glyph-name'];
        const unicode = node.attributes.unicode;
        if (unicode === undefined || unicode === '') {
            report.warnings.push({
                code: 'MIGRATION_UNENCODED_GLYPH',
                message: `Unencoded glyph omitted: ${name || '(unnamed)'}`,
                file,
            });
            return;
        }
        if (!name)
            fail('MIGRATION_NAME_MISSING', 'An encoded glyph has no glyph-name; names cannot be inferred safely', file);
        if (Array.from(unicode).length !== 1)
            fail('MIGRATION_INVALID_CODEPOINT', `Ligatures or multi-character Unicode are unsupported: ${name}`, file);
        addCode(codes, used, name, unicode.codePointAt(0), file);
    };
    parser.onclosetag = () => {
        if (depth === fontDepth)
            fontDepth = 0;
        depth--;
    };
    parser.write(content).close();
    if (!fontCount)
        fail('MIGRATION_INVALID_SVG', 'No SVG font found; an ordinary SVG icon is not an encoding source', file);
    return codes;
}
function compareSource(src, codes, report) {
    const source = path_1.default.resolve(src);
    if (!fs_1.default.statSync(source).isDirectory())
        fail('INVALID_CONFIG', 'Migration src must be a directory', source);
    const names = fs_1.default
        .readdirSync(source)
        .filter(name => /\.svg$/i.test(name) && fs_1.default.statSync(path_1.default.join(source, name)).isFile())
        .map(name => name.replace(/\.svg$/i, ''))
        .sort();
    if (new Set(names).size !== names.length ||
        names.some(name => !name || /\s|[\x00-\x1f\x7f]/.test(name)))
        fail('MIGRATION_INVALID_NAME', 'Source icon names must be unique and contain no whitespace/control characters', source);
    const present = new Set(names);
    report.comparison = {
        source,
        matched: names.filter(name => Object.prototype.hasOwnProperty.call(codes, name)),
        missing: Object.keys(codes).filter(name => !present.has(name)),
        unmapped: names.filter(name => !Object.prototype.hasOwnProperty.call(codes, name)),
    };
    if (report.comparison.missing.length || report.comparison.unmapped.length)
        report.warnings.push({
            code: 'MIGRATION_SOURCE_MISMATCH',
            message: 'Deployed mapping and source filenames differ; inspect comparison before using the map. Missing names retain reserved codes; unmapped names need new codes.',
            file: source,
        });
}
/** Import deployed encodings without regenerating fonts or overwriting any existing file. */
async function migrateCodepoints(options) {
    const started = Date.now();
    const report = {
        schemaVersion: 1,
        mode: 'migrate',
        status: 'failed',
        success: false,
        codepoints: {},
        iconCount: 0,
        outputs: [],
        errors: [],
        warnings: [],
        durationMs: 0,
    };
    let transaction;
    try {
        if (!options || typeof options !== 'object' || Array.isArray(options))
            fail('INVALID_CONFIG', 'Migration options must be an object');
        for (const key of ['from', 'src', 'output']) {
            if ((key === 'from' || options[key] !== undefined) &&
                (typeof options[key] !== 'string' || !options[key].trim()))
                fail('INVALID_CONFIG', `${key} requires one non-empty path`);
        }
        if (options.format !== undefined && !['auto', 'json', 'svg'].includes(options.format))
            fail('INVALID_CONFIG', 'Migration format must be auto, json or svg');
        report.from = path_1.default.resolve(options.from);
        if (!fs_1.default.statSync(report.from).isFile())
            fail('INVALID_CONFIG', 'Migration input must be a file', report.from);
        const content = fs_1.default.readFileSync(report.from, 'utf8').replace(/^\uFEFF/, '');
        const format = options.format && options.format !== 'auto'
            ? options.format
            : path_1.default.extname(report.from).toLowerCase() === '.svg'
                ? 'svg'
                : path_1.default.extname(report.from).toLowerCase() === '.json'
                    ? 'json'
                    : undefined;
        if (!format)
            fail('INVALID_CONFIG', 'Cannot infer migration format; specify json or svg', report.from);
        report.format = format;
        const codes = format === 'json' ? jsonCodes(content, report.from) : svgCodes(content, report.from, report);
        if (!Object.keys(codes).length)
            fail('MIGRATION_EMPTY', 'No encoded glyphs found', report.from);
        report.codepoints = Object.fromEntries(Object.keys(codes)
            .sort()
            .map(name => [name, codes[name]]));
        report.iconCount = Object.keys(codes).length;
        if (options.src)
            compareSource(options.src, codes, report);
        if (options.output) {
            const output = path_1.default.resolve(options.output);
            if (path_1.default.extname(output).toLowerCase() !== '.json')
                fail('INVALID_CONFIG', 'Migration output must be a .json file', output);
            if (!fs_1.default.statSync(path_1.default.dirname(output)).isDirectory())
                fail('INVALID_CONFIG', 'Output parent must be an existing directory', output);
            transaction = new OutputTransaction_1.OutputTransaction(path_1.default.dirname(output), 'migration');
            const staged = path_1.default.join(transaction.stage, 'map.json');
            fs_1.default.writeFileSync(staged, JSON.stringify({ schemaVersion: 1, codepoints: report.codepoints }, null, 2) + '\n');
            try {
                fs_1.default.linkSync(staged, output);
            }
            catch (e) {
                if (e.code === 'EEXIST')
                    fail('MIGRATION_OUTPUT_EXISTS', 'Output exists; choose a new filename. Existing files are never overwritten.', output);
                throw e;
            }
            report.outputs.push(output);
        }
        report.success = true;
        report.status = 'success';
    }
    catch (e) {
        report.errors.push((0, buildSupport_1.issue)(e));
    }
    finally {
        try {
            transaction?.cleanup();
        }
        catch (e) {
            report.warnings.push({
                code: 'TEMP_CLEANUP_FAILED',
                message: e.message,
                file: transaction?.stage,
            });
        }
        report.durationMs = Date.now() - started;
    }
    return report;
}
exports.migrateCodepoints = migrateCodepoints;
//# sourceMappingURL=CodepointMigration.js.map