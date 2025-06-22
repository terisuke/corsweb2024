import { test, expect } from '@playwright/test';

test.describe('Blog functionality', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Cor\.inc/);
  });

  test('should navigate to Japanese blog', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.locator('h1')).toContainText('技術ブログ');
  });

  test('should navigate to English blog', async ({ page }) => {
    await page.goto('/en/blog/');
    await expect(page.locator('h1')).toContainText('Tech Blog');
  });

  test('should display blog posts on Japanese blog page', async ({ page }) => {
    await page.goto('/blog/');
    const blogPosts = page.locator('[data-testid="blog-post"]');
    await expect(blogPosts.first()).toBeVisible();
  });

  test('should display blog posts on English blog page', async ({ page }) => {
    await page.goto('/en/blog/');
    const blogPosts = page.locator('[data-testid="blog-post"]');
    await expect(blogPosts.first()).toBeVisible();
  });

  test('should allow language switching', async ({ page }) => {
    await page.goto('/');
    
    // Switch to English
    await page.click('[data-testid="language-toggle"]');
    await expect(page).toHaveURL('/en/');
    
    // Switch back to Japanese
    await page.click('[data-testid="language-toggle"]');
    await expect(page).toHaveURL('/');
  });

  test('should display OGP image for blog posts', async ({ page }) => {
    await page.goto('/blog/');
    const firstPost = page.locator('[data-testid="blog-post"]').first();
    await firstPost.click();
    
    // Check if OGP meta tags exist
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /\/og\/.*\.svg/);
  });
});