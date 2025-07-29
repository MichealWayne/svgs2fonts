# svgs2fonts

svg 图标转字体图标库（svgs -> svg,ttf,eot,woff,woff2）。[English readme](./README-en.md)

## 版本

2.2.0

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

其中 options 参数：

| 字段                | 类型       | 默认值                         | 描述                                                                                           |
| ------------------- | ---------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| src                 | `string`   | `-`                            | svg 图标文件的目录路径                                                                         |
| dist                | `string`   | `./dist`                       | 字体图标输出路径                                                                               |
| fontName            | `string`   | `iconfont`                     | 输出图标/字体名称                                                                              |
| unicodeStart        | `number`   | `10000`                        | unicode 起始数字（设置此指是需要避开正常 unicode 范围），（`v2.0`之前对应字段为`startNumber`） |
| noDemo              | `boolean`  | `false`                        | 是否需要输出 html Demo 文件                                                                    |
| verbose             | `boolean`  | `false`                        | 是否启用详细输出模式                                                                           |
| demoUnicodeHTML     | `string`   | `demo_unicode.html`            | unicode 类型的示例 html 名称                                                                   |
| demoFontClassHTML   | `string`   | `demo_fontclass.html`          | fontClass 类型的示例 html 名称                                                                 |
| batchMode           | `boolean`  | `false`                        | 是否启用批处理模式，用于处理多个 SVG 目录                                                      |
| inputDirectories    | `string[]` | `-`                            | 批处理模式下的输入目录列表                                                                     |
| batchSize           | `number`   | `3`                            | 批处理模式下的批次大小                                                                         |
| continueOnError     | `boolean`  | `false`                        | 批处理模式下，当一个目录处理失败时是否继续处理其他目录                                         |
| maxConcurrency      | `number`   | `4`                            | 最大并发处理数                                                                                 |
| enableCache         | `boolean`  | `true`                         | 是否启用缓存                                                                                   |
| fontFormats         | `string[]` | `['ttf','eot','woff','woff2']` | 要生成的字体格式列表                                                                           |
| progressCallback    | `function` | `-`                            | 进度回调函数                                                                                   |
| performanceAnalysis | `boolean`  | `false`                        | 是否启用性能分析                                                                               |

\*V2 废弃字段：

- ~~debug~~(`v2.1.0废弃`)：`${Boolean}`，是否开启 debug 模式以输出更多执行信息，已被 `verbose` 替代
- ~~timeout~~（`v2.0废弃`）：`{Number}`，执行超时时间，默认为 60s（`60000`）
- ~~logger~~（`v2.0废弃`）：`{Object}`，日志记录。

##### 基本示例

```js
import Svgs2fonts from 'svgs2fonts';
import { join } from 'path';

Svgs2fonts.init({
  src: __dirname, // svg path
  dist: join(__dirname, 'dest'), // output path
  fontName: 'myIconfont', // font name
  noDemo: false, // generate demo html files
  verbose: true, // enable verbose output
})
  .then(() => console.log('task success!'))
  .catch(err => console.log(`task failed(${err})`));
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

Svgs2fonts.init({
  // 启用批处理模式
  batchMode: true,

  // 指定输入目录列表
  inputDirectories,

  // 输出目录
  dist: join(__dirname, 'batch-output'),

  // 字体名称（将用于所有生成的字体）
  fontName: 'batch-icons',

  // 启用详细日志
  verbose: true,

  // 并行处理最大数量
  maxConcurrency: 4,

  // 批次大小
  batchSize: 3,

  // 一个目录处理失败时继续处理其他目录
  continueOnError: true,

  // 启用性能分析
  performanceAnalysis: true,
})
  .then(() => console.log('批处理任务成功完成!'))
  .catch(err => console.log(`批处理任务失败(${err})`));
```

##### 性能分析示例

