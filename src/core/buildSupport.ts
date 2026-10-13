import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { ValidatedOptions } from '../config/ConfigurationManager';
import { BuildIssue, DirectoryReport } from '../types/BuildReport';

export class BuildError extends Error {
  constructor(
    public code: string,
    message: string,
    public file?: string,
    public phase?: string
  ) {
    super(message);
    this.name = 'BuildError';
  }
}

export function issue(error: unknown, directory?: string): BuildIssue {
  const e = error instanceof Error ? error : new Error(String(error));
  return {
    code: (e as BuildError).code || 'BUILD_FAILED',
    message: e.message,
    file: (e as BuildError).file,
    phase: (e as BuildError).phase,
    directory,
  };
}

export function emptyDirectory(options: ValidatedOptions): DirectoryReport {
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

export function inspectInput(options: ValidatedOptions): {
  files: string[];
  warnings: BuildIssue[];
  sourceHashes: Record<string, string>;
} {
  const warnings: BuildIssue[] = [];
  const files: string[] = [];
  const sourceHashes: Record<string, string> = Object.create(null);
  const outputNames = options.fontFormats!.map(format => `${options.fontName}.${format}`);
  if (!options.noDemo)
    outputNames.push(
      options.demoUnicodeHTML,
      options.demoFontClassHTML,
      options.demoUnicodeHTML.replace(/\.html$/i, '.css'),
      options.demoFontClassHTML.replace(/\.html$/i, '.css')
    );
  if (options.outputCss) outputNames.push(`${options.fontName}.css`);
  if (options.outputManifest) outputNames.push(`${options.fontName}.json`);
  if (options.codepointMap) outputNames.push(options.codepointMap);
  for (const name of outputNames) {
    const output = path.join(options.dist, name);
    try {
      const stat = fs.lstatSync(output);
      if (!stat.isFile() || stat.isSymbolicLink())
        throw new BuildError(
          'OUTPUT_COLLISION',
          `Output is not a regular file: ${output}`,
          output,
          'check'
        );
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
  }

  for (const name of fs.readdirSync(options.src)) {
    if (path.extname(name).toLowerCase() !== '.svg') continue;
    const iconName = name.replace(/\.svg$/i, '');
    if (/\s|[\x00-\x1f\x7f]/.test(iconName))
      throw new BuildError(
        'INVALID_ICON_NAME',
        `Icon names must not contain whitespace or control characters: ${name}`,
        path.join(options.src, name),
        'check'
      );
    const file = path.join(options.src, name);
    if (!fs.statSync(file).isFile()) continue;
    const bytes = fs.readFileSync(file);
    const content = bytes.toString('utf8');
    // The CLI historically outputs into src. Exclude only a recognizable generated font.
    if (
      path.resolve(options.src) === path.resolve(options.dist) &&
      name.toLowerCase() === `${options.fontName}.svg`.toLowerCase() &&
      /<font\b/i.test(content)
    ) {
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
      throw new BuildError(
        'UNSUPPORTED_SVG',
        `SVG contains unsupported embedded content or declarations: ${file}`,
        file,
        'check'
      );
    }
    if (/<(?:linearGradient|radialGradient|filter|mask|clipPath)\b|\bstroke\s*=/i.test(content)) {
      warnings.push({
        code: 'SVG_REVIEW_REQUIRED',
        file,
        message: 'Review gradients, filters, masks, clipping or strokes after font conversion.',
      });
    }
    if (
      options.fontFormats!.includes('svg') &&
      canonicalPath(file) === canonicalPath(path.join(options.dist, `${options.fontName}.svg`))
    ) {
      throw new BuildError(
        'OUTPUT_COLLISION',
        `Output would overwrite source icon: ${file}`,
        file,
        'check'
      );
    }
    files.push(file);
    sourceHashes[iconName] = createHash('sha256').update(bytes).digest('hex');
  }
  if (!files.length)
    throw new BuildError(
      'NO_SVG_FILES',
      `No SVG icons found in ${options.src}`,
      options.src,
      'check'
    );
  return { files, warnings, sourceHashes };
}

export function experimentalWarnings(options: ValidatedOptions): BuildIssue[] {
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
    .filter(key => (options as any)[key] !== undefined && (options as any)[key] !== false)
    .map(key => ({
      code: 'EXPERIMENTAL_OPTION_IGNORED',
      message: `${key} is accepted for compatibility but has no implemented execution effect.`,
    }));
}

export function progress(
  options: ValidatedOptions,
  phase: string,
  completed: number,
  total: number,
  current?: string
): void {
  // A consumer's observer must not turn a committed build into a reported failure.
  if (options.progressCallback) {
    try {
      options.progressCallback({ phase: phase as any, completed, total, current });
    } catch (e) {
      console.warn(
        '[svgs2fonts] Progress callback failed:',
        e instanceof Error ? e.message : String(e)
      );
    }
  }
}

/** Canonicalize existing ancestors without creating paths (also used in read-only checks). */
export function canonicalPath(value: string): string {
  let current = path.resolve(value);
  const suffix: string[] = [];
  while (!fs.existsSync(current)) {
    suffix.unshift(path.basename(current));
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.join(fs.realpathSync(current), ...suffix);
}
