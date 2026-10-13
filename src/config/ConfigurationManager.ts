import fs from 'fs';
import path from 'path';
import DEFAULT_OPTIONS from '../builders/options';
import { EnhancedOptions, FontFormat, InitOptionsParams } from '../types/OptionType';

export type ValidatedOptions = EnhancedOptions & InitOptionsParams;

export const DEFAULT_FONT_FORMATS: FontFormat[] = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
export const VALID_FONT_FORMATS: FontFormat[] = [...DEFAULT_FONT_FORMATS];

export class ConfigurationError extends Error {
  readonly code = 'INVALID_CONFIG';
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ConfigurationManager {
  private options: ValidatedOptions;

  constructor(rawOptions: Partial<EnhancedOptions>) {
    if (!rawOptions || typeof rawOptions !== 'object' || Array.isArray(rawOptions)) {
      throw new ConfigurationError('Options must be an object');
    }
    const supplied = Object.fromEntries(
      Object.entries(rawOptions).filter(([, value]) => value !== undefined)
    );
    const options = {
      ...DEFAULT_OPTIONS,
      fontFormats: [...DEFAULT_FONT_FORMATS],
      batchMode: false,
      batchSize: 3,
      continueOnError: true,
      verbose: false,
      ...supplied,
    } as ValidatedOptions;
    const fail = (message: string, field: string): never => {
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
      if ((options as any)[field] !== undefined && typeof (options as any)[field] !== 'boolean')
        fail(`${field} must be a boolean`, field);
    }
    if (!options.dist || typeof options.dist !== 'string')
      fail('Output directory (dist) is required', 'dist');
    if (typeof options.fontName !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(options.fontName))
      fail('Font name must contain only letters, numbers, hyphens and underscores', 'fontName');
    if (
      !Number.isInteger(options.unicodeStart) ||
      options.unicodeStart < 0 ||
      options.unicodeStart >= 59999 ||
      (options.unicodeStart >= 0xd800 && options.unicodeStart <= 0xdfff)
    )
      fail(
        'unicodeStart must be an integer from 0 to 59998 outside the surrogate range',
        'unicodeStart'
      );
    if (
      !Number.isInteger(options.batchSize) ||
      !Number.isFinite(options.batchSize) ||
      options.batchSize! < 1
    )
      fail('Batch size must be a positive finite integer', 'batchSize');
    if (
      !Array.isArray(options.fontFormats) ||
      !options.fontFormats.length ||
      options.fontFormats.some(format => !VALID_FONT_FORMATS.includes(format))
    )
      fail(
        `Invalid font formats. Use a non-empty array of: ${VALID_FONT_FORMATS.join(', ')}`,
        'fontFormats'
      );
    options.fontFormats = [...new Set(options.fontFormats)];
    if (options.progressCallback !== undefined && typeof options.progressCallback !== 'function')
      fail('progressCallback must be a function', 'progressCallback');
    for (const field of ['fontHeight', 'round']) {
      const value = (options as any)[field];
      if (
        value !== undefined &&
        (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
      )
        fail(`${field} must be a positive finite number`, field);
    }
    for (const field of ['normalize', 'centerHorizontally']) {
      if ((options as any)[field] !== undefined && typeof (options as any)[field] !== 'boolean')
        fail(`${field} must be a boolean`, field);
    }
    for (const field of ['demoUnicodeHTML', 'demoFontClassHTML']) {
      const value = (options as any)[field];
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.html$/i.test(value))
        fail(`${field} must be a plain .html filename`, field);
    }
    if (
      options.outputPattern !== undefined &&
      (typeof options.outputPattern !== 'string' ||
        !options.outputPattern ||
        path.isAbsolute(options.outputPattern) ||
        /(^|[\\/])\.\.?([\\/]|$)/.test(options.outputPattern) ||
        /\[[^\]]+\]/.test(options.outputPattern.replace(/\[(name|fontname)\]/g, '')))
    )
      fail(
        'outputPattern must be a relative path using only [name] and [fontname] placeholders',
        'outputPattern'
      );
    if (
      options.codepointMap !== undefined &&
      (typeof options.codepointMap !== 'string' ||
        !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.json$/i.test(options.codepointMap))
    )
      fail(
        'codepointMap must be a plain .json filename relative to the output directory',
        'codepointMap'
      );
    if (
      options.codepoints !== undefined &&
      (!options.codepoints ||
        typeof options.codepoints !== 'object' ||
        Array.isArray(options.codepoints))
    )
      fail('codepoints must be a name-to-codepoint object', 'codepoints');
    const outputs = [...options.fontFormats.map(format => `${options.fontName}.${format}`)];
    if (!options.noDemo) {
      outputs.push(
        options.demoUnicodeHTML,
        options.demoFontClassHTML,
        options.demoUnicodeHTML.replace(/\.html$/i, '.css'),
        options.demoFontClassHTML.replace(/\.html$/i, '.css')
      );
    }
    if (options.outputCss) outputs.push(`${options.fontName}.css`);
    if (options.outputManifest) outputs.push(`${options.fontName}.json`);
    if (options.codepointMap) outputs.push(options.codepointMap);
    if (new Set(outputs.map(name => name.toLowerCase())).size !== outputs.length)
      fail('Requested output filenames collide', 'dist');
    options.dist = path.resolve(options.dist);
    if (fs.existsSync(options.dist) && !fs.statSync(options.dist).isDirectory())
      fail(`Output is not a directory: ${options.dist}`, 'dist');
    if (options.src) {
      if (typeof options.src !== 'string') fail('src must be a directory path', 'src');
      options.src = path.resolve(options.src);
    }
    if (!options.batchMode) {
      if (!options.src) fail('Source directory (src) is required', 'src');
      if (!fs.existsSync(options.src))
        fail(`Source directory does not exist: ${options.src}`, 'src');
      if (!fs.statSync(options.src).isDirectory())
        fail(`Source is not a directory: ${options.src}`, 'src');
    } else {
      if (
        !Array.isArray(options.inputDirectories) ||
        !options.inputDirectories.length ||
        options.inputDirectories.some(dir => typeof dir !== 'string' || !dir)
      )
        fail(
          'Batch mode requires inputDirectories to be a non-empty array of paths',
          'inputDirectories'
        );
      options.inputDirectories = options.inputDirectories!.map(dir => path.resolve(dir));
      // Missing batch inputs are diagnosed per item so continueOnError can work.
    }
    this.options = options;
  }

  getOptions(): ValidatedOptions {
    return {
      ...this.options,
      fontFormats: [...this.options.fontFormats!],
      inputDirectories: this.options.inputDirectories && [...this.options.inputDirectories],
      codepoints: this.options.codepoints && { ...this.options.codepoints },
    };
  }

  getSummary(): string {
    const o = this.options;
    return `Source: ${o.src}\nOutput: ${o.dist}\nFont Name: ${o.fontName}\nFormats: ${o.fontFormats!.join(', ')}\nBatch Mode: ${o.batchMode}`;
  }
}

export function createConfiguration(options: Partial<EnhancedOptions>): ConfigurationManager {
  return new ConfigurationManager(options);
}
