/**
 * @module configFile
 * @author Micheal Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2021.09.19
 */

import { IS_DEV } from './constant';
import { InitOptionsParams } from './types';

global.__sf_debug = IS_DEV === true;

const defaultOpts: InitOptionsParams = {
  debug: false,
  noDemo: true,
  fontName: 'iconfont',
  unicodeStart: 10000,
  src: '',
  dist: 'dist',
  demoUnicodeHTML: 'demo_unicode.html',
  demoFontClassHTML: 'demo_fontclass.html',
};

export default defaultOpts;
