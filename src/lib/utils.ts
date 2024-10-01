/**
 * @module utils
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2024.09.28
 */

import { IS_DEV, SUCCESS_FLAG } from '../constant';

/**
 * @function log
 * @description 开发环境下，打印日志
 * @param args
 */
export function log(...args: unknown[]): void {
  IS_DEV && console.log(...args);
}

/**
 * @function errorLog
 * @description 开发环境下，打印异常日志
 * @param args
 */
export function errorLog(...args: unknown[]): void {
  IS_DEV && console.error(...args);
}

/**
 * @function warnLog
 * @description 开发环境下，打印提示日志
 * @param args
 */
export function warnLog(...args: unknown[]): void {
  IS_DEV && console.warn(...args);
}

/**
 * @function isSuccessResult
 * @param {unknown} res
 * @returns {boolean}
 */
export function isSuccessResult(res?: unknown): res is true {
  return res === SUCCESS_FLAG;
}

/**
 * @function isString
 * @param {unknown} value
 * @return {boolean}
 */
export function isString(value?: unknown): value is string {
  return typeof value === 'string';
}

/**
 * @function getIconStrUnicode
 * @description 用于动态生成图标的Unicode编码，确保每个图标都有一个唯一的标识符。
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
