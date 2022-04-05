#!/usr/bin/env node

'use strict';
const argv = require('minimist')(process.argv.slice(2));
const { join } = require('path');
const svgs2fonts = require('../dist/index');
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
  const _paramMap = {
    src: join(dirname, argv._[0]),
    dist: join(dirname, argv._[1] || argv._[0]),
    fontName: argv.n || argv.name,
    unicodeStart: argv.number,
    noDemo: argv.nodemo,
    debug: argv.debug,
  };
  const initOpts = {};
  for (const key in _paramMap) {
    if (_paramMap[key] !== undefined) {
      initOpts[key] = _paramMap[key];
    }
  }

  svgs2fonts.init(initOpts);
} else {
  // help
  console.log(
    [
      'usage: svgs2fonts [src] [dist] [options]',
      '',
      'options:',
      '    -n   --name   iconfont name(default: "iconfont")',
      '         --number unicode start code number',
      '         --nodemo no demo files',
      '         --debug  output debug log',
      '    -v   --version  output version',
    ].join('\n')
  );
  process.exit();
}
