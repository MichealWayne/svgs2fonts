/**
 * @module SVGBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2023.06.03
 */

import fs from 'fs';
import { basename, join } from 'path';
import SVGIcons2SVGFont from 'svgicons2svgfont';

import { InitOptionsParams } from '../types/OptionType';
import DEFAULT_OPTIONS from '../options';
import { SUCCESS_FlAG, FAIL_FlAG } from '../constant';

import { filterSvgFiles, mkdirpSync } from '../lib/fsUtils';
import { getIconStrUnicode, isSuccessResult } from '../lib/utils';

interface SvgUnicodeObjParams {
  [propName: string]: string;
}

interface SvgFontStreamMetaData {
  unicode: string[];
  name: string;
}
interface SvgFontStream extends fs.ReadStream {
  metadata: SvgFontStreamMetaData;
}

/**
 * @class SVGBuilder
 * @description 通过svg图标文件组合构建出svg字体
 */
export abstract class SVGBuilder {
  // build options
  public options: InitOptionsParams;

  // icon start unicode
  public unicodeStart: number;

  // origin svg files Path
  public svgsPaths: Set<string>;

  // icon unicode map
  public svgUnicodeObj: SvgUnicodeObjParams;

  constructor(options: Partial<InitOptionsParams>) {
    this.options = Object.assign(DEFAULT_OPTIONS, options);
    this.svgsPaths = filterSvgFiles(this.options.src);
    this.unicodeStart = this.options.unicodeStart;
    this.svgUnicodeObj = {};

    if (this.options.debug === false) {
      // Forced to close the debug flag
      global.__sf_debug = false;
    }
  }

  /**
   * @description create svgfont from svg icons
   * @return Promise<boolean>
   */
  public abstract createSvgsFont(): Promise<boolean>;

  /**
   * @description clear options and params(for GC)
   */
  public abstract clearCache(): void;
}

/**
 * @class ConcreteSVGBuilder
 */
export default class ConcreteSVGBuilder extends SVGBuilder {
  constructor(options: Partial<InitOptionsParams>) {
    super(options);
  }

  clearCache(): void {
    this.svgUnicodeObj = {};
    this.options = DEFAULT_OPTIONS;
    this.svgsPaths.clear();
  }

  async createSvgsFont(): Promise<boolean> {
    // Setting the font destination
    const DIST_PATH = join(this.options.dist, `${this.options.fontName}.svg`);

    global.__sf_debug && console.log(`[running][SVGBuilder]Start write ${DIST_PATH}`);

    return await new Promise<boolean>(resolve => {
      // init dist folder
      const mkdirRes = mkdirpSync(this.options.dist);
      if (!isSuccessResult(mkdirRes)) {
        global.__sf_debug &&
          console.error(
            `[SVGBuilder]Error! Create output director fail! (path=${this.options.dist} errorMsg:${mkdirRes})`
          );
        resolve(FAIL_FlAG);
      }

      const unicodeStart = this.options.unicodeStart;
      const UnicodeObj: SvgUnicodeObjParams = {};

      /**
       * write font stream
       * @param {String} svgPath svg path.
       */
      function writeFontStream(fontStreamInstance: SVGIcons2SVGFont, svgPath: string) {
        const _svgName = basename(svgPath).split('.')[0];
        const unicode = getIconStrUnicode(_svgName, unicodeStart);
        UnicodeObj[_svgName] = `&#${unicode};`;

        const glyph = fs.createReadStream(svgPath) as SvgFontStream;
        // attr metadata for 'SVGIcons2SVGFont' stream
        glyph.metadata = {
          unicode: [String.fromCharCode(unicode)],
          name: _svgName,
        };

        fontStreamInstance.write(glyph);
      }

      // @document https://www.npmjs.com/package/svgicons2svgfont
      const fontStream = new SVGIcons2SVGFont({
        // before v2: fontName: this.options.fontName,
        ...this.options,
      });
      fontStream
        .pipe(fs.createWriteStream(DIST_PATH))
        .on('finish', () => {
          global.__sf_debug &&
            console.log(`[success][SVGBuilder] SvgFont successfully created!(${DIST_PATH})`);

          this.svgUnicodeObj = UnicodeObj;
          resolve(SUCCESS_FlAG);
        })
        .on('error', err => {
          global.__sf_debug && console.error(err);
          resolve(FAIL_FlAG);
        });

      // append svg info to svg font stream
      this.svgsPaths.forEach(svgPath => writeFontStream(fontStream, svgPath));

      // Do not forget to end the stream
      fontStream.end();
    });
  }
}
