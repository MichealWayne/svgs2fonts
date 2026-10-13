import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { BuildError, canonicalPath } from './buildSupport';

/** Stage on the output filesystem; roll back only files owned by this build. */
export class OutputTransaction {
  readonly stage: string;
  private backup: string;
  private preserveRecovery = false;
  private lock: string;

  constructor(
    private output: string,
    fontName: string
  ) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const canonical = canonicalPath(output);
    const parent = path.dirname(canonical);
    const key = createHash('sha256').update(canonical).digest('hex').slice(0, 16);
    this.lock = path.join(parent, `.svgs2fonts-${key}.lock`);
    try {
      fs.writeFileSync(this.lock, JSON.stringify({ pid: process.pid, output }), { flag: 'wx' });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
      throw new BuildError(
        'OUTPUT_LOCKED',
        `Output is locked by another build; inspect ${this.lock} before removing a stale lock`,
        this.lock,
        'commit'
      );
    }
    try {
      this.stage = fs.mkdtempSync(path.join(parent, `.svgs2fonts-${fontName}-`));
    } catch (e) {
      fs.unlinkSync(this.lock);
      throw e;
    }
    this.backup = path.join(this.stage, '.backup');
  }

  commit(relativeFiles: string[]): string[] {
    const saved: string[] = [];
    const installed: string[] = [];
    fs.mkdirSync(this.output, { recursive: true });
    fs.mkdirSync(this.backup);
    try {
      for (const relative of relativeFiles) {
        const destination = path.join(this.output, relative);
        const staged = path.join(this.stage, relative);
        if (
          relative.startsWith('.') ||
          path.isAbsolute(relative) ||
          relative.split(/[\\/]/).includes('..')
        ) {
          throw new BuildError('INVALID_OUTPUT_PATH', `Unsafe output path: ${relative}`);
        }
        if (!fs.statSync(staged).isFile())
          throw new BuildError('OUTPUT_MISSING', `Missing staged file: ${relative}`);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        if (fs.existsSync(destination)) {
          const stat = fs.lstatSync(destination);
          if (!stat.isFile() || stat.isSymbolicLink())
            throw new BuildError(
              'OUTPUT_COLLISION',
              `Output is not a regular file: ${destination}`,
              destination
            );
          const old = path.join(this.backup, relative);
          fs.mkdirSync(path.dirname(old), { recursive: true });
          fs.renameSync(destination, old);
          saved.push(relative);
        }
        fs.renameSync(staged, destination);
        installed.push(relative);
      }
      return installed.map(relative => path.join(this.output, relative));
    } catch (error) {
      try {
        for (const relative of installed.reverse()) fs.unlinkSync(path.join(this.output, relative));
        for (const relative of saved.reverse())
          fs.renameSync(path.join(this.backup, relative), path.join(this.output, relative));
      } catch (rollbackError) {
        this.preserveRecovery = true;
        throw new BuildError(
          'ROLLBACK_FAILED',
          `${(error as Error).message}; recovery files retained at ${this.backup}: ${(rollbackError as Error).message}`,
          this.backup,
          'commit'
        );
      }
      throw new BuildError(
        'OUTPUT_COMMIT_FAILED',
        `Output update rolled back: ${(error as Error).message}`,
        this.output,
        'commit'
      );
    }
  }

  cleanup(): void {
    if (!this.preserveRecovery) {
      try {
        fs.rmSync(this.stage, { recursive: true, force: true });
      } finally {
        fs.unlinkSync(this.lock);
      }
    }
  }
}
