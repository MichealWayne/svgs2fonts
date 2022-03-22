/**
 * @module utils
 * @author Micheal Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2022.03.20
 */

import { SUCCESS_FlAG } from './constant';

/**
 * @function isSuccessResult
 * @param {unknown} res
 * @returns {Boolean}
 */
export function isSuccessResult(res: unknown) {
  return res === SUCCESS_FlAG;
}

/**
 * @function isString
 * @param {unknown} value
 * @return {Boolean}
 */
export function isString(value: unknown) {
  return typeof value === 'string';
}

/**
 * @function getIconStrUnicode
 * @param {String} iconName
 * @returns {Number}
 */
export function getIconStrUnicode(iconName: string, unicodeStart: number) {
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
