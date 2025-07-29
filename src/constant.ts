/**
 * @module constant
 * @author Wayne<michealwayne@163.com>
 * @Date 2022-10-11 13:15:40
 * @LastEditTime 2024-09-29 20:23:54
 */

// 是否为开发环境，开发环境会开启一些调试日志
export const IS_DEV = process.env.NODE_ENV === 'development';

// 成功标识
export const SUCCESS_FLAG = true;
// 失败标识
export const FAIL_FLAG = false;

// demo中css产物
export const DEMO_CSS = `@font-face {
  font-family: '{{fontName}}';
  src: url('{{fontName}}.eot');
  src: url('{{fontName}}.woff2') format('woff2'),
    url('{{fontName}}.woff') format('woff'),
    url('{{fontName}}.eot#IEfix') format('embedded-opentype'), /* IE6-IE8 */  
    url('{{fontName}}.ttf') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('{{fontName}}.svg') format('svg');
}`;

// demo中HTML产物
export const DEMO_HTML = `
<!DOCTYPE html>
<html>
<head>
  <!-- include header -->
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="apple-touch-fullscreen" content="YES" />
  <style type="text/css">
  * {margin: 0;padding: 0;}
  html, body {width: 100%;}
  h3 {font-weight: normal;}
  .m-demos_ctn {margin-top: 50px;padding-right: 320px;display: flex;flex-wrap: wrap;justify-content: space-around;}
  .m-demos_ctn li {list-style: none;text-align: center;width: 150px;min-height: 150px;}
  .m-icon_ctn {width: 150px;height: 60px;}
  .m-code_ctn {position: fixed;right: 0;top: 0;z-index: 2;padding: 5px 10px;width: 300px;max-height: 100%;overflow-y: auto;background-color: #fff;box-shadow: 0 0 20px #999;}
  .m-code_ctn pre {white-space: pre-wrap;padding: 5px;color: #fff;background-color: #222;}
  
  @-webkit-keyframes colors {
    from {font-size: 26px;color: red;}
    25% {color: yellow;}
    50% {font-size: 66px;color: green;} 
    75% {color: blue;}
    to {font-size: 26px;color: red;}
  }
  @keyframes colors {
    from {font-size: 26px;color: red;}
    25% {color: yellow;}
    50% {font-size: 66px;color: green;} 
    75% {color: blue;}
    to {font-size: 26px;color: red;}
  }
  </style>

  <!-- font css -->
  <link rel="stylesheet" rel="stylesheet" href="./{{demoCssFile}}" />
  <title>svg2fonts demo</title>
</head>
<body>
  <style type="text/css">
  .u-iconfont{
    font-family: "{{fontName}}" !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .u-iconfont{
    display: inline-block;
    font-size: 26px;
    font-style: normal;
    -webkit-animation: colors 3s infinite linear;
            animation: colors 3s infinite linear;
  }
  </style>

  <h1>iconfont(by svgs2fonts)</h1>

  <section class="m-code_ctn">
  <h3>Main CSS codes: </h3>
    <pre>
    {{demoCss}}
    </pre>
  </section>

  <ul class="m-demos_ctn">
  <!-- <em class="u-iconfont">&#xE002;</em> -->

  {{demoHtml}}
  </li>
</body>
</html>
`;
