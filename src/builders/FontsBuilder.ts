/**
 * @module FontsBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2022.10.07
 */

import fs from 'fs';
import { join } from 'path';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import ttf2eot from 'ttf2eot';

import { setIconFile } from '../lib/fsUtils';
import { SVGBuilder } from './SVGBuilder';

export default class FontsBuilder {
  private svgBuilder: SVGBuilder;
  public ttfBuffer!: Buffer;
  public fontsPath: string;

  constructor(svgBuilder: SVGBuilder) {
    this.svgBuilder = svgBuilder;
    this.fontsPath = join(this.svgBuilder.options.dist, this.svgBuilder.options.fontName);
  }

  /**
   * build ttf font
   * @returns
   */
  async ttf(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.ttf`; // 输出地址

    const ttf = svg2ttf(
      fs.readFileSync(
        join(this.svgBuilder.options.dist, `${this.svgBuilder.options.fontName}.svg`),
        'utf8'
      )
    );
    const ttfBuffer = (this.ttfBuffer = Buffer.from(ttf.buffer));
    return setIconFile(DIST_PATH, ttfBuffer, 'ttf');
  }

  /**
   * build eot font
   */
  async eot(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.eot`; // 输出地址

    const eot = Buffer.from(ttf2eot(this.ttfBuffer).buffer);
    return setIconFile(DIST_PATH, eot, 'eot');
  }

  /**
   * build woff font
   */
  async woff(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.woff`; // 输出地址

    const woff = Buffer.from(ttf2woff(this.ttfBuffer).buffer);
    return setIconFile(DIST_PATH, woff, 'woff');
  }

  /**
   * build woff2 font
   */
  async woff2(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.woff2`; // 输出地址

    const woff2 = Buffer.from(ttf2woff2(this.ttfBuffer).buffer);
    return setIconFile(DIST_PATH, woff2, 'woff2');
  }
}
