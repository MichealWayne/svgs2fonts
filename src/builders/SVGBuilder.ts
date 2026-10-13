import fs from 'fs';
import { basename, join } from 'path';
import { Readable } from 'stream';
import SVGIcons2SVGFont from 'svgicons2svgfont';
import { EnhancedOptions, InitOptionsParams } from '../types/OptionType';
import DEFAULT_OPTIONS from './options';
import { filterSvgFiles } from '../utils/fsUtils';
import { createUnicodeGenerator } from '../utils/utils';
import { BuildError, progress } from '../core/buildSupport';

export interface SvgUnicodeMap {
  readonly [iconName: string]: string;
}
export type SvgUnicodeObjParams = SvgUnicodeMap;

export abstract class SVGBuilder {
  protected readonly options: InitOptionsParams & EnhancedOptions;
  protected readonly svgsPaths: ReadonlySet<string>;
  protected svgUnicodeObj: SvgUnicodeMap = Object.freeze({});
  protected lastError?: Error;

  constructor(options: Partial<EnhancedOptions>, files?: string[]) {
    this.options = Object.freeze({ ...DEFAULT_OPTIONS, ...options });
    this.svgsPaths = files ? new Set(files) : filterSvgFiles(this.options.src);
  }
  get buildOptions(): InitOptionsParams & EnhancedOptions {
    return this.options;
  }
  get unicodeMapping(): SvgUnicodeMap {
    return this.svgUnicodeObj;
  }
  get error(): Error | undefined {
    return this.lastError;
  }
  async createSvgsFont(): Promise<boolean> {
    this.lastError = undefined;
    try {
      await this.executeFontCreation();
      return true;
    } catch (e) {
      this.lastError = e instanceof Error ? e : new Error(String(e));
      return false;
    }
  }
  protected abstract executeFontCreation(): Promise<void>;
  clearCache(): void {
    this.svgUnicodeObj = Object.freeze({});
  }
}

export default class ConcreteSVGBuilder extends SVGBuilder {
  protected async executeFontCreation(): Promise<void> {
    const files = [...this.svgsPaths];
    if (!files.length)
      throw new BuildError(
        'NO_SVG_FILES',
        `No SVG icons found in ${this.options.src}`,
        this.options.src,
        'svg'
      );
    fs.mkdirSync(this.options.dist, { recursive: true });
    const destination = join(this.options.dist, `${this.options.fontName}.svg`);
    const generateUnicode = createUnicodeGenerator(this.options.unicodeStart);
    const unicodeMap: Record<string, string> = Object.create(null);
    const used = new Set<number>();
    const font = new SVGIcons2SVGFont({
      ...this.options,
      normalize: this.options.normalize ?? true,
      fontHeight: this.options.fontHeight ?? 1000,
      centerHorizontally: this.options.centerHorizontally ?? true,
      log: this.options.verbose
        ? (message: string) => console.error(`[svgs2fonts] ${message}`)
        : () => {},
    } as any);
    const output = fs.createWriteStream(destination);
    const glyphs: Readable[] = [];
    let timer: NodeJS.Timeout;
    let currentFile = this.options.src;
    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const fail = (e: Error) => {
          if (settled) return;
          settled = true;
          reject(
            e instanceof BuildError
              ? e
              : new BuildError('INVALID_SVG', `${currentFile}: ${e.message}`, currentFile, 'svg')
          );
          font.destroy();
          output.destroy();
          glyphs.forEach(glyph => glyph.destroy());
        };
        timer = setTimeout(
          () =>
            fail(
              new BuildError(
                'SVG_TIMEOUT',
                'SVG font creation exceeded 30 seconds',
                this.options.src,
                'svg'
              )
            ),
          30000
        );
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
            if (settled) return;
            const name = basename(file).replace(/\.svg$/i, '');
            const code =
              this.options.codepoints &&
              Object.prototype.hasOwnProperty.call(this.options.codepoints, name)
                ? this.options.codepoints[name]
                : generateUnicode(name);
            if (
              !Number.isInteger(code) ||
              code < 0 ||
              code > 65535 ||
              (code >= 0xd800 && code <= 0xdfff) ||
              used.has(code)
            ) {
              throw new BuildError(
                'CODEPOINT_CONFLICT',
                `Invalid or duplicate codepoint for ${name}`,
                file,
                'svg'
              );
            }
            used.add(code);
            unicodeMap[name] = `&#${code};`;
            const content = await fs.promises.readFile(file, 'utf8');
            if (settled) return;
            const glyph = Readable.from([content]);
            (glyph as any).metadata = {
              unicode: [String.fromCharCode(code)],
              name: name
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;'),
            };
            glyph.on('error', e =>
              fail(new BuildError('INVALID_SVG', `${file}: ${e.message}`, file, 'svg'))
            );
            glyphs.push(glyph);
            await new Promise<void>((done, rejectWrite) => {
              font.write(glyph, (error?: Error | null) => (error ? rejectWrite(error) : done()));
            });
            progress(this.options, 'SVG Processing', glyphs.length, files.length, name);
          }
          if (!settled) font.end();
        };
        feed().catch(e => fail(e instanceof Error ? e : new Error(String(e))));
      });
      this.svgUnicodeObj = Object.freeze(unicodeMap);
    } finally {
      clearTimeout(timer!);
      font.destroy();
      output.destroy();
      glyphs.forEach(glyph => glyph.destroy());
    }
  }
}
