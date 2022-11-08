/**
 * @module DemoBuilder
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2022.03.20
 * @lastModified 2022.10.07
 */

import { join, extname } from 'path';

import { writeFile } from '../lib/fsUtils';
import { isString } from '../lib/utils';
import { SVGBuilder } from './SVGBuilder';
import { SUCCESS_FlAG, FAIL_FlAG, DEMO_CSS, DEMO_HTML } from '../constant';

export const fontNameReg = /\{\{fontName\}\}/g;
export const demoCssReg = /\{\{demoCss\}\}/g;
export const demoHtmlReg = /\{\{demoHtml\}\}/;
export const demoCssFileReg = /\{\{demoCssFile\}\}/;

export default class DemoBuilder {
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

    const _CSS = DEMO_CSS.replace(fontNameReg, fontName);
    const _HTML = DEMO_HTML.replace(fontNameReg, fontName);
    const CODE_HTML = _HTML
      .replace(demoCssReg, _CSS)
      .replace(demoHtmlReg, _codeHtml)
      .replace(demoCssFileReg, _DEMO_UNICODE_CSS);
    const CLASS_HTML = _HTML
      .replace(demoCssReg, _CSS + _classCss)
      .replace(demoHtmlReg, _classHtml)
      .replace(demoCssFileReg, _DEMO_FONT_CLASS_CSS);

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
    } else {
      return FAIL_FlAG;
    }
  }
}
