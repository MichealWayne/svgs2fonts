# svgs2fonts

svg 图标转字体图标库（svgs -> svg,ttf,eot,woff,woff2）。[English readme](./README-en.md)

## 版本

当前 npm 包版本：`2.3.0`

如需查看历史变更，建议以 Git tags / release 记录为准，而不是在 README 中手工维护完整变更表。

## 安装

### 1.全局安装(脚手架工具)

```sh
npm i -g svgs2fonts
```

#### 验证

```sh
svgs2fonts -v
```

### 2.模块依赖安装

```sh
npm i --save svgs2fonts
```

## 使用

### 方式 1——模块引入（支持 TypeScript）

```js
import Svgs2fonts from 'svgs2fonts';
// or
// const Svgs2fonts = require('svgs2fonts');

Svgs2fonts.init(options);
```

`init(options)` 当前返回 `Promise<true | Error>`。
成功时返回 `true`，失败时返回 `Error` 实例；调用方应显式判断结果，而不是只依赖 `.catch(...)`。

其中 options 参数：

| 字段                | 类型       | 默认值                               | 支持状态     | 描述                                                                                           |
| ------------------- | ---------- | ------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------- |
| src                 | `string`   | `-`                                  | 已支持       | 单目录模式下的 svg 图标目录                                                                    |
| dist                | `string`   | `./dist`                             | 已支持       | 字体图标输出路径                                                                               |
| fontName            | `string`   | `iconfont`                           | 已支持       | 输出图标/字体名称                                                                              |
| unicodeStart        | `number`   | `10000`                              | 已支持       | unicode 起始数字（设置此值时需要避开正常 unicode 范围），（`v2.0`之前对应字段为`startNumber`） |
| noDemo              | `boolean`  | `false`                              | 已支持       | 是否跳过 html Demo 文件                                                                        |
| verbose             | `boolean`  | `false`                              | 已支持       | 是否启用详细输出模式                                                                           |
| demoUnicodeHTML     | `string`   | `demo_unicode.html`                  | 已支持       | unicode 类型的示例 html 名称                                                                   |
| demoFontClassHTML   | `string`   | `demo_fontclass.html`                | 已支持       | fontClass 类型的示例 html 名称                                                                 |
| batchMode           | `boolean`  | `false`                              | 已支持       | 是否启用批处理模式，用于处理多个 SVG 目录                                                      |
| inputDirectories    | `string[]` | `-`                                  | 已支持       | 批处理模式下的输入目录列表                                                                     |
| batchSize           | `number`   | `3`                                  | 已支持       | 批处理模式下每批处理的目录数量                                                                 |
| continueOnError     | `boolean`  | `true`                               | 已支持       | 批处理模式下，当一个目录处理失败时是否继续处理其他目录                                         |
| fontFormats         | `string[]` | `['svg','ttf','eot','woff','woff2']` | 已支持       | 要生成的字体格式列表                                                                           |
| progressCallback    | `function` | `-`                                  | 已支持       | 进度回调函数                                                                                   |
| performanceAnalysis | `boolean`  | `false`                              | 已支持       | 是否启用性能分析                                                                               |
| maxConcurrency      | `number`   | `-`                                  | 实验性       | 参数已暴露，但当前版本不保证实际调度行为                                                      |
| enableCache         | `boolean`  | `true`                               | 实验性       | 参数已暴露，但缓存链路尚未完整落地                                                             |
| cacheDir            | `string`   | `-`                                  | 实验性       | 仅在未来缓存能力落地后生效                                                                     |
| streamProcessing    | `boolean`  | `false`                              | 实验性       | 参数已暴露，但流式处理尚未完整落地                                                             |
| outputPattern       | `string`   | `-`                                  | 已支持       | batch 输出模板，支持 `[name]` 与 `[fontname]`                                                  |
| preserveDirectoryStructure | `boolean` | `false`                         | 已支持       | batch 输出时保留输入目录的相对结构                                                             |
| optimization        | `object`   | `-`                                  | 实验性       | 优化参数目前仅完成解析，未形成完整执行闭环                                                     |
| subsetting          | `object`   | `-`                                  | 实验性       | 子集化参数目前仅完成解析，未形成完整执行闭环                                                   |

\*V2 废弃字段：

- ~~debug~~(`v2.1.0废弃`)：`${Boolean}`，是否开启 debug 模式以输出更多执行信息，已被 `verbose` 替代
- ~~timeout~~（`v2.0废弃`）：`{Number}`，执行超时时间，默认为 60s（`60000`）
- ~~logger~~（`v2.0废弃`）：`{Object}`，日志记录。

##### 基本示例

