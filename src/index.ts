/**
 * @export svgs2fonts
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2024.09.28
 * @version 2.1.0
 */

import { isSuccessResult } from './lib/utils';
import { InitOptionsParams } from './types/OptionType';

import SVGBuilder from './builders/SVGBuilder';
import FontsBuilder from './builders/FontsBuilder';
import DemoBuilder from './builders/DemoBuilder';

/**
 * @function init
 * @description 初始化及执行svg转字体图标
 * @param {Partial<InitOptionsParams>} options
 * @returns {Promise<true | Error>}
 */
export async function init(options: Partial<InitOptionsParams>): Promise<true | Error> {
  // step1: build svg fonts
  const svgBuilder = new SVGBuilder(options);
  const svgBuildRes = await svgBuilder.createSvgsFont();
  if (!isSuccessResult(svgBuildRes)) {
    throw new Error('Error! svgs 2 svgsFont failed(svgs2fonts).');
  }

  // step2: build ttf
  const fontBuilder = new FontsBuilder(svgBuilder);
  const ttfBuildRes = await fontBuilder.ttf();
  if (!isSuccessResult(ttfBuildRes)) {
    throw new Error('Error! svgsfont 2 ttf failed(svgs2fonts)');
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
    throw new Error(
      `Error! ttf 2 fonts failed.(woff2 Build Res: ${woff2BuildRes}, woffBuildRes: ${woffBuildRes}, woff2BuildRes: ${woff2BuildRes})`
    );
  }

  // step4: build demo
  const demoBuilder = new DemoBuilder(svgBuilder);
  const htmlBuildRes = await demoBuilder.html();
  if (!isSuccessResult(htmlBuildRes)) {
    throw new Error('Error! demo html failed(svgs2fonts).');
  }

  // finish
  svgBuilder.clearCache();

  return true;
}

export default {
  init,
};
