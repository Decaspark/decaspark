import { expect, test } from '@playwright/test';

test.describe('Decaspark Angular Application: E2E, Accessibility, Responsive & SEO', () => {
  test('hydrates cleanly on desktop without console or Angular hydration errors and navigates SPA routes', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('NG050')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page).toHaveTitle(/Decaspark/);
    await expect(page.locator('.navigation-bar__primary-logo img')).toBeVisible();

    const desktopNavBg = await page
      .locator('.navigation-bar')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(desktopNavBg).toBe('rgb(243, 243, 243)');

    const l1Buttons = page.locator('.l1-container .nav-item > button');
    await expect(l1Buttons).toHaveCount(5);
    await expect(l1Buttons.nth(0)).toHaveText('Products');
    await expect(l1Buttons.nth(4)).toHaveText('Company');

    // Open Products -> Books & Print Editions -> Authored Technical & Strategy Books
    await page.click('#l1-btn-products');
    await expect(page.locator('#l2-products')).toHaveAttribute('aria-hidden', 'false');

    await page.click('#l2-btn-books-print-editions');
    await expect(page.locator('#l3-books-print-editions')).toHaveAttribute('aria-hidden', 'false');

    await page.click('a[href="/products/books/strategy-books"]');
    await expect(page).toHaveURL('/products/books/strategy-books');
    await expect(page.locator('main h1')).toHaveText('Authored Technical & Strategy Books');
    await expect(page).toHaveTitle('Authored Technical & Strategy Books | Decaspark');

    expect(consoleErrors).toEqual([]);
  });

  test('supports full keyboard navigation across skip-link, L1/L2/L3 mega-menu, and Escape dismissal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Skip link keyboard activation
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.cmp-page__skiptomaincontent-link');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();

    // L1 -> ArrowDown -> L2 -> ArrowRight -> L3 -> Escape cascade
    await page.locator('#l1-btn-products').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#l2-btn-digital-systems')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#l3-digital-systems')).toHaveAttribute('aria-hidden', 'false');

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#l3-link-digital-systems-0')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#l3-digital-systems')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#l2-btn-digital-systems')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#l2-products')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#l1-btn-products')).toBeFocused();
  });

  test('provides instant search suggestions, combobox keyboard selection, and /search?q= results page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.click('#search-toggle');
    const searchInput = page.locator('#autocomplete-0-input');
    await expect(searchInput).toBeFocused();
    await expect(page.locator('.pre-query')).toBeVisible();

    await searchInput.fill('automation');
    const hits = page.locator('#autocomplete-0-list .aa-Item');
    await expect(hits.first()).toBeVisible();

    await page.keyboard.press('ArrowDown');
    await expect(searchInput).toHaveAttribute('aria-activedescendant', 'autocomplete-hit-0');

    await page.click('.search-submit');
    await expect(page).toHaveURL('/search?q=automation');
    await expect(page.locator('main h1')).toContainText('Results for “automation”');
  });

  test('preserves mobile unrounded header, centered logo, 3-level drawer drilldown, and aligned 40px search bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify unrounded bar, #F3F3F3 navbar surface, & zero horizontal overflow
    const navBarStyles = await page.locator('.navigation-bar').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { borderRadius: cs.borderRadius, backgroundColor: cs.backgroundColor };
    });
    expect(navBarStyles.borderRadius).toBe('0px');
    expect(navBarStyles.backgroundColor).toBe('rgb(243, 243, 243)');

    const overflowPx = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflowPx).toBeLessThanOrEqual(0);

    // Mobile drawer 3-tier drilldown & back buttons
    await page.click('.mobile-menu-button');
    await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-hidden', 'false');

    await page.click('#l1-btn-products');
    await expect(page.locator('#l2-products')).toHaveAttribute('aria-hidden', 'false');

    await page.click('#l2-btn-books-print-editions');
    await expect(page.locator('#l3-books-print-editions')).toHaveAttribute('aria-hidden', 'false');

    await page.click('#l3-books-print-editions .mobile-back-button');
    await expect(page.locator('#l3-books-print-editions')).toHaveAttribute('aria-hidden', 'true');

    await page.click('#l2-products > .mobile-back-button');
    await expect(page.locator('#l2-products')).toHaveAttribute('aria-hidden', 'true');

    await page.click('.mobile-menu-button');
    await expect(page.locator('#mobileMenu')).toHaveAttribute('aria-hidden', 'true');

    // Mobile search 40px vertical alignment check
    await page.click('#search-toggle');
    await expect(page.locator('#autocomplete-0-input')).toBeVisible();

    const alignment = await page.evaluate(() => {
      const formRect = document.querySelector('#search-content .aa-Form')?.getBoundingClientRect();
      const closeRect = document.querySelector('#search-toggle')?.getBoundingClientRect();
      if (!formRect || !closeRect) return null;
      return {
        formHeight: formRect.height,
        closeHeight: closeRect.height,
        centerDelta: Math.abs(
          formRect.top + formRect.height / 2 - (closeRect.top + closeRect.height / 2),
        ),
      };
    });

    expect(alignment).not.toBeNull();
    expect(alignment?.formHeight).toBe(40);
    expect(alignment?.closeHeight).toBe(40);
    expect(alignment?.centerDelta ?? 99).toBeLessThanOrEqual(1.5);
  });

  test('verifies zero broken internal navigation links, SEO metadata, robots.txt, sitemap.xml, and 404 responses', async ({
    page,
    request,
  }) => {
    await page.goto('/');

    // Collect every unique internal link in the header & search drawer
    const internalHrefs = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('header a[href]'));
      return Array.from(
        new Set(
          anchors
            .map((a) => a.getAttribute('href') ?? '')
            .filter((href) => href.startsWith('/') && !href.startsWith('//')),
        ),
      );
    });

    expect(internalHrefs.length).toBeGreaterThanOrEqual(89);

    // Verify EVERY single internal link returns HTTP 200 with prerendered HTML!
    for (const href of internalHrefs) {
      const res = await request.get(href);
      expect(res.status(), `Expected 200 for ${href}`).toBe(200);
    }

    // Verify robots.txt and sitemap.xml
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    expect(await robotsRes.text()).toContain('Sitemap: https://decaspark.com/sitemap.xml');

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    expect(await sitemapRes.text()).toContain(
      'https://decaspark.com/products/books/strategy-books',
    );

    // Verify unknown routes return HTTP 404 with noindex
    for (const missing of ['/nonexistent-route', '/products/nonexistent-item']) {
      const res404 = await request.get(missing);
      expect(res404.status()).toBe(404);
      expect(await res404.text()).toContain('noindex');
    }
  });
});
