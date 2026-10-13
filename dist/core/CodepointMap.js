"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareCodepoints = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const buildSupport_1 = require("./buildSupport");
function prepareCodepoints(options, names, sourceHashes) {
    if (!options.codepointMap && !options.codepoints)
        return undefined;
    const mapPath = options.codepointMap
        ? path_1.default.resolve(options.dist, options.codepointMap)
        : undefined;
    let previous = {};
    let previousHashes;
    if (mapPath && fs_1.default.existsSync(mapPath)) {
        try {
            const data = JSON.parse(fs_1.default.readFileSync(mapPath, 'utf8'));
            if (data.schemaVersion !== 1 ||
                !data.codepoints ||
                typeof data.codepoints !== 'object' ||
                Array.isArray(data.codepoints))
                throw new Error('Expected schemaVersion: 1 and a codepoints object');
            previous = data.codepoints;
            if (data.sourceHashes !== undefined) {
                if (!data.sourceHashes ||
                    typeof data.sourceHashes !== 'object' ||
                    Array.isArray(data.sourceHashes))
                    throw new Error('sourceHashes must be an object');
                for (const [name, hash] of Object.entries(data.sourceHashes)) {
                    if (!Object.prototype.hasOwnProperty.call(previous, name) ||
                        typeof hash !== 'string' ||
                        !/^[a-f0-9]{64}$/.test(hash))
                        throw new Error(`Invalid source hash for ${name}`);
                }
                previousHashes = data.sourceHashes;
            }
        }
        catch (e) {
            throw new buildSupport_1.BuildError('INVALID_CODEPOINT_MAP', `Invalid codepoint map ${mapPath}: ${e.message}`, mapPath, 'check');
        }
    }
    const codes = Object.assign(Object.create(null), previous);
    for (const [name, code] of Object.entries(options.codepoints || {})) {
        if (Object.prototype.hasOwnProperty.call(previous, name) && previous[name] !== code) {
            throw new buildSupport_1.BuildError('CODEPOINT_CONFLICT', `Seed codepoint changes existing mapping for ${name}`, mapPath, 'check');
        }
        codes[name] = code;
    }
    const used = new Set();
    for (const [name, code] of Object.entries(codes)) {
        if (!name ||
            !Number.isInteger(code) ||
            code < 0 ||
            code > 65535 ||
            (code >= 0xd800 && code <= 0xdfff) ||
            used.has(code)) {
            throw new buildSupport_1.BuildError('CODEPOINT_CONFLICT', `Invalid or duplicate codepoint for ${name}`, mapPath, 'check');
        }
        used.add(code);
    }
    let next = options.unicodeStart;
    for (const name of [...names].sort()) {
        if (Object.prototype.hasOwnProperty.call(codes, name))
            continue;
        while (used.has(next) || (next >= 0xd800 && next <= 0xdfff))
            next++;
        if (next > 59999)
            throw new buildSupport_1.BuildError('CODEPOINT_RANGE_EXHAUSTED', 'No available codepoints in configured range', mapPath, 'check');
        codes[name] = next;
        used.add(next++);
    }
    return {
        path: mapPath,
        codepoints: codes,
        sourceHashes,
        changes: {
            added: names.filter(name => !Object.prototype.hasOwnProperty.call(previousHashes || previous, name)),
            removed: Object.keys(previousHashes || previous).filter(name => !names.includes(name)),
            changed: previousHashes && sourceHashes
                ? names.filter(name => Object.prototype.hasOwnProperty.call(previousHashes, name) &&
                    previousHashes[name] !== sourceHashes[name])
                : [],
            contentCompared: Boolean(previousHashes && sourceHashes),
        },
    };
}
exports.prepareCodepoints = prepareCodepoints;
//# sourceMappingURL=CodepointMap.js.map