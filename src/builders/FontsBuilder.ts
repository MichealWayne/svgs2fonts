/**
 * @module FontsBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2022.06.03
 */

import fs from 'fs';
import { join } from 'path';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import ttf2eot from 'ttf2eot';

import { createIconFile } from '../lib/fsUtils';
import { SVGBuilder } from './SVGBuilder';

/**
 * @class FontsBuilder
 * @description build ttf/eot/woff/woff2 font files from svgfont
 */
export default class FontsBuilder {
  // use SvgBuilder instance's options
  private svgBuilder: SVGBuilder;

  public ttfBuffer!: Buffer;
  public fontsPath: string;

  constructor(svgBuilder: SVGBuilder) {
    this.svgBuilder = svgBuilder;
    this.fontsPath = join(this.svgBuilder.options.dist, this.svgBuilder.options.fontName);
  }

  /**
   * @description build ttf font
   * @return {Promise<boolean>}
   */
  async ttf(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.ttf`;

    const ttf = svg2ttf(
      fs.readFileSync(
        join(this.svgBuilder.options.dist, `${this.svgBuilder.options.fontName}.svg`),
        'utf8'
      )
    );
    const ttfBuffer = (this.ttfBuffer = Buffer.from(ttf.buffer));
    return createIconFile(DIST_PATH, ttfBuffer, 'ttf');
  }

  /**
   * @description build eot font
   * @return {Promise<boolean>}
   */
  async eot(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.eot`;

    const eot = Buffer.from(ttf2eot(this.ttfBuffer).buffer);
    return createIconFile(DIST_PATH, eot, 'eot');
  }

  /**
   * @description build woff font
   * @return {Promise<boolean>}
   */
  async woff(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.woff`;

    const woff = Buffer.from(ttf2woff(this.ttfBuffer).buffer);
    return createIconFile(DIST_PATH, woff, 'woff');
  }

  /**
   * @description build woff2 font
   * @return {Promise<boolean>}
   */
  async woff2(): Promise<boolean> {
    const DIST_PATH = `${this.fontsPath}.woff2`;

    const woff2 = Buffer.from(ttf2woff2(this.ttfBuffer).buffer);
    return createIconFile(DIST_PATH, woff2, 'woff2');
  }
}
