import { test, expect, devices, Page } from '@playwright/test';
import { testCases } from '../../utils/data/petitionTestCases';

test.use({ ...devices['iPhone 12'] });

async function expectFieldError(page: Page, fieldLabel: string, errorText: string) {
  const input = page.getByRole('textbox', { name: fieldLabel });
  const errorLocator = input.locator(`xpath=following-sibling::p[contains(text(), "${errorText}")]`);
  await expect(errorLocator).toBeVisible();
}

for (const tc of testCases) {
  test(`@petitionform-mobile @mobile ${tc.title}`, async ({ page }) => {
    await page.goto('/');
    // Open mobile nav menu before accessing petition
    const navMenuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await navMenuButton.isVisible().catch(() => false)) {
      await navMenuButton.click();
    }
    await page.getByRole('button', { name: /sign the petition/i }).click();

    await page.getByRole('textbox', { name: 'First Name' }).fill(tc.data.firstName);
    await page.getByRole('textbox', { name: 'Last Name' }).fill(tc.data.lastName);
    await page.getByRole('textbox', { name: 'Email' }).fill(tc.data.email);
    await page.getByRole('textbox', { name: 'Zip Code' }).fill(tc.data.zipCode);

    await page.getByRole('textbox', { name: 'First Name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Last Name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Zip Code' }).press('Tab');

    for (const assertion of tc.assertions) {
      await expectFieldError(page, assertion.field, assertion.text);
    }

    await expect(page.getByRole('textbox', { name: 'First Name' })).toHaveValue(tc.data.firstName);
    await expect(page.getByRole('textbox', { name: 'Last Name' })).toHaveValue(tc.data.lastName);
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue(tc.data.email);
    await expect(page.getByRole('textbox', { name: 'Zip Code' })).toHaveValue(tc.data.zipCode);
  });
}