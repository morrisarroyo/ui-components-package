// One user journey across all three pages, in a real browser against the
// running mock API: search, open a patient, Back, Register patient, Cancel.
// Patients come from api/Intrahealth.Api/SeedData.cs; "oko" matches only
// Amara Okonkwo (p-0001), and there are twelve in all.
import { expect, test } from '@playwright/test';

test('search, open a patient, go back, open Register patient, and return to the list', async ({ page }) => {
  const rows = page.locator('tbody tr');
  const search = page.getByLabel('Search by name');

  // Main page: search narrows the list to one patient.
  await page.goto('/');
  await expect(rows).toHaveCount(12);
  await search.fill('oko');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Amara Okonkwo');

  // Patient page.
  await rows.first().click();
  await expect(page).toHaveURL('/patients/p-0001');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Amara Okonkwo');
  await expect(page.getByRole('region', { name: 'Demographics' })).toBeVisible();

  // Back to the main page, with the search still applied.
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL('/?search=oko');
  await expect(search).toHaveValue('oko');
  await expect(rows).toHaveCount(1);

  // The third page.
  await page.getByRole('button', { name: 'Register patient' }).click();
  await expect(page).toHaveURL('/patients/new');
  await expect(page).toHaveTitle('Register patient');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Register patient');
  await expect(page.getByLabel('Given name')).toBeVisible();

  // Cancel returns to the main page, showing every patient.
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Patients');
  await expect(rows).toHaveCount(12);
});
