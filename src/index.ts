/**
 * @export svgs2fonts
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2022.03.20
 * @version 2.0.0
 */

import { isSuccessResult } from './utils';
import { InitOptionsParams } from './types';

import SVGBuilder from './builders/SVGBuilder';
import FontsBuilder from './builders/FontsBuilder';
import DemoBuilder from './builders/DemoBuilder';

module.exports = {
  async init(options: Partial<InitOptionsParams>) {
    // step1: build svg fonts
    const svgBuilder = new SVGBuilder(options);
    const svgBuildRes = await svgBuilder.svgs2svgsFont();
    if (!isSuccessResult(svgBuildRes)) {
      throw Error('svgs 2 svgsFont failed');
    }

    // step2: build ttf
    const fontBuilder = new FontsBuilder(svgBuilder);
    const ttfBuildRes = await fontBuilder.ttf();
    if (!isSuccessResult(ttfBuildRes)) {
      throw Error('svgsfont 2 ttf failed');
    }

    // step3: build eot | woff | woff2
    const [eotBuildRes, woffBuildRes, woff2BuildRes] = await Promise.all([
      fontBuilder.eot(),
      fontBuilder.woff(),
      fontBuilder.woff2(),
    ]);
    if (
      !isSuccessResult(eotBuildRes) ||
      !isSuccessResult(woffBuildRes) ||
      !isSuccessResult(woff2BuildRes)
    ) {
      throw Error(
        `ttf 2 fonts failed.(woff2 Build Res: ${woff2BuildRes}, woffBuildRes: ${woffBuildRes}, woff2BuildRes: ${woff2BuildRes})`
      );
    }

    // step4: build demo
    const demoBuilder = new DemoBuilder(svgBuilder);
    const htmlBuildRes = await demoBuilder.html();
    if (!isSuccessResult(htmlBuildRes)) {
      throw Error('demo html failed');
    }
    return true;
  },
};
