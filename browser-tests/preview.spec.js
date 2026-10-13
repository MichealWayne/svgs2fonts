const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

for (const mode of ['fontclass', 'unicode']) {
  test(`${mode}: fonts, responsive layout, search and accessibility`, async ({
    page,
  }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/demo_${mode}.html`);
    const faces = await page.evaluate(async () => {
      const loaded = await document.fonts.load('32px iconfont');
      await document.fonts.ready;
      return loaded.map(face => ({
        family: face.family.replace(/^['"]|['"]$/g, ''),
        status: face.status,
      }));
    });
    await expect(page.locator('.m-demos_ctn li')).toHaveCount(3);
    expect(faces.some(face => face.family === 'iconfont' && face.status === 'loaded')).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    if (mode === 'fontclass') {
      const content = await page
        .locator('.m-demos_ctn em')
        .first()
        .evaluate(el => getComputedStyle(el, '::before').content);
      expect(content).not.toBe('none');
    }
    await testInfo.attach('preview', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    const search = page.getByRole('searchbox', { name: 'Search icons' });
    await search.fill('ALARM');
    await expect(page.locator('.m-demos_ctn li:visible')).toHaveCount(1);
    await expect(page.getByRole('status')).toHaveText('1 of 3 icons');
    await search.fill('no-match');
    await expect(page.locator('.m-demos_ctn li:visible')).toHaveCount(0);
    await search.fill('');
    await expect(page.locator('.m-demos_ctn li:visible')).toHaveCount(3);
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await search.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button').first()).toBeFocused();
    await page.setViewportSize({ width: 320, height: 640 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await page.getByText('Font CSS', { exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    expect(errors).toEqual([]);
  });

  test(`${mode}: keyboard copy and denied clipboard fallback preserve markup`, async ({ page }) => {
    await page.addInitScript(() => {
      window.copiedMarkup = '';
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async text => {
            window.copiedMarkup = text;
          },
        },
      });
    });
    await page.goto(`/demo_${mode}.html`);
    const button = page.getByRole('button', { name: 'Copy usage for home', exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveText('Copied');
    await expect(page.getByRole('status')).toHaveText('Copied usage for home');
    expect(await page.evaluate(() => window.copiedMarkup)).toContain('class="u-iconfont');
    await page.evaluate(() => {
      navigator.clipboard.writeText = async () => {
        throw new Error('Permission denied');
      };
    });
    const dialog = page.waitForEvent('dialog');
    const click = button.click();
    const prompt = await dialog;
    expect(prompt.type()).toBe('prompt');
    expect(prompt.defaultValue()).toContain('class="u-iconfont');
    await prompt.dismiss();
    await click;
  });
}
