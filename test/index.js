/**
 * @script test
 * @author Micheal Wayne<michealwayne@163.com>
 * @buildTime 2018.07.30
 * @lastModified 2021.09.19
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
  .catch(e => console.error('test failed', e));
