/**
 * @module DemoBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2023.06.03
 */

import { join, extname } from 'path';

import { writeFile } from '../lib/fsUtils';
import { isString } from '../lib/utils';
import { SVGBuilder } from './SVGBuilder';
import { SUCCESS_FlAG, FAIL_FlAG, DEMO_CSS, DEMO_HTML } from '../constant';

const DEMO_REGEXS = {
  fontName: /\{\{fontName\}\}/g,
  CSS: /\{\{demoCss\}\}/g,
  CSSFile: /\{\{demoCssFile\}\}/,
  HTML: /\{\{demoHtml\}\}/,
};

/**
 * @class DemoBuilder
 */
export default class DemoBuilder {
  // use SvgBuilder instance's options and UnicodeObj
  private svgBuilder: SVGBuilder;

  constructor(svgBuilder: SVGBuilder) {
    this.svgBuilder = svgBuilder;
  }

  async html(): Promise<boolean> {
    let _codeHtml = '';
    let _classHtml = '';
    let _classCss = '';

    const UnicodeObj = this.svgBuilder.svgUnicodeObj;
    const { fontName, dist, demoUnicodeHTML, demoFontClassHTML } = this.svgBuilder.options;
    for (const i in UnicodeObj) {
      const _code = UnicodeObj[i];
      const _num = Number(_code.replace('&#', '').replace(';', '')).toString(16);

      if (!isString(_code)) continue;
      _codeHtml += `<li><p class="m-icon_ctn" title="${i}"><em class="u-iconfont">${_code}</em></p><p>${i}： ${_code.replace(
        '&',
        '&amp;'
      )}</p></li>`;
      _classHtml += `<li><p class="m-icon_ctn" title="${i}"><em class="u-iconfont icon-${i}"></em></p><p>${i}： .icon-${i}</p></li>`;
      _classCss += `\r\n.icon-${i}:before { content: "\\${_num}"; }`;
    }

    const _DEMO_UNICODE_CSS = demoUnicodeHTML.replace(extname(demoUnicodeHTML), '.css');
    const _DEMO_FONT_CLASS_CSS = demoFontClassHTML.replace(extname(demoFontClassHTML), '.css');

    const _CSS = DEMO_CSS.replace(DEMO_REGEXS.fontName, fontName);
    const _HTML = DEMO_HTML.replace(DEMO_REGEXS.fontName, fontName);
    const CODE_HTML = _HTML
      .replace(DEMO_REGEXS.CSS, _CSS)
      .replace(DEMO_REGEXS.HTML, _codeHtml)
      .replace(DEMO_REGEXS.CSSFile, _DEMO_UNICODE_CSS);
    const CLASS_HTML = _HTML
      .replace(DEMO_REGEXS.CSS, _CSS + _classCss)
      .replace(DEMO_REGEXS.HTML, _classHtml)
      .replace(DEMO_REGEXS.CSSFile, _DEMO_FONT_CLASS_CSS);

    const [writeUnicodeHTMLRes, writeFontClassHTMLRes] = await Promise.all([
      writeFile(join(dist, demoUnicodeHTML), CODE_HTML, true),
      writeFile(join(dist, _DEMO_UNICODE_CSS), _CSS, true),

      writeFile(join(dist, demoFontClassHTML), CLASS_HTML, true),
      writeFile(join(dist, _DEMO_FONT_CLASS_CSS), _CSS + _classCss, true),
    ]);
    if (writeUnicodeHTMLRes && writeFontClassHTMLRes) {
      global.__sf_debug &&
        console.log(`[success] ${demoUnicodeHTML}, ${demoFontClassHTML} successfully created!`);
      return SUCCESS_FlAG;
    }

    return FAIL_FlAG;
  }
}
