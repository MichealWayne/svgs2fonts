/**
 * @module FSFunctions
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2022.03.20
 */

import fs from 'fs';
import { extname, join, dirname } from 'path';
import mkdirp from 'mkdirp';
import { FAIL_FlAG, SUCCESS_FlAG } from '../constant';
import { isString } from './utils';

/**
 * @function mkdirpSync
 * @param {String} folderPath
 * @return {Promise}
 */
export function mkdirpSync(folderPath: string): boolean | Error {
  try {
    mkdirp.sync(folderPath);
    return true;
  } catch (err) {
    global.__sf_debug && console.error(err);
    return err as Error;
  }
}

/**
 * @function setFolderSync
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path
 */
export function setFolderSync(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    mkdirpSync(folderPath);
  }
}

/**
 * @function fsExistsSync
 * @description find folder or file
 * @param {String} path: folder or file path
 * @return {Boolean} if exist, true | false
 */
export function fsExistsSync(folderPath: string): boolean {
  try {
    fs.accessSync(folderPath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * @function writeFile
 * @description find file, if not exist, build it
 * @param {String} filePath file path
 * @param {String} fileData file data
 * @param {Boolean} replaceBool replace original data or add
 * @return {Promise}
 */
export function writeFile(
  filePath: string,
  fileData: string,
  replaceBool?: boolean
): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    const dirPath = dirname(filePath);
    setFolderSync(dirPath);

    if (!fileData) {
      resolve(FAIL_FlAG);
    }
    try {
      if (fsExistsSync(filePath)) {
        const nowData = fs.readFileSync(filePath);

        fs.writeFileSync(filePath, replaceBool ? fileData : nowData + fileData);
      } else {
        fs.appendFileSync(filePath, fileData);
      }
    } catch (err) {
      global.__sf_debug && console.error(err);
      resolve(FAIL_FlAG);
    }
    resolve(SUCCESS_FlAG);
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
export function setIconFile(
  filePath: string,
  iconData: string | Buffer,
  iconType = ''
): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    fs.writeFile(filePath, iconData, err => {
      if (err) {
        global.__sf_debug && console.error(err);
        resolve(FAIL_FlAG);
      } else {
        global.__sf_debug &&
          console.log(`[success]${iconType} icon successfully created!(setIconFile, ${filePath})`);
        resolve(SUCCESS_FlAG);
      }
    });
  });
}

/**
 * @function filterSvgFiles
 * @param {String} svgFolderPath svg folder path.
 * @return {Array} svgs paths.
 */
export function filterSvgFiles(svgFolderPath: string): string[] {
  const svgArr: string[] = [];
  try {
    const files = fs.readdirSync(svgFolderPath, 'utf-8');

    files.forEach(file => {
      if (isString(file) && extname(file) === '.svg' && !svgArr.includes(file)) {
        svgArr.push(join(svgFolderPath, file));
      }
    });
  } catch (err) {
    if (global.__sf_debug) {
      console.error(err);
    }
  }
  return svgArr;
}
