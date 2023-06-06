/**
 * @author Wayne
 * @Date 2022-03-22 13:48:00
 * @LastEditTime 2023-06-06 10:52:44
 */
/**
 * @export svgs2fonts
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2023.06.03
 * @version 2.0.2
 */

import { isSuccessResult } from './lib/utils';
import { InitOptionsParams } from './types/OptionType';

import SVGBuilder from './builders/SVGBuilder';
import FontsBuilder from './builders/FontsBuilder';
import DemoBuilder from './builders/DemoBuilder';

export async function init(options: Partial<InitOptionsParams>): Promise<true | Error> {
  // step1: build svg fonts
  const svgBuilder = new SVGBuilder(options);
  const svgBuildRes = await svgBuilder.createSvgsFont();
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

  // finish
  svgBuilder.clearCache();

  return true;
}

export default {
  init,
};
