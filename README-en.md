# svgs2fonts

svg 图标转字体图标库（svgs fonts -> svg,ttf,eot,woff,woff2）。
[github（中文）](https://github.com/MichealWayne/svgs2fonts)

## Version

2.0.0

## Install

### 1.global install

```sh
npm i -g svgs2fonts
```

#### check

```sh
svgs2fonts -v
```

### 2.module install

```sh
npm i --save svgs2fonts
```

## Usage

### 1. module import

```js
const Svgs2fonts = require('svgs2fonts');
Svgs2fonts.init(options);
```

`options`:

- src: `{String}`, svg file dirname;
- dir: `{String}`, output files path;
- fontName: `{String}`, output icon/font name. Default:`"iconfont"`;
- startNumber: `{Number}`, unicode start number. Default: `10000`；
- noDemo: `{Boolean}`, whether to create demo HTML. Default: `false`;
- ~~debug~~(`v2.1 abandoned`): `{Boolean}`, whether to open debug model. Default: `false`;
- ~~timeout~~（`v2.0 abandoned`）: `{Number}`, run timeout. Default: 60s（`60000`）

##### demo

```js
const svgs2fonts = require('svgs2fonts');
const join = require('path').join;

svgs2fonts
  .init({
    src: __dirname, // svg path
    dist: join(__dirname, 'dest'), // output path
    fontName: 'myIconfont', // font name
    startNumber: 20000, // unicode start number
    noDemo: true, // no demo html files
  })
  .then(() => console.log('task success!'))
  .catch(err => console.log(`task failed(${err})`));
```

### 2.cmd

```sh
svgs2fonts {{srcpath}} {{distpath}} {{options}}
```

- srcpath: svg file dirname, "" -> now dirname path;
- distpath: output files path;
- options: configurations.

##### example

```sh
svgs2fonts svg dist
```

`options`:

#### `-n` / `--name`

font icon's name(default: iconfont).

##### example

```sh
svgs2fonts svg dist -n myiconfont
```

#### `--number`

unicode start number(default: 10000).

##### example

```sh
svgs2fonts svg dist --number 50000
```

#### `--nodemo`

no demo html.

##### example

```sh
svgs2fonts svg dist --nodemo
```

##### example

```sh
svgs2fonts svg dist
```

## Project build

install dependencies：

```
npm i
```

build：

```
npm run build
```

unit test：

```
npm run test
```

demo test：

```
npm run test:example
```

## Author

[Micheal Wayne](mailto:michealwayne@163.com)

## Build time

2018.08.26

## Last modified

- 2024.09.28: `v2.1.0` change log and remove debug;
- 2023.06.03: `v2.0.2` optimal variable control;
- 2022.11.03: `v2.0.1` split css & support svg size options;
- 2022.10.07: code bug fixed;
- 2022.03.30: v2 support for ts;
- 2021.12.16: fix IE8 bug;
