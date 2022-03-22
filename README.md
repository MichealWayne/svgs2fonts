# svgs2fonts

svg 图标转字体图标库（svgs -> svg,ttf,eot,woff,woff2）。[English readme](./README-en.md)

## 版本

2.0.0(beta-1)

## 安装

### 1.全局安装

```sh
npm i -g svgs2fonts
```

#### 验证

```sh
svgs2fonts -v
```

### 2.模块安装

```sh
npm i --save svgs2fonts
```

## 使用

### 方式 1——模块引入（支持 TypeScript）

```js
const Svgs2fonts = require('svgs2fonts');
Svgs2fonts.init(options);
```

其中 options 参数：

- src：`{String}`，svg 文件目录路径；
- dist：`{String}`，输出路径；
- fontName：`{String}`，输出图标/字体名称。可选，默认为`"iconfont"`；
- unicodeStart：`{Number}`，unicode 起始数字（需要避开正常 unicode 范围），`v2.0`之前为`startNumber`。可选，默认为`10000`；
- noDemo：`{Boolean}`，是否需要输出 html Demo 文件。可选，默认为`false`；
- debug：`{Boolean}`，是否开启 debug 模式以输出更多执行信息。可选，默认为`false`；
- ~~timeout~~（`v2.0废弃`）：`{Number}`，执行超时时间，默认为 60s（`60000`）
- demoUnicodeHTML：unicode类型的示例html名称。可选，默认为`demo_unicode.html`；
- demoFontClassHTML：fontClass类型的示例html名称。可选，默认为`demo_fontclass.html`；
- ~~logger~~（`v2.0废弃`）：`{Object}`，日志记录。

##### demo

```js
const Svgs2fonts = require('svgs2fonts');
const join = require('path').join;

Svgs2fonts
  .init({
    src: __dirname, // svg path
    dist: join(__dirname, 'dest'), // output path
    fontName: 'myIconfont', // font name
    noDemo: true, // no demo html files
    debug: true, // open debug
  })
  .then(() => console.log('task success!'))
  .catch(err => console.log(`task failed(${err})`));
```

### 方式 2——控制台

```sh
svgs2fonts {{srcpath}} {{distpath}} {{options}}
```

其中参数：

- srcpath: svg 源文件路径（相对当前窗口环境），传""时为当前窗口路径;
- distpath: 导出路径，默认在源文件路径下;
- options: 配置参数，见下文

##### example

```sh
svgs2fonts svg dist
```

options 配置参数

#### `-n` / `--name`

图标库的名字(default: `"iconfont"`).

##### example

```sh
svgs2fonts svg dist -n myiconfont
```

#### `--number`

unicode 起始编码(default: `10000`).

##### example

```
svgs2fonts svg dist --number 50000
```

#### `--nodemo`

不要 demo html(default: `false`).

##### example

```
svgs2fonts svg dist --nodemo
```

#### `--debug`

是否开启 debug 模式(default: `false`).

##### example

```
svgs2fonts svg dist --debug
```

## Author

[Micheal Wayne](mailto:michealwayne@163.com)

> [引导文章-《svg、ttf、woff、woff2 图标的研究及转换（svgs2fonts）》](http://blog.michealwayne.cn/2018/07/26/notes/%E3%80%90%E7%AC%94%E8%AE%B0%E3%80%91%E7%94%B1iconfont%E5%BC%95%E8%B5%B7%E7%9A%84svg%E3%80%81ttf%E3%80%81woff%E3%80%81woff2%E5%9B%BE%E6%A0%87%E7%9A%84%E7%A0%94%E7%A9%B6%E5%8F%8A%E5%85%B6%E8%BD%AC%E6%8D%A2/)

## Build time

2018.08.26

## Last modified

2022.03.20: v2 support for ts;
2021.12.16: fix IE8 bug;