```js
import Svgs2fonts from 'svgs2fonts';
import { join } from 'path';

Svgs2fonts.init({
  src: join(__dirname, 'svg'),
  dist: join(__dirname, 'output'),
  fontName: 'performance-icons',

  // 启用性能分析
  performanceAnalysis: true,

  // 启用详细输出
  verbose: true,

  // 设置并发数
  maxConcurrency: 8,

  // 启用缓存
  enableCache: true,

  // 进度回调
  progressCallback: progress => {
    console.log(`进度: ${progress.completed}/${progress.total} - ${progress.phase}`);
  },
})
  .then(() => console.log('性能分析任务成功完成!'))
  .catch(err => console.log(`性能分析任务失败(${err})`));
```

### 方式 2——控制台

```sh
svgs2fonts {srcpath} {distpath} {options}
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

并行处理的最大并发数。默认值为系统 CPU 核心数（最小 2，最大 8）。

##### example

```
svgs2fonts svg dist --concurrency=4
```

#### `--cache`

启用缓存以避免重新处理未更改的文件。默认为 true。

##### example

```
svgs2fonts svg dist --cache
```

#### `--cache-dir`

自定义缓存目录路径。默认为 `.svgs2fonts-cache`。

##### example

```
svgs2fonts svg dist --cache-dir=.mycache
```

#### `--stream`

启用流式处理以处理大型数据集。默认为 false。

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

批处理模式下并行处理的目录数量。默认为 10。

##### example

```
svgs2fonts --batch --input=icons1,icons2,icons3 --batch-size=5
```

#### `--output-pattern`

批处理模式下的输出路径模式。支持 `[name]` 和 `[fontname]` 占位符。默认为 `[name]/[fontname]`。

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

批处理模式下，是否保留目录结构。默认为 false。

##### example

```
svgs2fonts --batch --input=icons1,icons2 --preserve-structure
```

### 字体选项

#### `--formats`

要生成的字体格式（逗号分隔）。可选值：svg,ttf,eot,woff,woff2,variable。默认为所有格式。

##### example

```
svgs2fonts svg dist --formats=ttf,woff,woff2
```

#### `-o` / `--optimize`

启用字体优化。

##### example

```
svgs2fonts svg dist --optimize
```

#### `--compression-level`

WOFF2 压缩级别（1-11）。默认为 11（最高压缩）。

##### example

```
svgs2fonts svg dist --optimize --compression-level=9
```

#### `--subset`

启用字体子集化。

##### example

```
svgs2fonts svg dist --subset --include-glyphs=icon1,icon2,icon3
```

#### `--include-glyphs`

要包含的字形（逗号分隔）。

##### example

```
svgs2fonts svg dist --subset --include-glyphs=icon1,icon2,icon3
```

#### `--exclude-glyphs`

要排除的字形（逗号分隔）。

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

报告压缩统计信息。

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

## Build time

2025.07.27

## 更新日志

| 版本   | 日期       | 更新内容                                                     |
| ------ | ---------- | ------------------------------------------------------------ |
| v2.2.0 | 2025.07.27 | 清理冗余代码，移除未使用的index.d.ts类型声明文件，优化包结构 |
| v2.1.0 | 2024.09.28 | 移除 debug 参数，优化日志输出                                |
| v2.0.3 | 2023.12.16 | 增加防御性处理，提升稳定性                                   |
| v2.0.2 | 2023.06.03 | 优化变量控制，提升性能                                       |
| v2.0.1 | 2022.11.03 | 分离 CSS 样式，支持 SVG 尺寸选项                             |
| v2.0.0 | 2022.03.20 | TypeScript 重构，支持完整类型定义                            |
| v1.x   | 2021.12.16 | 修复 IE8 兼容性问题                                          |

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

该工具提供多种性能优化选项：

- **并发处理**: 通过 `maxConcurrency` 设置并行处理数量
- **缓存机制**: 通过 `enableCache` 启用缓存，避免重复处理
- **性能分析**: 通过 `performanceAnalysis` 获取详细的性能报告
- **进度监控**: 通过 `progressCallback` 实时监控处理进度

```js
Svgs2fonts.init({
  src: 'icons',
  dist: 'output',
  fontName: 'optimized-icons',
  maxConcurrency: 8,
  enableCache: true,
  performanceAnalysis: true,
  progressCallback: progress => {
    console.log(`${progress.phase}: ${progress.completed}/${progress.total}`);
  },
});
```
