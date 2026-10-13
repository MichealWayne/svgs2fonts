# svgs2fonts

把一个目录里的 SVG 图标转换成图标字体（woff2、woff、ttf、eot、svg），同时可生成项目 CSS、图标清单和预览页。支持 CLI、JavaScript 和 TypeScript。[English](./README-en.md)

不确定该用字体图标还是 SVG？先看[使用场景](#使用场景)。

运行要求：Node.js 16 及以上。版本变更见 [CHANGELOG](./CHANGELOG.md)。

**目录**：[使用场景](#使用场景) · [快速开始](#快速开始) · [常用命令](#常用命令) · [JavaScript / TypeScript API](#javascript--typescript-api) · [稳定编码](#稳定编码) · [配置参考](#配置参考) · [常见问题](#常见问题) · [更多文档](#更多文档)

## 使用场景

字体图标是把图标当作“文字”来使用：浏览器加载一个字体文件，再通过 CSS 类名显示对应字符。它和直接使用 SVG 各有取舍，下面帮助判断你的项目是否适合。

### 适合使用字体图标

- **单色图标，需要跟随文字变色、缩放**：图标继承所在元素的 `color` 和 `font-size`，悬停变色、主题切换、跟文字一起放大都只需要改 CSS，例如按钮、菜单、表格操作列、表单状态。
- **图标与文字混排**：图标像字符一样参与排版，和文字自然对齐在同一行。
- **多页面、多技术栈共用一套图标**：服务端渲染页面、传统多页网站、CMS 模板、jQuery 项目，或同时存在 Vue、React 等多个项目时，只需引入一个 CSS 文件，写一个类名即可使用，不依赖前端框架或打包工具。
- **一个页面用到大量图标**：所有图标在同一个字体文件里，一次请求、浏览器缓存后各页面复用。
- **只能写 CSS 的场景**：可以通过 `::before` 的 `content` 在纯 CSS 中插入图标，比如主题样式、第三方系统的样式覆盖。
- **已有项目在用字体图标**：例如原来从在线图标平台下载字体包，现在希望在仓库里用 SVG 源文件自行维护、自动构建，同时保持线上编码不变（见[已有项目迁移](#已有项目迁移)）。

### 不太适合，建议直接用 SVG

- **多色、渐变、描边图标**：字体只能表达单色的填充轮廓，这类图标转换后会失真。
- **页面只用到少量图标**：整个字体文件都要加载，直接内联几个 SVG 更轻量。本工具目前不支持按需裁剪字体。
- **需要对图标局部做动画或单独设置颜色**：字体中的图标是一个整体字符，无法控制其中某一部分。
- **使用 React、Vue 等组件化框架的新项目**：使用现成的 SVG 图标组件库通常更方便，打包时只会包含实际用到的图标。

### 使用字体图标时需要注意

- **字体加载前图标不可见**：网络慢或字体加载失败时，图标位置会显示空白或方框，重要操作建议同时提供文字。
- **用户可能强制使用自己的字体**：部分浏览器允许用户禁用网页字体（例如为了阅读障碍或个人习惯），这时图标会无法显示。
- **无障碍**：读屏软件可能把图标字符读出来。纯装饰图标加 `aria-hidden="true"`，可点击的图标由按钮等外层元素提供文字说明（见[快速开始](#4-预览并使用)中的示例）。

## 快速开始

### 1. 安装

```sh
npm install --save-dev svgs2fonts
```

### 2. 准备图标

把 SVG 文件直接放在一个目录中（**不会扫描子目录**）。文件名就是图标名，不能包含空格或控制字符：

```text
icons/
  home.svg
  arrow-left.svg
```

### 3. 生成字体

```sh
npx svgs2fonts ./icons ./fonts --name=myicons --formats=woff2,woff --css --manifest
```

第一个参数是图标目录，第二个是输出目录。

> **注意**：如果省略输出目录（如 `npx svgs2fonts ./icons`），文件会直接写入图标目录本身。建议始终显式指定输出目录。

生成结果：

```text
fonts/
  myicons.woff2           # 字体文件（按 --formats 生成）
  myicons.woff
  myicons.css             # 项目中引入的 CSS（--css）
  myicons.json            # 图标名与编码清单（--manifest）
  demo_fontclass.html     # 预览页（类名用法），可搜索、复制代码
  demo_fontclass.css
  demo_unicode.html       # 预览页（Unicode 用法）
  demo_unicode.css
```

### 4. 预览并使用

在浏览器中打开 `fonts/demo_fontclass.html` 检查图标效果。然后在页面中引入生成的 CSS：

```html
<link rel="stylesheet" href="./fonts/myicons.css" />

<!-- 纯装饰图标 -->
<span class="u-iconfont icon-home" aria-hidden="true"></span>

<!-- 可交互控件：由按钮本身提供可访问名称 -->
<button aria-label="返回主页">
  <span class="u-iconfont icon-home" aria-hidden="true"></span>
</button>
```

类名规则：基础类固定为 `u-iconfont`，图标类为 `icon-<文件名>`（如 `home.svg` → `icon-home`）。CSS 通过相对路径引用字体，部署时请保持 CSS 与字体文件在同一目录。

## 常用命令

| 场景                       | 命令                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 只生成生产文件，不要预览页 | `npx svgs2fonts ./icons ./fonts --formats=woff2 --nodemo --css --manifest`                                                |
| 图标增删后编码保持不变     | `npx svgs2fonts ./icons ./fonts --number=57344 --codepoint-map=codepoints.json --css --manifest`，见[稳定编码](#稳定编码) |
| 先检查输入、不写任何文件   | `npx svgs2fonts ./icons ./fonts --check`                                                                                  |
| CI 中获取机器可读结果      | `npx svgs2fonts ./icons ./fonts --nodemo --css --json`                                                                    |
| 多个图标目录批量生成       | `npx svgs2fonts --batch --input=./icons/ui,./icons/editor ./fonts --css --manifest`                                       |

说明：

- `--nodemo` 只关闭预览页，不影响 `--css`、`--manifest` 是否生成。
- `--check` 只做结构检查（配置、目录、明显的 SVG 问题、命名、编码映射、批处理输出冲突），不执行真正的字体转换，也不能保证视觉效果，最终仍需生成并查看预览页。
- `--json` 模式下 stdout 只输出一个 JSON 报告，日志写到 stderr；全部成功时退出码为 `0`，部分或全部失败时为 `1`。详见[自动化说明](./docs/automation.md)。

### 批处理

```sh
npx svgs2fonts --batch --input=./icons/ui,./icons/editor ./fonts --batch-size=3
```

- 每个输入目录生成一套独立字体，默认输出到 `./fonts/<输入目录名>/`，如 `./fonts/ui/`、`./fonts/editor/`。
- `--batch-size` 控制同时处理的目录数（默认 3）。
- 某个目录失败时默认继续处理其他目录；加 `--no-continue-on-error` 则在当前批次结束后停止。
- 输出路径重复或相互嵌套时，会在写入前直接报错。
- `--output-pattern=kits/[name]-[fontname]` 可自定义子目录名；`--preserve-structure` 保留输入目录间的相对层级。

## JavaScript / TypeScript API

推荐使用 `generate()`，它返回一个结构化报告，不会因为配置或转换错误而抛出异常：

```js
const { generate } = require('svgs2fonts');
// TypeScript / ESM：import { generate } from 'svgs2fonts';

async function main() {
  const report = await generate({
    src: './icons',
    dist: './fonts',
    fontName: 'myicons',
    fontFormats: ['woff2', 'woff'],
    noDemo: true,
    outputCss: true,
    outputManifest: true,
  });

  if (!report.success) {
    console.error(report.status, report.errors);
    process.exitCode = 1;
    return;
  }
  console.log(report.outputs); // 本次实际写入的文件
}

main();
```

报告中最常用的字段：

| 字段                  | 含义                                                           |
| --------------------- | -------------------------------------------------------------- |
| `success`             | 所有目录都成功时为 `true`                                      |
| `status`              | `success`、`partial`（批处理部分失败）或 `failed`              |
| `outputs`             | 本次实际写入的文件绝对路径                                     |
| `errors` / `warnings` | 每项包含稳定的 `code` 和 `message`，适用时附带文件、目录等信息 |
| `directories`         | 每个目录的明细：状态、图标数、编码、输出、耗时                 |

完整字段和错误码见[自动化说明](./docs/automation.md)。

其他导出：

- `check(options)`：与 `--check` 相同，只读检查，返回同样结构的报告。
- `migrateCodepoints(options)`：从已部署的字体导入编码，见[编码迁移指南](./docs/migration.md)。
- `init(options)`：旧版 API，返回 `Promise<true | Error>`，继续保留。注意：批处理部分失败时它仍返回 `true`（只打印警告），需要准确区分部分失败时请改用 `generate()`。

## 稳定编码

每个图标在字体中对应一个 Unicode 编码（码点）。如果你的代码里**直接写死了编码**（如 `&#xE001;`），就需要保证重新生成后编码不变。

### 默认行为

不做任何配置时，编码由图标名哈希得到，范围是 `--number`（默认 `10000`）到 `59999`：

- 名称没有冲突时，同名图标通常得到相同编码；但如果出现哈希冲突，结果会受图标顺序影响，**增删图标后编码可能改变**。
- 默认起点 `10000` 是为了兼容旧版本而保留的。这个范围包含中文等常规字符，可能与页面文字冲突。

### 新项目推荐

```sh
npx svgs2fonts ./icons ./fonts --number=57344 --codepoint-map=codepoints.json --css --manifest
```

- `--number=57344` 即 `U+E000`，Unicode 私用区起点，不会与常规文字冲突。
- `--codepoint-map=codepoints.json` 会在**输出目录**中维护映射文件（如 `fonts/codepoints.json`）。注意这里只能写文件名，不能写路径。
- 有了映射文件后：已有图标编码保持不变；新图标按名称顺序分配新编码；删除的图标编码会被保留，不会分给其他图标。
- **请把映射文件提交到版本库**。删除输出目录前务必先备份它。

映射文件还会记录每个 SVG 的内容哈希。之后执行 `check()` / `generate()` 时，报告中的 `changes` 会列出新增（`added`）、删除（`removed`）和内容变化（`changed`）的图标。内容哈希按原始字节计算，空格或注释改动也会计入，并不代表视觉变化。

### 已有项目迁移

已经上线的项目，请从**线上正在使用的字体或清单**导入编码，不要靠重新生成来“猜”旧编码：

```sh
# 1. 只读预览：读取线上字体，并与当前图标目录对比文件名
npx svgs2fonts --migrate=./deployed/iconfont.svg --migration-src=./icons

# 2. 核对无误后写出映射文件（路径相对当前目录；父目录须已存在，已有文件不会被覆盖）
mkdir -p ./fonts
npx svgs2fonts --migrate=./deployed/iconfont.svg --migration-output=./fonts/codepoints.json

# 3. 之后正常构建，映射文件名与上一步一致
npx svgs2fonts ./icons ./fonts --codepoint-map=codepoints.json --css --manifest
```

支持的来源（SVG 字体、JSON 清单）、API 用法与报错处理见[编码迁移指南](./docs/migration.md)。

## 配置参考

| API 参数                                          | CLI 参数                   | 默认值与说明                                                                           |
| ------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `src`                                             | 第 1 个位置参数            | 图标目录，单目录模式必填                                                               |
| `dist`                                            | 第 2 个位置参数            | API 默认 `./dist`；CLI 单目录默认等于 `src`（即写回图标目录）；CLI 批处理默认 `./dist` |
| `fontName`                                        | `--name`, `-n`             | `iconfont`；只能包含字母、数字、`-`、`_`                                               |
| `fontFormats`                                     | `--formats`                | `svg,ttf,eot,woff,woff2`；API 传数组，CLI 传逗号分隔列表                               |
| `unicodeStart`                                    | `--number`                 | `10000`；0–59998 的整数，不能落在代理区；新项目建议 `57344`                            |
| `noDemo`                                          | `--nodemo`                 | `false`；为 `true` 时不生成预览页                                                      |
| `outputCss`                                       | `--css`                    | `false`；生成 `<fontName>.css`                                                         |
| `outputManifest`                                  | `--manifest`               | `false`；生成 `<fontName>.json`                                                        |
| `codepointMap`                                    | `--codepoint-map`          | 不启用；输出目录中的 `.json` 文件名（不含路径）                                        |
| `codepoints`                                      | —                          | 可选，`{ 图标名: 编码 }` 形式的初始编码；与已有映射冲突时报错                          |
| `demoUnicodeHTML`                                 | —                          | `demo_unicode.html`                                                                    |
| `demoFontClassHTML`                               | —                          | `demo_fontclass.html`                                                                  |
| `batchMode`                                       | `--batch`, `-b`            | `false`                                                                                |
| `inputDirectories`                                | `--input`                  | 批处理必填；CLI 可用逗号分隔，或多次传入                                               |
| `batchSize`                                       | `--batch-size`             | `3`；同时处理的目录数                                                                  |
| `continueOnError`                                 | `--no-continue-on-error`   | `true`；某个目录失败后是否继续                                                         |
| `outputPattern`                                   | `--output-pattern`         | 批处理输出子目录模板，支持 `[name]`、`[fontname]`                                      |
| `preserveDirectoryStructure`                      | `--preserve-structure`     | `false`                                                                                |
| `verbose`                                         | `--verbose`, `-V`          | `false`；旧参数 `debug` / `--debug` 仍可用，但会提示已弃用                             |
| `progressCallback`                                | `--no-progress` 关闭进度条 | API 可传进度回调；回调抛错不会导致构建失败                                             |
| `performanceAnalysis`                             | `--performance`, `-p`      | `false`；输出各阶段耗时                                                                |
| `fontHeight` / `normalize` / `centerHorizontally` | —                          | `1000` / `true` / `true`                                                               |

CLI 专用：`--check`（只读检查）、`--json`（JSON 输出）、`--migrate` 系列参数（见迁移指南）、`--help`、`--version`。

**仅为兼容保留、尚未实现的参数**：`maxConcurrency`、`enableCache`、`cacheDir`、`streamProcessing`、`optimization`、`subsetting`、`fontMetrics`，以及对应的 CLI 参数 `--concurrency`、`--cache`、`--cache-dir`、`--stream`、`--optimize`、`--compression-level`、`--report-compression`、`--subset`、`--include-glyphs`、`--exclude-glyphs`。传入后不会生效，只会产生 `EXPERIMENTAL_OPTION_IGNORED` 警告。需要控制并发请使用 `batchSize`。

## 输出安全

- **失败不会破坏旧文件**：每个目录先在临时目录中生成，全部成功后才替换输出目录中本次请求的文件；输出目录里的其他文件（包括上次生成的其他格式）不会被删除。
- **防止并发写入**：同一输出目录同时只能有一个构建，冲突时返回 `OUTPUT_LOCKED`。
- **残留文件**：锁和临时目录位于输出目录的**父目录**，名称以 `.svgs2fonts-` 开头，正常结束会自动清理。如果进程被强制终止，请先确认没有构建在运行，再手动删除。
- **局限**：这不是系统级事务，进程崩溃或断电仍可能留下中间状态；批处理中各目录独立提交。

## 常见问题

**图标显示为方框或错位？**
先用预览页确认图标本身是否正常。只生成 `svg` 格式时，大多数现代浏览器无法显示，请至少包含 `woff2`。同时检查 CSS 与字体文件是否在同一目录。

**图标形状不对、描边丢失？**
字体只支持单色填充轮廓。描边（stroke）、渐变、多色需要先在设计工具中转为填充路径。

**文件名报错 `INVALID_ICON_NAME`？**
文件名不能包含空格或控制字符，请改为 `arrow-left.svg` 这样的形式。

**输出目录里多了 `demo_*.html`？**
这是预览页，加 `--nodemo` 可跳过。

**终端出现 `punycode` DeprecationWarning？**
这是较新 Node.js 版本对依赖包的提示，不影响生成结果。

**升级后编码变了？**
默认哈希分配在遇到名称冲突时可能与旧版本结果不同。依赖固定编码的项目请按[已有项目迁移](#已有项目迁移)操作，并查看 [CHANGELOG](./CHANGELOG.md) 中的行为变化。

## 更多文档

- [自动化说明](./docs/automation.md)：JSON 报告结构、错误码与处理建议、CI / AI 调用流程
- [编码迁移指南](./docs/migration.md)：支持的来源格式、API、比对结果与安全说明
- [CHANGELOG](./CHANGELOG.md)：版本变更与升级注意事项
- [CONTRIBUTING](./CONTRIBUTING.md)：本地开发、测试与项目结构

## 许可证

[MIT](./LICENSE) © [Wayne](mailto:michealwayne@163.com)
