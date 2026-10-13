"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputTransaction = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const buildSupport_1 = require("./buildSupport");
/** Stage on the output filesystem; roll back only files owned by this build. */
class OutputTransaction {
    constructor(output, fontName) {
        this.output = output;
        this.preserveRecovery = false;
        fs_1.default.mkdirSync(path_1.default.dirname(output), { recursive: true });
        const canonical = (0, buildSupport_1.canonicalPath)(output);
        const parent = path_1.default.dirname(canonical);
        const key = (0, crypto_1.createHash)('sha256').update(canonical).digest('hex').slice(0, 16);
        this.lock = path_1.default.join(parent, `.svgs2fonts-${key}.lock`);
        try {
            fs_1.default.writeFileSync(this.lock, JSON.stringify({ pid: process.pid, output }), { flag: 'wx' });
        }
        catch (e) {
            if (e.code !== 'EEXIST')
                throw e;
            throw new buildSupport_1.BuildError('OUTPUT_LOCKED', `Output is locked by another build; inspect ${this.lock} before removing a stale lock`, this.lock, 'commit');
        }
        try {
            this.stage = fs_1.default.mkdtempSync(path_1.default.join(parent, `.svgs2fonts-${fontName}-`));
        }
        catch (e) {
            fs_1.default.unlinkSync(this.lock);
            throw e;
        }
        this.backup = path_1.default.join(this.stage, '.backup');
    }
    commit(relativeFiles) {
        const saved = [];
        const installed = [];
        fs_1.default.mkdirSync(this.output, { recursive: true });
        fs_1.default.mkdirSync(this.backup);
        try {
            for (const relative of relativeFiles) {
                const destination = path_1.default.join(this.output, relative);
                const staged = path_1.default.join(this.stage, relative);
                if (relative.startsWith('.') ||
                    path_1.default.isAbsolute(relative) ||
                    relative.split(/[\\/]/).includes('..')) {
                    throw new buildSupport_1.BuildError('INVALID_OUTPUT_PATH', `Unsafe output path: ${relative}`);
                }
                if (!fs_1.default.statSync(staged).isFile())
                    throw new buildSupport_1.BuildError('OUTPUT_MISSING', `Missing staged file: ${relative}`);
                fs_1.default.mkdirSync(path_1.default.dirname(destination), { recursive: true });
                if (fs_1.default.existsSync(destination)) {
                    const stat = fs_1.default.lstatSync(destination);
                    if (!stat.isFile() || stat.isSymbolicLink())
                        throw new buildSupport_1.BuildError('OUTPUT_COLLISION', `Output is not a regular file: ${destination}`, destination);
                    const old = path_1.default.join(this.backup, relative);
                    fs_1.default.mkdirSync(path_1.default.dirname(old), { recursive: true });
                    fs_1.default.renameSync(destination, old);
                    saved.push(relative);
                }
                fs_1.default.renameSync(staged, destination);
                installed.push(relative);
            }
            return installed.map(relative => path_1.default.join(this.output, relative));
        }
        catch (error) {
            try {
                for (const relative of installed.reverse())
                    fs_1.default.unlinkSync(path_1.default.join(this.output, relative));
                for (const relative of saved.reverse())
                    fs_1.default.renameSync(path_1.default.join(this.backup, relative), path_1.default.join(this.output, relative));
            }
            catch (rollbackError) {
                this.preserveRecovery = true;
                throw new buildSupport_1.BuildError('ROLLBACK_FAILED', `${error.message}; recovery files retained at ${this.backup}: ${rollbackError.message}`, this.backup, 'commit');
            }
            throw new buildSupport_1.BuildError('OUTPUT_COMMIT_FAILED', `Output update rolled back: ${error.message}`, this.output, 'commit');
        }
    }
    cleanup() {
        if (!this.preserveRecovery) {
            try {
                fs_1.default.rmSync(this.stage, { recursive: true, force: true });
            }
            finally {
                fs_1.default.unlinkSync(this.lock);
            }
        }
    }
}
exports.OutputTransaction = OutputTransaction;
//# sourceMappingURL=OutputTransaction.js.map