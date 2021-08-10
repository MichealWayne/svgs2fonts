/**
 * @module test
 * @Date: 2021-08-09 10:59:34
 * @LastEditTime: 2021-08-09 14:33:15
 */

const { join } = require('path');
const svgs2fonts = require('../index');

svgs2fonts
  .init({
    src: join(__dirname, 'svg'),
    dist: join(__dirname, 'dest'),
    fontName: 'myfont',
    debug: true,
    // timeout: 1,
  })
  .then(flag => {
    console.log('run flag:', flag);
  })
  .catch(e => console.error(e));
