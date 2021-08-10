/**
 * @author Micheal Wayne
 * @date 2018.07.30
 * @last EditTime: 2021-08-09
 */
const fs = require('fs');
const { join, dirname } = require('path');
const OPTIONS = require('../options');

/**
 * @function mkdirsSync
 * @description make folder(sync)
 * @param {String} dirPath
 * @param {String} mode
 */
function mkdirsSync(dirPath, mode) {
  try {
    if (!fs.existsSync(dirPath)) {
      let pathTemp;
      const dirs = dirPath.split(/[/\\]/);
      for (let i = 0, len = dirs.length; i < len; i++) {
        const dirName = dirs[i];
        pathTemp = pathTemp ? join(pathTemp, dirName) : dirName;
        if (!fs.existsSync(pathTemp) && !fs.mkdirSync(pathTemp, mode)) return false;
      }
    }
    return true;
  } catch (e) {
    OPTIONS.logger.log(`Error!create director fail! path=${dirPath} errorMsg:${e}`);
    return false;
  }
}

/**
 * @function setFolderSync
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path
 * @param {String} notip: no tip log
 */
function setFolderSync(folderPath, noTip) {
  if (!fs.existsSync(folderPath)) {
    mkdirsSync(folderPath);
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
  mkdirsSync,
  fsExistsSync,
  setFolderSync,
  writeFile,
  setIconFile,
};
