/**
 * @module FSFunctions
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2024.09.28
 */

import fs from 'fs';
import { extname, join, dirname } from 'path';
import mkdirp from 'mkdirp';

import { FAIL_FLAG, SUCCESS_FLAG } from '../constant';
import { isString, errorLog, log } from './utils';

/**
 * @function mkdirpSync
 * @param {String} folderPath
 * @return {true | Error} if success, return true
 */
export function mkdirpSync(folderPath: string): true | Error {
  try {
    mkdirp.sync(folderPath);
    return SUCCESS_FLAG;
  } catch (err) {
    errorLog(err);
    return err as Error;
  }
}

/**
 * @function setFolderSync
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path
 */
export function setFolderSync(folderPath: string): boolean | Error {
  if (!fs.existsSync(folderPath)) {
    return mkdirpSync(folderPath);
  }
  return SUCCESS_FLAG;
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
    return SUCCESS_FLAG;
  } catch (err) {
    return FAIL_FLAG;
  }
}

/**
 * @function writeFile
 * @description find file, if not exist, build it
 * @param {String} filePath file path
 * @param {String} fileData file data
 * @param {Boolean} replaceExisting replace original data or add
 * @return {Promise}
 */
export function writeFile(
  filePath: string,
  fileData: string,
  replaceExisting?: boolean
): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    const dirPath = dirname(filePath);
    setFolderSync(dirPath);

    if (!fileData) {
      resolve(FAIL_FLAG);
    }
    try {
      if (fsExistsSync(filePath)) {
        const nowData = fs.readFileSync(filePath);

        fs.writeFileSync(filePath, replaceExisting ? fileData : nowData + fileData);
      } else {
        fs.appendFileSync(filePath, fileData);
      }
    } catch (err) {
      errorLog(err);
      resolve(FAIL_FLAG);
    }
    resolve(SUCCESS_FLAG);
  });
}

/**
 * @function createIconFile
 * @description set font icon file
 * @param {String} filePath
 * @param {String | Buffer} iconData
 * @param {String} iconType
 * @param {Boolean} debug
 * @return {Promise}
 */
export async function createIconFile(
  filePath: string,
  iconData: string | Buffer,
  iconType = ''
): Promise<boolean> {
  try {
    await fs.writeFileSync(filePath, iconData);
    log(`[success] ${iconType} icon successfully created! (setIconFile, ${filePath})`);
    return SUCCESS_FLAG;
  } catch (err) {
    errorLog(err);
    return FAIL_FLAG;
  }
}

/**
 * @function filterSvgFiles
 * @param {String} svgFolderPath svg folder path.
 * @return {Set<string>} svgs paths.
 */
export function filterSvgFiles(svgFolderPath: string): Set<string> {
  const svgSet: Set<string> = new Set();
  try {
    const files = fs.readdirSync(svgFolderPath, 'utf-8');

    files.forEach(file => {
      if (isString(file) && extname(file) === '.svg') {
        svgSet.add(join(svgFolderPath, file));
      }
    });
  } catch (err) {
    errorLog(err);
  }
  return svgSet;
}
