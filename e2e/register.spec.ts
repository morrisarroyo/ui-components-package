// The Register patient page (section 5.3 of docs/DESIGNDOCUMENT.md) in a real
// browser against the running mock API. Registered patients stay in the API's
// memory until it restarts, so each test registers a name of its own.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const POST_PATIENTS = '**/api/patients';

/** A family name no other test or run has used. */
function uniqueFamilyName() {
  return `Testerson${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

/** The value shown beside a DescriptionList label. */
function valueOf(page: Page, label: string) {
  return page.locator('dt', { hasText: label }).locator('xpath=following-sibling::dd[1]');
}

async function fillRequired(page: Page, familyName: string) {
  await page.getByLabel('Given name').fill('Ada');
  await page.getByLabel('Family name').fill(familyName);
  await page.getByLabel('Gender').fill('female');
  await page.getByLabel('Birth date').fill('1990-12-10');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/patients/new');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Register patient');
});

test('shows an error on each invalid field and sends nothing', async ({ page }) => {
  let posted = false;
  page.on('request', (request) => {
    if (request.method() === 'POST') posted = true;
  });

  await page.getByLabel('Gender').fill('robot');
  await page.getByLabel('Birth date').fill('10/12/1990');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByText('Enter a given name.')).toBeVisible();
  await expect(page.getByText('Enter a family name.')).toBeVisible();
  await expect(page.getByText('Enter female, male, other or unknown.')).toBeVisible();
  await expect(page.getByText('Enter a date as YYYY-MM-DD.')).toBeVisible();
  await expect(page.getByLabel('Given name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL('/patients/new');
  expect(posted).toBe(false);
});

test('rejects a birth date in the future', async ({ page }) => {
  await fillRequired(page, uniqueFamilyName());
  await page.getByLabel('Birth date').fill('2999-01-01');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByText('Birth date cannot be in the future.')).toBeVisible();
  await expect(page).toHaveURL('/patients/new');
});

test('clears a field’s error when that field is edited', async ({ page }) => {
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText('Enter a given name.')).toBeVisible();

  await page.getByLabel('Given name').fill('Ada');

  await expect(page.getByText('Enter a given name.')).toHaveCount(0);
  await expect(page.getByText('Enter a family name.')).toBeVisible();
});

test('registers a patient, opens their record, and lists them', async ({ page }) => {
  const familyName = uniqueFamilyName();
  await fillRequired(page, familyName);
  await page.getByLabel('Phone (optional)').fill('+1 416 555 0100');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/\/patients\/p-\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Ada ${familyName}`);
  await expect(valueOf(page, 'Gender')).toHaveText('Female');
  await expect(valueOf(page, 'Birth date')).toHaveText('10 Dec 1990');
  await expect(valueOf(page, 'Phone')).toHaveText('+1 416 555 0100');
  await expect(valueOf(page, 'Email')).toContainText('—');

  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByLabel('Search by name').fill(familyName);
  await page.keyboard.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText(`Ada ${familyName}`);
});

test('disables the form and shows Register as busy while saving', async ({ page }) => {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(POST_PATIENTS, async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await released;
    await route.continue();
  });

  await fillRequired(page, uniqueFamilyName());
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('button', { name: 'Register' })).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByLabel('Given name')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  release();
  await expect(page).toHaveURL(/\/patients\/p-\d+$/);
});

test('says Something went wrong and keeps the values when saving fails', async ({ page }) => {
  // The one way to make the real API unreachable from the browser.
  await page.route(POST_PATIENTS, (route) =>
    route.request().method() === 'POST' ? route.abort() : route.continue(),
  );

  const familyName = uniqueFamilyName();
  await fillRequired(page, familyName);
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toBeVisible();
  await expect(page.getByLabel('Family name')).toHaveValue(familyName);
  await expect(page.getByLabel('Given name')).toBeEnabled();
  await expect(page).toHaveURL('/patients/new');
});

test('Cancel returns to the patient list without saving', async ({ page }) => {
  const familyName = uniqueFamilyName();
  await fillRequired(page, familyName);
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page).toHaveURL('/');
  await page.getByLabel('Search by name').fill(familyName);
  await page.keyboard.press('Enter');
  await expect(page.getByText('No patients match your search')).toBeVisible();
});
