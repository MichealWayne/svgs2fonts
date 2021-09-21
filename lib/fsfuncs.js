/**
 * @author Micheal Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2021.09.19
 */
const fs = require('fs');
const mkdirp = require('mkdirp');
const { dirname } = require('path');
const OPTIONS = require('../options');

/**
 * @function mkdirpSync
 * @param {String} folderPath
 * @return {Promise}
 */
function mkdirpSync(folderPath) {
  mkdirp.sync(folderPath, err => {
    OPTIONS.logger.error(`Error!create director fail! path=${dirPath} errorMsg:${err}`);
    throw Error(err);
  });
}

/**
 * @function setFolderSync
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path
 * @param {String} notip: no tip log
 */
function setFolderSync(folderPath, noTip) {
  if (!fs.existsSync(folderPath)) {
    mkdirpSync(folderPath);
  } else if (!noTip) {
    OPTIONS.logger.log(`\r\n(${folderPath} folder existed.)`);
  }
}

/**
 * @function fsExistsSync
 * @description find folder or file
 * @param {String} path: folder or file path
 * @return {Boolean} if exist, true | false
 */
function fsExistsSync(folderPath) {
  try {
    fs.accessSync(folderPath, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @function setFile
 * @description find file, if not exist, build it
 * @param {String} filePath file path
 * @param {String} fileData file data
 * @param {Boolean} replaceBool replace original data or add
 * @return {Promise}
 */
function writeFile(filePath, fileData, replaceBool) {
  return new Promise((resolve, reject) => {
    const dirPath = dirname(filePath);
    setFolderSync(dirPath, true);

    if (!fileData) reject();
    if (fsExistsSync(filePath)) {
      const nowData = fs.readFileSync(filePath);

      fs.writeFileSync(filePath, replaceBool ? fileData : nowData + fileData);
    } else {
      fs.appendFileSync(filePath, fileData);
    }
    resolve();
  });
}

/**
 * @function setIconFile
 * @description set font icon file
 * @param {String} filePath
 * @param {String | Buffer} iconData
 * @param {String} iconType
 * @param {Boolean} debug
 * @return {Promise}
 */
function setIconFile(filePath, iconData, iconType = '', debug = false) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, iconData, err => {
      if (err) {
        OPTIONS.logger.error(err);
        reject(false);
      } else {
        debug &&
          OPTIONS.logger.log(
            `[success]${iconType} icon successfully created!(setIconFile, ${filePath})`
          );
        resolve(true);
      }
    });
  });
}

module.exports = {
  mkdirpSync,
  fsExistsSync,
  setFolderSync,
  writeFile,
  setIconFile,
};