```js
import Svgs2fonts from 'svgs2fonts';
import { join } from 'path';

async function main() {
  const result = await Svgs2fonts.init({
    src: __dirname, // svg path
    dist: join(__dirname, 'dest'), // output path
    fontName: 'myIconfont', // font name
    noDemo: false, // generate demo html files
    verbose: true, // enable verbose output
  });

  if (result === true) {
    console.log('task success!');
  } else {
    console.log(`task failed(${result.message})`);
  }
}

main();
```

##### 批处理模式示例

```js
import Svgs2fonts from 'svgs2fonts';
import { join } from 'path';

// 定义多个输入目录
const inputDirectories = [
  join(__dirname, 'svg/icons'),
  join(__dirname, 'svg/arrows'),
  join(__dirname, 'svg/logos'),
];

async function main() {
  const result = await Svgs2fonts.init({
    // 启用批处理模式
    batchMode: true,

    // 指定输入目录列表
    inputDirectories,

    // 输出目录
    dist: join(__dirname, 'batch-output'),

    // 字体名称（将用于所有生成的字体）
    fontName: 'batch-icons',

    // 支持模板输出
    outputPattern: 'fonts/[name]-[fontname]',

    // 保留输入目录的相对结构
    preserveDirectoryStructure: true,

    // 批次大小
    batchSize: 3,

    // 一个目录处理失败时继续处理其他目录
    continueOnError: true,

    // 启用性能分析
    performanceAnalysis: true,
  });

  if (result === true) {
    console.log('批处理任务成功完成!');
  } else {
    console.log(`批处理任务失败(${result.message})`);
  }
}

main();
```

##### 性能分析示例（稳定能力）

```js
import Svgs2fonts from 'svgs2fonts';
import { join } from 'path';

async function main() {
  const result = await Svgs2fonts.init({
    src: join(__dirname, 'svg'),
    dist: join(__dirname, 'output'),
    fontName: 'performance-icons',

    // 启用性能分析
    performanceAnalysis: true,

    // 启用详细输出
    verbose: true,

    // 进度回调
    progressCallback: progress => {
      console.log(`进度: ${progress.completed}/${progress.total} - ${progress.phase}`);
    },
  });

  if (result === true) {
    console.log('性能分析任务成功完成!');
  } else {
    console.log(`性能分析任务失败(${result.message})`);
  }
}

main();
```

##### 实验性参数示例

以下参数当前会被接受，但不保证完整执行效果：`maxConcurrency`、`enableCache`、`cacheDir`、`streamProcessing`、`optimization`、`subsetting`。

```js
async function main() {
  const result = await Svgs2fonts.init({
    src: './icons',
    dist: './output',
    fontName: 'experimental-icons',
    maxConcurrency: 4,
    enableCache: true,
  });

  if (result !== true) {
    console.log(result.message);
  }
}

main();
```

### CLI/配置支持矩阵

| 能力 | CLI 参数 | 当前状态 | 说明 |
| ---- | -------- | -------- | ---- |
| 单目录生成 | `[src] [dist]` | 已支持 | 未传 `dist` 时默认输出到 `src` 目录 |
| batch 输入解析 | `--batch --input=dirA,dirB [dist]` | 已支持 | `--input` 使用逗号分隔 |
| 显式帮助 | `-h`, `--help` | 已支持 | 不依赖缺失位置参数触发 |
| 版本输出 | `-v`, `--version` | 已支持 | 直接输出版本号 |
| 字体格式控制 | `--formats=woff2,woff` | 已支持 | 当前文档约束为 `svg,ttf,eot,woff,woff2` |
| 详细日志 | `--verbose` | 已支持 | 输出配置和错误上下文 |
| 性能分析 | `--performance` | 已支持 | 完成后输出性能摘要 |
| 进度关闭 | `--no-progress` | 已支持 | 非 TTY 环境也不会执行终端光标控制 |
| 未知参数报错 | 任意未定义 flag | 已支持 | 返回非零退出码 |
| batch 输出模板 | `--output-pattern` | 已支持 | 支持 `[name]`、`[fontname]` 占位符 |
| 保留目录结构 | `--preserve-structure` | 已支持 | 会保留输入目录相对结构 |
| 缓存/流式/子集/优化 | `--cache` 等 | 实验性 | 当前只保证解析，不保证完整执行效果 |

说明：
模块 API 默认 `dist` 为 `./dist`。
CLI 中单目录模式未传 `dist` 时默认输出到 `src` 目录；batch 模式未传 `dist` 时默认输出到当前目录下的 `./dist`。

### 方式 2——控制台

```sh
svgs2fonts {srcpath} {distpath} {options}
```

其中参数：

- srcpath: 单目录模式下必填，表示 svg 源文件路径（相对当前窗口环境或绝对路径）；
- distpath: 可选。单目录模式下默认输出到源文件路径；batch 模式下默认输出到当前目录下的 `dist`；
- options: 配置参数，见下文

##### example

```sh
svgs2fonts svg dist
```

options 配置参数

