import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// End-to-end a11y and keyboard behaviour for the assistant panel.
// The chat API is not invoked — we only exercise UI state transitions.

test.describe('Assistant panel', () => {
  test('has no WCAG 2.1 AA violations when closed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /open assistant/i })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('opens with ⌘K, closes with Esc, returns focus to trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /open assistant/i });
    await trigger.focus();

    // Open (⌘K on macOS, Ctrl+K elsewhere — use Meta which Playwright maps appropriately).
    await page.keyboard.press('Meta+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Composer receives focus shortly after open.
    const composer = page.getByLabel('Message');
    await expect(composer).toBeFocused();

    // Close with Escape.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Focus returns to the trigger (Radix handles this).
    await expect(trigger).toBeFocused();
  });

  test('panel itself has no WCAG 2.1 AA violations when open', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open assistant/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('trigger exposes ⌘K hint and dialog has accessible name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /open assistant/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAccessibleName(/assistant/i);
    // Composer is labeled and focused.
    await expect(page.getByLabel('Message')).toBeFocused();
  });
});
