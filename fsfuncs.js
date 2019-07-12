const fs = require('fs');
const path = require('path');

/**
 * @function mkdirsSync
 * @description make folder(sync)
 * @param {String} dirpath 要创建的目录,支持多层级创建
 * @param {String} mode 创建文件夹的模式
 */
function mkdirsSync(dirpath, mode) {
    try {
        if (!fs.existsSync(dirpath)) {
            let pathtmp;
            dirpath.split(/[/\\]/).forEach(function(dirname) { // 这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services和windows的 d:\temp\aaaa
                if (pathtmp) {
                    pathtmp = path.join(pathtmp, dirname);
                } else {
                    pathtmp = dirname;
                }
                if (!fs.existsSync(pathtmp)) {
                    if (!fs.mkdirSync(pathtmp, mode)) {
                        return false;
                    }
                }
            });
        }
        return true;
    } catch (e) {
        console.log("Error!create director fail! path=" + dirpath + " errorMsg:" + e);
        return false;
    }
}


/**
 * @function setFolder
 * @description find folder, if not exist, build it
 * @param {String} folderPath: folder path;
 * @param {String} notip: no tip log;
 */
function setFolder(folderPath, notip) {
    if (!fs.existsSync(folderPath)) {
        mkdirsSync(folderPath);
    } else {
        if (!notip) console.log(`\r\n(${folderPath} folder existed.)`);
    }
}

/**
 * @function fsExistsSync
 * @description find folder or file
 * @param {String} path: folder or file path;
 * @return {Boolean}: if exist, true || false;
 */
function fsExistsSync(folderPath) {
    try {
        fs.accessSync(folderPath, fs.F_OK);
    } catch (e) {
        return false;
    }

    return true;
}

/**
 * @function setFile
 * @description find file, if not exist, build it
 * @param {String} filePath file path
 * @param {String} filedata file data
 * @param {Function} cb callback funciton
 * @param {Boolean} replacebool replace original data or add
 */
function setFile(filePath, filedata, cb, replacebool) {
    let dirpath = path.dirname(filePath);

    setFolder(dirpath);

    if (!filedata) return;
    if (fsExistsSync(filePath)) { // already has file
        fs.readFile(filePath, {
            encoding: 'utf8'
        }, function(err, data) {
            if (err) {
                console.log(err);
                return false;
            }

            let _data = data && !replacebool ? (data.indexOf(filedata) > -1 ? data : data + filedata) : filedata;

            fs.writeFile(filePath, _data, {
                encoding: 'utf8'
            }, (err) => {
                if (err) {
                    console.log(err);
                    return false;
                }

                if (cb) cb();
            });
        });
    } else { // new file
        fs.appendFile(filePath, filedata, {
            encoding: 'utf8'
        }, (err) => {
            if (err) {
                console.log(err);
                return false;
            }

            if (cb) cb();
        });
    }
}


module.exports = {
    mkdirsSync,
    fsExistsSync,
    setFolder,
    setFile
};