### 基本选项

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

### 性能选项

#### `-c` / `--concurrency`

实验性参数。当前版本接受该参数，但不保证对实际调度产生稳定影响。

##### example

```
svgs2fonts svg dist --concurrency=4
```

#### `--cache`

实验性参数。当前版本接受该参数，但缓存链路尚未完整落地。

##### example

```
svgs2fonts svg dist --cache
```

#### `--cache-dir`

实验性参数。当前版本接受该参数，但缓存目录不会形成稳定对外契约。

##### example

```
svgs2fonts svg dist --cache-dir=.mycache
```

#### `--stream`

实验性参数。当前版本接受该参数，但流式处理尚未完整落地。

##### example

```
svgs2fonts svg dist --stream
```

### 批处理选项

#### `-b` / `--batch`

启用批处理模式，用于处理多个目录。

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3
```

#### `--input`

批处理模式下的输入目录（逗号分隔）。

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3
```

#### `--batch-size`

批处理模式下每批处理的目录数量。默认为 `3`。

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3 --batch-size=5
```

#### `--output-pattern`

batch 模式下的输出路径模板。支持 `[name]` 和 `[fontname]` 占位符。

##### example

```
svgs2fonts --batch --input=icons1,icons2 --output-pattern="[fontname]-[name]"
```

#### `--continue-on-error`

批处理模式下，当一个目录处理失败时是否继续处理其他目录。默认为 true。

##### example

```
svgs2fonts --batch --input=icons1,icons2 --continue-on-error
```

#### `--preserve-structure`

batch 模式下保留输入目录的相对结构。可与 `--output-pattern` 一起使用。

##### example

```
svgs2fonts --batch --input=icons1,icons2 --preserve-structure
```

### 字体选项

#### `--formats`

要生成的字体格式（逗号分隔）。当前稳定支持：`svg,ttf,eot,woff,woff2`。

##### example

```
svgs2fonts svg dist --formats=ttf,woff,woff2
```

#### `-o` / `--optimize`

实验性参数。当前版本接受该参数，但优化链路尚未完整落地。

##### example

```
svgs2fonts svg dist --optimize
```

#### `--compression-level`

实验性参数。仅在 `--optimize` 下解析，当前不保证形成稳定优化行为。

##### example

```
svgs2fonts svg dist --optimize --compression-level=9
```

#### `--subset`

实验性参数。当前版本接受该参数，但字形过滤尚未完整落地。

##### example

```
svgs2fonts svg dist --subset --include-glyphs=icon1,icon2,icon3
```

#### `--include-glyphs`

实验性参数。仅在 `--subset` 下解析，当前不保证形成稳定过滤行为。

##### example

```
svgs2fonts svg dist --subset --include-glyphs=icon1,icon2,icon3
```

#### `--exclude-glyphs`

实验性参数。仅在 `--subset` 下解析，当前不保证形成稳定过滤行为。

##### example

```
svgs2fonts svg dist --subset --exclude-glyphs=icon4,icon5
```

### 监控选项

#### `-V` / `--verbose`

启用详细输出。

##### example

```
svgs2fonts svg dist --verbose
```

#### `-p` / `--performance`

启用性能分析。

##### example

```
svgs2fonts svg dist --performance
```

#### `--no-progress`

禁用进度显示。

##### example

```
svgs2fonts svg dist --no-progress
```

#### `--report-compression`

实验性参数。仅在 `--optimize` 下解析，当前不保证输出完整压缩报告。

##### example

```
svgs2fonts svg dist --optimize --report-compression
```

### 完整示例

```
svgs2fonts svg dist -n myicons --formats=ttf,woff,woff2 --concurrency=4 --cache --verbose
```

## Project build

安装依赖：

```
npm i
```

构建：

```
npm run build
```

单测：

```
npm run test
```

demo 测试：

```
npm run test:example
```

## Author

[Micheal Wayne](mailto:michealwayne@163.com)

> [引导文章-《svg、ttf、woff、woff2 图标的研究及转换（svgs2fonts）》](http://blog.michealwayne.cn/2018/07/26/notes/%E3%80%90%E7%AC%94%E8%AE%B0%E3%80%91%E7%94%B1iconfont%E5%BC%95%E8%B5%B7%E7%9A%84svg%E3%80%81ttf%E3%80%81woff%E3%80%81woff2%E5%9B%BE%E6%A0%87%E7%9A%84%E7%A0%94%E7%A9%B6%E5%8F%8A%E5%85%B6%E8%BD%AC%E6%8D%A2/)

## 项目架构

### 核心模块

- **配置管理** (`src/config/`): 配置管理和向后兼容性处理
  - `ConfigurationManager.ts`: 配置验证和管理
  - `BackwardCompatibilityLayer.ts`: 向后兼容性支持
- **核心功能** (`src/core/`): 核心业务逻辑和编排
  - `ProgressMonitor.ts`: 进度监控
  - `PerformanceTracker.ts`: 性能跟踪和分析
- **处理器** (`src/processors/`): 处理流程编排
  - `SingleDirectoryProcessor.ts`: 单目录处理器
  - `BatchModeProcessor.ts`: 批处理模式处理器
- **构建器** (`src/builders/`): 字体生成核心模块
  - `SVGBuilder.ts`: SVG 图标转 SVG 字体
  - `FontsBuilder.ts`: SVG 字体转换为 TTF、EOT、WOFF、WOFF2 格式
  - `DemoBuilder.ts`: 生成 HTML 演示文件和 CSS 样式
- **工具库** (`src/utils/`): 文件系统操作、通用工具函数
- **类型定义** (`src/types/`): TypeScript 类型定义

### 构建流程

1. **输入**: SVG 图标文件集合
2. **配置处理**: ConfigurationManager 验证和标准化配置选项
3. **处理器选择**: 根据配置选择单目录或批处理模式处理器
4. **SVG 处理**: SVGBuilder 创建 SVG 字体文件
5. **字体生成**: FontsBuilder 并行生成 TTF、EOT、WOFF、WOFF2 格式
6. **演示生成**: DemoBuilder 生成演示 HTML 和 CSS 文件（可选）
7. **性能报告**: PerformanceTracker 输出性能分析结果（可选）

### 技术栈

- **语言**: TypeScript
- **依赖库**:
  - `svgicons2svgfont`: SVG 图标转 SVG 字体
  - `svg2ttf`: SVG 字体转 TTF
  - `ttf2eot`: TTF 转 EOT
  - `ttf2woff`: TTF 转 WOFF
  - `ttf2woff2`: TTF 转 WOFF2

## 兼容性

- **Node.js**: ≥ 12.0.0
- **浏览器**: 支持所有现代浏览器（IE9+）
- **字体格式**: 支持 EOT、TTF、WOFF、WOFF2 完整字体格式

## 版本说明

- 当前 README 对应包版本：`2.3.0`
- 历史变更请优先参考仓库的 Git tag / release 记录
- 若 README 内容与已发布包存在差异，以当前代码与 `package.json` 为准

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发环境搭建

```bash
# 克隆项目
git clone https://github.com/MichealWayne/svgs2fonts.git

