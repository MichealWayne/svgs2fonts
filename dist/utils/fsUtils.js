'use strict';
/**
 * @module FSFunctions
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2024.09.28
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.filterSvgFiles =
  exports.createIconFile =
  exports.writeFile =
  exports.fsExistsSync =
  exports.setFolderSync =
  exports.mkdirpSync =
    void 0;
const fs_1 = __importDefault(require('fs'));
const path_1 = require('path');
const mkdirp_1 = __importDefault(require('mkdirp'));
const constant_1 = require('../constant');
const utils_1 = require('./utils');
/**
 * @function mkdirpSync
 * @param {String} folderPath
 * @return {true | Error} if success, return true
 */
function mkdirpSync(folderPath) {
  try {
    mkdirp_1.default.sync(folderPath);
    return constant_1.SUCCESS_FLAG;
  } catch (err) {
    (0, utils_1.errorLog)(err);
    return err;
  }
}
exports.mkdirpSync = mkdirpSync;
/**
 * @function setFolderSync
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path
 */
function setFolderSync(folderPath) {
  if (!fs_1.default.existsSync(folderPath)) {
    return mkdirpSync(folderPath);
  }
  return constant_1.SUCCESS_FLAG;
}
exports.setFolderSync = setFolderSync;
/**
 * @function fsExistsSync
 * @description find folder or file
 * @param {String} path: folder or file path
 * @return {Boolean} if exist, true | false
 */
function fsExistsSync(folderPath) {
  try {
    fs_1.default.accessSync(folderPath, fs_1.default.constants.F_OK);
    return constant_1.SUCCESS_FLAG;
  } catch (err) {
    return constant_1.FAIL_FLAG;
  }
}
exports.fsExistsSync = fsExistsSync;
/**
 * @function writeFile
 * @description find file, if not exist, build it
 * @param {String} filePath file path
 * @param {String} fileData file data
 * @param {Boolean} replaceExisting replace original data or add
 * @return {Promise}
 */
function writeFile(filePath, fileData, replaceExisting) {
  return new Promise(resolve => {
    const dirPath = (0, path_1.dirname)(filePath);
    setFolderSync(dirPath);
    if (!fileData) {
      resolve(constant_1.FAIL_FLAG);
    }
    try {
      if (fsExistsSync(filePath)) {
        const nowData = fs_1.default.readFileSync(filePath);
        fs_1.default.writeFileSync(filePath, replaceExisting ? fileData : nowData + fileData);
      } else {
        fs_1.default.appendFileSync(filePath, fileData);
      }
    } catch (err) {
      (0, utils_1.errorLog)(err);
      resolve(constant_1.FAIL_FLAG);
    }
    resolve(constant_1.SUCCESS_FLAG);
  });
}
exports.writeFile = writeFile;
/**
 * @function createIconFile
 * @description set font icon file
 * @param {String} filePath
 * @param {String | Buffer} iconData
 * @param {String} iconType
 * @param {Boolean} debug
 * @return {Promise}
 */
async function createIconFile(filePath, iconData, iconType = '') {
  try {
    await fs_1.default.writeFileSync(filePath, iconData);
    (0, utils_1.log)(`[success] ${iconType} icon successfully created! (setIconFile, ${filePath})`);
    return constant_1.SUCCESS_FLAG;
  } catch (err) {
    (0, utils_1.errorLog)(err);
    return constant_1.FAIL_FLAG;
  }
}
exports.createIconFile = createIconFile;
/**
 * @function filterSvgFiles
 * @param {String} svgFolderPath svg folder path.
 * @return {Set<string>} svgs paths.
 */
function filterSvgFiles(svgFolderPath) {
  const svgSet = new Set();
  try {
    const files = fs_1.default.readdirSync(svgFolderPath, 'utf-8');
    files.forEach(file => {
      if ((0, utils_1.isString)(file) && (0, path_1.extname)(file) === '.svg') {
        svgSet.add((0, path_1.join)(svgFolderPath, file));
      }
    });
  } catch (err) {
    (0, utils_1.errorLog)(err);
  }
  return svgSet;
}
exports.filterSvgFiles = filterSvgFiles;
//# sourceMappingURL=fsUtils.js.map
