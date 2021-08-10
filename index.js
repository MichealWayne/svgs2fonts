/**
 * svgs2fonts
 * @author: Micheal Wayne
 * @build time: 2018.07.30
 * @version: 1.0.5
 * @email: michealwayne@163.com
 */

const mkdirp = require('mkdirp');
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
      options.dist = options.dist || OPTIONS.dist;
      options.src = options.src || '';

      const { noDemo, dist, debug } = options;
      if (debug) {
        OPTIONS.logger = console;
        OPTIONS.logger.time(timeTag);
      }
      Builder.init(options);

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

      // mkdir output folder
      mkdirp.sync(dist, err => {
        OPTIONS.logger.error('mkdirp failed.', err);
        reject(err);
      });

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
