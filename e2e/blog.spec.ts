import { test, expect } from '@playwright/test';

test.describe('Blog functionality', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Cor\./);
  });

  test('should navigate to Japanese blog', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.getByRole('heading', { name: 'ブログ', exact: true })).toBeVisible();
  });

  test('should navigate to English blog', async ({ page }) => {
    await page.goto('/en/blog/');
    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
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

  test('should display category and tag article lists', async ({ page }) => {
    await page.goto('/blog/category/ai/');
    await expect(page.getByRole('heading', { name: 'AI', exact: true })).toBeVisible();
    await expect(page.locator('[data-testid="blog-post"]').first()).toBeVisible();

    await page.goto('/blog/tags/Astro/');
    await expect(page.getByRole('heading', { name: '#Astro', exact: true })).toBeVisible();
    await expect(page.locator('[data-testid="blog-post"]').first()).toBeVisible();
  });

  test('should display OGP image for blog posts', async ({ page }) => {
    await page.goto('/blog/');
    const firstPost = page.locator('[data-testid="blog-post"]').first();
    await firstPost.click();
    
    // Check if OGP meta tags exist
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /\/og\/.*\.(svg|png)$/);
  });
});
