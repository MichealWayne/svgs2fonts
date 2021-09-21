/**
 * @module utils
 * @author Micheal Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 */

/**
 * @function isString
 * @param {any} value
 * @return {Boolean}
 */
function isString(value) {
  return typeof value === 'string';
}

module.exports = {
  isString,
};
