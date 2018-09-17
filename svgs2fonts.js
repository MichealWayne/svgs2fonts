/**
 * svgs2fonts
 * @author: Micheal Wayne
 * @build time: 2018.07.30
 * @version: 1.0.4
 * @email: michealwayne@163.com
 */
const fs = require('fs');
const path = require('path');
const join = path.join;
const SVGIcons2SVGFont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const ttf2eot = require('ttf2eot');
let OPTIONS = require('./options'); // config
let number = OPTIONS.unicodeStart; // 编码值起点，避免覆盖，随意
let UnicodeObj = {}; // demo html中unicode的值

/**
 * get icon unicode
 * @return {Array} unicode array
 */
function getIconUnicode(name) {
	if (!name) return false;
	//number++;
	
	let _num = 1;
	for (let i = 0; i < name.length; i++) {
		_num *= name.charCodeAt(i);
	}
	
	while (_num > 59999) {
		_num = _num / 10;
	}
	if (_num < number) _num += number;
	_num = parseInt(_num)
	//console.log(_num)

    UnicodeObj[name] = '&#' + _num + ';'
    return [String.fromCharCode(+_num)];
}

/**
 * filter svg files
 * @param {String} svgFolderPath svg folder path.
 * @return {Array} svgs paths.
 */
function filterSvgFiles(svgFolderPath) {
    let files = fs.readdirSync(svgFolderPath, 'utf-8');
    let svgArr = [];
    if (!files) {
        throw new Error(`Error! Svg folder is empty.${svgFolderPath}`);
    }

    for (let i in files) {
        if (typeof files[i] !== 'string' || path.extname(files[i]) !== '.svg') continue;
        if (!~svgArr.indexOf(files[i])) svgArr.push(join(svgFolderPath, files[i]));
    }
    return svgArr;
}

/**
 * task builder
 */
const Builder = {
    files: null,
    UnicodeObj: null,

    /**
     * build svg font
     * @param {Function} cb callback function.
     */
    svg: cb => {
        /**
         * write font stream
	 * @param {String} svgPath svg path.
         */
        function writeFontStream (svgPath) {
          let _name = path.basename(svgPath).split('.')[0];

          const glyph = fs.createReadStream(svgPath);
          glyph.metadata = {
            unicode: getIconUnicode(_name),
            name: _name
          };

          fontStream.write(glyph);
        }

        // init
        const fontStream = new SVGIcons2SVGFont({
            fontName: OPTIONS.fontName
        });

        // Setting the font destination
        const DIST_PATH = join(OPTIONS.dist, OPTIONS.fontName + '.svg');
        console.log(DIST_PATH)
        fontStream.pipe(fs.createWriteStream(DIST_PATH))
          .on('finish',function() {
            console.log(`[success]SvgFont successfully created!(${DIST_PATH})`);

            Builder.UnicodeObj = UnicodeObj;
            if (cb) cb();
          })
          .on('error',function(err) {
            console.log(err);
          });

        this.svgArr.forEach(svg => {
          if (typeof svg !== 'string') return false;
          writeFontStream(svg)
        });

        // Do not forget to end the stream
        fontStream.end();
    },

    /**
     * build ttf font
     * @param {Function} cb callback function.
     */
    ttf: cb => {
        const DIST_PATH = join(OPTIONS.dist, OPTIONS.fontName + '.ttf');     // 输出地址

        let ttf = svg2ttf(fs.readFileSync(join(OPTIONS.dist, OPTIONS.fontName + '.svg'), 'utf8'), {});
        ttf = this.ttf = new Buffer(ttf.buffer);
        fs.writeFile(DIST_PATH, ttf, (err, data) => {
            if (err) {
                console.log(err);
                return false;
            }

            console.log(`[success]Ttf icon successfully created!(${DIST_PATH})`);
            if (cb) cb();
        });
    },

    /**
     * build eot font
     * @param {Function} cb callback function.
     */
    eot: cb => {
        const DIST_PATH = join(OPTIONS.dist, OPTIONS.fontName + '.eot');     // 输出地址

        let eot = new Buffer(ttf2eot(this.ttf).buffer);

        fs.writeFile(DIST_PATH, eot, (err, data) => {
            if (err) {
                console.log(err);
                return false;
            }

            console.log(`[success]Eot icon successfully created!(${DIST_PATH})`);

            if (cb) cb();
        });
    },

    /**
     * build woff font
     * @param {Function} cb callback function.
     */
    woff: cb => {
        const DIST_PATH = join(OPTIONS.dist, OPTIONS.fontName + '.woff');     // 输出地址

        let woff = new Buffer(ttf2woff(this.ttf).buffer);

        fs.writeFile(DIST_PATH, woff, (err, data) => {
            if (err) {
                console.log(err);
                return false;
            }

            console.log(`[success]Woff icon successfully created!(${DIST_PATH})`);

            if (cb) cb();
        });
    },

    /**
     * build woff2 font
     * @param {Function} cb callback function.
     */
    woff2: cb => {
        const DIST_PATH = join(OPTIONS.dist, OPTIONS.fontName + '.woff2');     // 输出地址

        let woff2 = new Buffer(ttf2woff2(this.ttf).buffer);

        fs.writeFile(DIST_PATH, woff2, (err, data) => {
            if (err) {
                console.log(err);
                return false;
            }

            console.log(`[success]Woff2 icon successfully created!(${DIST_PATH})`);

            if (cb) cb();
        });
    },

    /**
     * init
     * @param {Object} options set options
     */
    init: ({
        fontName,
        src,
        dist,
        startNumber
    } = options) => {
        if (fontName) OPTIONS.fontName = fontName;
        if (src) OPTIONS.src = src;
        if (dist) OPTIONS.dist = dist;
        if (startNumber) number = parseInt(startNumber);

        this.svgArr = filterSvgFiles(OPTIONS.src);
    }
};


module.exports = Builder;