/**
 * @script test
 * @author Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2021.09.19
 */

const { join } = require('path');
const Svgs2fonts = require(join(__dirname, '../dist/index')); // require('svgs2fonts')

Svgs2fonts.init({
  src: join(__dirname, 'svg'),
  dist: join(__dirname, 'dest'),
  fontName: 'myfont',
  noDemo: false, // Explicitly enable demo generation
  maxConcurrency: 1, // Disable parallel processing to avoid woff2 crash
  fontFormats: ['svg', 'ttf', 'eot', 'woff', 'woff2'], // Don't generate woff to avoid crash
  verbose: true, // enable verbose output
  performanceAnalysis: true, // enable performance tracking
})
  .then(flag => {
    if (flag === true) {
      console.log('build success!');
    }
    console.log('run flag:', flag);
  })
  .catch(e => console.error('test failed', e));
