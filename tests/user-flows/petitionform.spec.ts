import { test, expect, Page } from '@playwright/test';
import { testCases } from '../../utils/data/petitionTestCases';

async function expectFieldError(page: Page, fieldLabel: string, errorText: string) {
  const input = page.getByRole('textbox', { name: fieldLabel });
  const errorLocator = input.locator(`xpath=following-sibling::p[contains(text(), "${errorText}")]`);
  await expect(errorLocator).toBeVisible();
}

for (const tc of testCases) {
  test(`${tc.tags} ${tc.title}`, async ({ page }) => {
    await page.goto('/');
    const acceptCookies = page.getByRole('button', { name: 'Accept Cookies' });
    if (await acceptCookies.isVisible().catch(() => false)) {
      await acceptCookies.click();
    }

    let isMobile = test.info().project.name.toLowerCase().includes('mobile');
    if (isMobile) {
      const navMenuButton = page.getByRole('button', { name: 'Open navigation menu' });
      if (await navMenuButton.isVisible().catch(() => false)) {
        await navMenuButton.click();
      }
      await page.getByRole('button', { name: 'Sign the Petition' }).click();
    } else {
      await page.getByRole('button', { name: 'Sign the Petition' }).first().click();
    }

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