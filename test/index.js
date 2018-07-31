// test

const join = require('path').join;
const svgs2fonts = require('../index');


svgs2fonts.init({
    src: join(__dirname, 'svg'),
    dist: join(__dirname, 'dest'),
    fontName: 'myfont'
})