# 安装依赖
npm install

# 启动开发模式
npm run test:example

# 运行测试
npm test

# 构建项目
npm run build
```

### 目录结构

```
svgs2fonts/
├── src/                    # 源码目录
│   ├── builders/          # 构建器模块
│   │   ├── SVGBuilder.ts  # SVG字体构建
│   │   ├── FontsBuilder.ts # 字体格式转换
│   │   └── DemoBuilder.ts  # 演示文件生成
│   ├── config/            # 配置管理
│   │   ├── ConfigurationManager.ts # 配置管理器
│   │   └── BackwardCompatibilityLayer.ts # 向后兼容性
│   ├── core/              # 核心功能
│   │   ├── ProgressMonitor.ts # 进度监控
│   │   └── PerformanceTracker.ts # 性能跟踪
│   ├── processors/        # 处理器
│   │   ├── SingleDirectoryProcessor.ts # 单目录处理
│   │   └── BatchModeProcessor.ts # 批处理模式
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── constant.ts        # 常量定义
│   ├── options.ts         # 配置选项
│   └── index.ts           # 入口文件
├── examples/              # 示例目录
├── __tests__/             # 测试文件
└── dist/                  # 构建输出
```

## 高级功能

### 批处理模式

批处理模式允许您同时处理多个 SVG 目录，并为每个目录生成单独的字体文件。这对于管理多个图标集非常有用。

```js
Svgs2fonts.init({
  batchMode: true,
  inputDirectories: ['icons/set1', 'icons/set2', 'icons/set3'],
  dist: 'output',
  fontName: 'icon-set',
  batchSize: 3,
  continueOnError: true,
});
```

### 性能优化

当前稳定可用的性能与监控能力主要有两类：

- **性能分析**: 通过 `performanceAnalysis` 获取详细的性能报告
- **进度监控**: 通过 `progressCallback` 实时监控处理进度

```js
async function main() {
  const result = await Svgs2fonts.init({
    src: 'icons',
    dist: 'output',
    fontName: 'monitored-icons',
    performanceAnalysis: true,
    progressCallback: progress => {
      console.log(`${progress.phase}: ${progress.completed}/${progress.total}`);
    },
  });

  if (result !== true) {
    console.log(result.message);
  }
}

main();
```

以下参数目前仍属于实验性能力，当前版本会接受它们，但不保证形成完整执行闭环：`maxConcurrency`、`enableCache`、`cacheDir`、`streamProcessing`、`optimization`、`subsetting`。
