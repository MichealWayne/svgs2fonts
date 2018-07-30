/*
 * svgs2fonts
 * @author: Micheal Wayne
 * @build time: 2018.07.30
 * @version: 1.0.0
 * @email: michealwayne@163.com
 */

const join = require('path').join;
const Fsfuncs = require('./fsfuncs');
const Builder = require('./svgs2fonts');
const OPTIONS = require('./options');
let DEMO_CSS = OPTIONS.DEMO_CSS;
let DEMO_HTML = OPTIONS.DEMO_HTML;
let dirname = process.cwd() || __dirname;

module.exports = {
    init (options) {
        options.dist = join(dirname, options.dist || OPTIONS.dist);
        options.src = join(dirname, options.src || '');

        Builder.init(options);
        let nodemo = options.nodemo;
        let fontName = options.fontName;
        let dist = options.dist;
        Fsfuncs.setFolder(dist);

        Builder.svg(function () {
            Builder.ttf(function () {
                Builder.eot();
                Builder.woff();
                Builder.woff2();

                if (!nodemo) {
                    let _codehtml = '',
                        _classhtml = '',
                        _classcss = '';

                    for (let i in Builder.UnicodeObj) {
                        let _code = Builder.UnicodeObj[i];
                        let _num = Number(_code.replace('&#', '').replace(';', '')).toString(16);

                        if (typeof _code !== 'string') continue;
                        _codehtml += `<li><em class="u-iconfont">${_code}</em><p>${i}： ${_code}</p></li>`;
                        _classhtml += `<li><em class="u-iconfont icon-${i}"></em><p>${i}： .icon-${i}</p></li>`;
                        _classcss += `\r\n.icon-${i}:before { content: "\\${_num}"; }`
                    }

                    DEMO_CSS = DEMO_CSS.replace(/\{\{fontName\}\}/g, fontName || OPTIONS.fontName);
                    DEMO_HTML = DEMO_HTML.replace(/\{\{fontName\}\}/g, fontName || OPTIONS.fontName);
                    let CODE_HTML = DEMO_HTML.replace('\{\{democss\}\}', DEMO_CSS).replace('\{\{demohtml\}\}', _codehtml);
                    let CLASS_HTML = DEMO_HTML.replace('\{\{democss\}\}', DEMO_CSS + _classcss).replace('\{\{demohtml\}\}', _classhtml);

                    Fsfuncs.setFile(dist + '/demo_unicode.html', CODE_HTML, () => {
                        CODE_HTML = null;
                        console.log(`[success] demo_unicode.html successfully created!${dist + '/demo_unicode.html'}`);

                        if (!CODE_HTML && !CLASS_HTML) console.log('task success!');
                    }, true);
                    Fsfuncs.setFile(dist + '/demo_fontclass.html', CLASS_HTML, () => {
                        CLASS_HTML = null;
                        console.log(`[success] demo_fontclass.html successfully created!${dist + '/demo_fontclass.html'}`);

                        if (!CODE_HTML && !CLASS_HTML) console.log('task success!');
                    }, true);
                }
            })
        });
    }
}