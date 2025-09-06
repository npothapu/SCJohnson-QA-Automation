import { Page } from "playwright";

export async function checkout(
  page: Page,
  firstName: string,
  lastName: string,
  postalCode: string
) {
  await page.getByRole("button", { name: "Checkout" }).click();
  if (firstName) await page.getByPlaceholder("First Name").fill(firstName);
  if (lastName) await page.getByPlaceholder("Last Name").fill(lastName);
  if (postalCode)
    await page.getByPlaceholder("Zip/Postal Code").fill(postalCode);
  await page.getByRole("button", { name: "Continue" }).click();
}

// The above is an example of a helper function that simulates the checkout process on a website.
