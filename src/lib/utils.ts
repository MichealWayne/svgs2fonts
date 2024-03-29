/**
 * @module utils
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2022.03.20
 */

import { SUCCESS_FlAG } from '../constant';

/**
 * @function isSuccessResult
 * @param {unknown} res
 * @returns {boolean}
 */
export function isSuccessResult(res?: unknown): boolean {
  return res === SUCCESS_FlAG;
}

/**
 * @function isString
 * @param {unknown} value
 * @return {boolean}
 */
export function isString(value?: unknown): boolean {
  return typeof value === 'string';
}

/**
 * @function getIconStrUnicode
 * @param {string} iconName
 * @param {number} unicodeStart
 * @returns {number}
 */
export function getIconStrUnicode(iconName: string, unicodeStart: number): number {
  if (!iconName) {
    return 0;
  }

  let _num = 1;
  for (let i = 0, len = iconName.length; i < len; i++) {
    _num *= iconName.charCodeAt(i);
  }

  while (_num > 59999) {
    _num = _num / 10;
  }
  if (_num < unicodeStart) _num += unicodeStart;
  _num = ~~_num;

  return _num;
}
