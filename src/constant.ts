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
export const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="./{{demoCssFile}}" />
  <title>{{fontName}} icon preview</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; background: #f6f8fa; color: #24292f; }
    input { display: block; padding: 10px; width: 100%; max-width: 420px; }
    .m-demos_ctn { display: grid; grid-template-columns: repeat(auto-fill,minmax(min(180px,100%),1fr)); gap: 16px; padding: 0; }
    .m-demos_ctn li { list-style: none; background: white; padding: 16px; border: 1px solid #d0d7de; border-radius: 8px; overflow-wrap: anywhere; }
    .u-iconfont { font-family: '{{fontName}}'; font-size: 32px; font-style: normal; }
    button { margin-top: 8px; padding: 8px 12px; min-height: 44px; cursor: pointer; }
    :focus-visible { outline: 2px solid #0969da; outline-offset: 3px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <main>
  <h1>{{fontName}} icon preview</h1>
  <p>Review each icon before using it in your project.</p>
  <label>Search icons <input id="search" type="search" placeholder="Icon name" /></label>
  <p id="preview-status" role="status" aria-live="polite" aria-atomic="true"></p>
  <ul class="m-demos_ctn">{{demoHtml}}</ul>
  <details><summary>Font CSS</summary><pre>{{demoCss}}</pre></details>
  </main>
  <script>
    const items = Array.from(document.querySelectorAll('.m-demos_ctn li'));
    const status = document.getElementById('preview-status');
    const updateCount = () => { status.textContent = items.filter(item => !item.hidden).length + ' of ' + items.length + ' icons'; };
    updateCount();
    document.getElementById('search').addEventListener('input', event => {
      const value = event.target.value.toLowerCase();
      items.forEach(item => { item.hidden = !item.textContent.toLowerCase().includes(value); });
      updateCount();
    });
    items.forEach(item => {
      const button = document.createElement('button');
      button.textContent = 'Copy usage';
      button.type = 'button';
      const icon = item.querySelector('em');
      icon.setAttribute('aria-hidden', 'true');
      const name = item.querySelector('.m-icon_ctn').getAttribute('title');
      button.setAttribute('aria-label', 'Copy usage for ' + name);
      button.addEventListener('click', async () => {
        const code = item.querySelector('em').outerHTML;
        try {
          if (!navigator.clipboard) throw new Error('Clipboard unavailable');
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied';
          status.textContent = 'Copied usage for ' + name;
        } catch (_) { window.prompt('Copy this markup:', code); }
      });
      item.appendChild(button);
    });
  </script>
</body>
</html>`;
