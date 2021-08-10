#!/usr/bin/env node

'use strict';
const argv = require('minimist')(process.argv.slice(2));
const { join } = require('path');
const svgs2fonts = require('../index');
const dirname = process.cwd();

const Config = {
  version: require('../package.json').version,
  time: '2018.07.30',
};

// version
if (argv.v || argv.version) {
  console.log(`v${Config.version}`);
} else if (argv._ && argv._.length) {
  // typical init
  const _src = argv._[0];
  const _dist = argv._[1] || _src;

  svgs2fonts.init({
    src: join(dirname, _src),
    dist: join(dirname, _dist),
    fontName: argv.n || argv.name,
    startNumber: argv.number,
    noDemo: argv.nodemo,
    debug: argv.debug,
  });
} else {
  // help
  console.log(
    [
      'usage: svgs2fonts [src] [dist] [options]',
      '',
      'options:',
      '    -n   --name   iconfont name(default: iconfont.*)',
      '         --number unicode start code number',
      '         --nodemo no demo files',
    ].join('\n')
  );
  process.exit();
}
