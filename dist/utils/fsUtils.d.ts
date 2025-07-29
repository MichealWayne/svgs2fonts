/**
 * @module FSFunctions
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2024.09.28
 */
/// <reference types="node" />
/**
 * @function mkdirpSync
 * @param {String} folderPath
 * @return {true | Error} if success, return true
 */
export declare function mkdirpSync(folderPath: string): true | Error;
/**
 * @function setFolderSync
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path
 */
export declare function setFolderSync(folderPath: string): boolean | Error;
/**
 * @function fsExistsSync
 * @description find folder or file
 * @param {String} path: folder or file path
 * @return {Boolean} if exist, true | false
 */
export declare function fsExistsSync(folderPath: string): boolean;
/**
 * @function writeFile
 * @description find file, if not exist, build it
 * @param {String} filePath file path
 * @param {String} fileData file data
 * @param {Boolean} replaceExisting replace original data or add
 * @return {Promise}
 */
export declare function writeFile(
  filePath: string,
  fileData: string,
  replaceExisting?: boolean
): Promise<boolean>;
/**
 * @function createIconFile
 * @description set font icon file
 * @param {String} filePath
 * @param {String | Buffer} iconData
 * @param {String} iconType
 * @param {Boolean} debug
 * @return {Promise}
 */
export declare function createIconFile(
  filePath: string,
  iconData: string | Buffer,
  iconType?: string
): Promise<boolean>;
/**
 * @function filterSvgFiles
 * @param {String} svgFolderPath svg folder path.
 * @return {Set<string>} svgs paths.
 */
export declare function filterSvgFiles(svgFolderPath: string): Set<string>;
//# sourceMappingURL=fsUtils.d.ts.map
