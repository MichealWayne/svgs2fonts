/**
 * svgs2fonts
 * @author Micheal Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2021.09.19
 * @version 1.1.0
 */

const Builder = require('./lib/Builder');
const OPTIONS = require('./options');
const { timeTag } = require('./constant');

module.exports = {
  /**
   * @function init
   * @param {Object} options
   */
  init(options) {
    return new Promise((resolve, reject) => {
      // init options
      options.dist = options.dist || OPTIONS.dist;
      options.src = options.src || '';

      const { noDemo, debug } = options;
      if (debug) {
        OPTIONS.logger = console;
        OPTIONS.logger.time(timeTag);
      }
      Builder.init(options);

      // init timer
      const _timer = setTimeout(() => {
        OPTIONS.logger.error('[failed] timeout');
        reject(new Error('timeout'));
      }, options.timeout || OPTIONS.timeout);
      const _successFunc = () => {
        clearTimeout(_timer);
        OPTIONS.logger.timeEnd(timeTag);
        resolve(true);
      };
      const _failFunc = e => {
        clearTimeout(_timer);
        OPTIONS.logger.timeEnd(timeTag);
        reject(e);
      };

      /**
       * first build icon svgs first,
       * then use svg -> ttf font,
       * last use ttf -> eot/woff/woff2 fonts
       */
      return Builder.svg()
        .then(() => {
          OPTIONS.logger.log('[success] svg builded.');
          Builder.ttf()
            .then(() =>
              Promise.all([Builder.eot(), Builder.woff(), Builder.woff2()])
                .then(() => {
                  if (!noDemo) {
                    Builder.demo().then(_successFunc).catch(_failFunc);
                  } else {
                    _successFunc();
                  }
                })
                .catch(_failFunc)
            )
            .catch(_failFunc);
        })
        .catch(_failFunc);
    });
  },
};
