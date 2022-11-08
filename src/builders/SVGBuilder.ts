/**
 * @module SVGBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2022.10.07
 */

import fs from 'fs';
import { basename, join } from 'path';
import SVGIcons2SVGFont from 'svgicons2svgfont';

import { InitOptionsParams } from '../types/OptionType';
import DEFAULT_OPTIONS from '../options';
import { SUCCESS_FlAG, FAIL_FlAG, IS_DEV } from '../constant';

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

export abstract class SVGBuilder {
  public unicodeStart: number;
  public svgsPathList: string[];
  public options: InitOptionsParams;
  public svgUnicodeObj: SvgUnicodeObjParams;

  constructor(options: Partial<InitOptionsParams>) {
    this.options = Object.assign(DEFAULT_OPTIONS, options);
    this.svgsPathList = filterSvgFiles(this.options.src);
    this.unicodeStart = this.options.unicodeStart;
    this.svgUnicodeObj = {};
    if (this.options.debug === false) {
      global.__sf_debug = false;
    }
  }

  public abstract svgs2svgsFont(): Promise<boolean>;
}

export default class ConcreteSVGBuilder extends SVGBuilder {
  constructor(options: Partial<InitOptionsParams>) {
    super(options);
  }

  async svgs2svgsFont(): Promise<boolean> {
    // Setting the font destination
    const DIST_PATH = join(this.options.dist, `${this.options.fontName}.svg`);

    global.__sf_debug && console.log(`[running]start write ${DIST_PATH}`);

    const res = await new Promise<boolean>(resolve => {
      // init dist folder
      const mkdirRes = mkdirpSync(this.options.dist);
      if (!isSuccessResult(mkdirRes)) {
        global.__sf_debug &&
          console.error(
            `Error!create director fail! path=${this.options.dist} errorMsg:${mkdirRes}`
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

      // https://www.npmjs.com/package/svgicons2svgfont
      const fontStream = new SVGIcons2SVGFont({
        // before v2: fontName: this.options.fontName,
        ...this.options,
      });
      fontStream
        .pipe(fs.createWriteStream(DIST_PATH))
        .on('finish', () => {
          global.__sf_debug && console.log(`[success]SvgFont successfully created!(${DIST_PATH})`);

          this.svgUnicodeObj = UnicodeObj;
          resolve(SUCCESS_FlAG);
        })
        .on('error', err => {
          global.__sf_debug && console.error(err);
          resolve(FAIL_FlAG);
        });

      // append svg info to svg font stream
      this.svgsPathList.forEach(svgPath => writeFontStream(fontStream, svgPath));

      // Do not forget to end the stream
      fontStream.end();
    });
    if (IS_DEV) {
      console.log(res);
    }
    return res;
  }
}
