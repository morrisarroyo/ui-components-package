// Both pages in a real browser against the running mock API, one test per
// behaviour in section 5 of docs/DESIGNDOCUMENT.md. Patients come from
// api/Intrahealth.Api/SeedData.cs: twelve in all; Samuel Okafor (p-0007) has no
// phone and Priya Raman (p-0003) no email.
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const PATIENT_LIST = /\/api\/patients(\?.*)?$/;

/** Body rows only: the Table's header row is excluded. */
function patientRows(page: Page) {
  return page.locator('tbody tr');
}

/** Holds matching API responses until the returned function is called. */
async function holdResponses(page: Page, url: RegExp | string) {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(url, async (route) => {
    await released;
    await route.continue();
  });
  return release;
}

/** The value shown beside a DescriptionList label. */
function valueOf(page: Page, label: string) {
  return page.locator('dt', { hasText: label }).locator('xpath=following-sibling::dd[1]');
}

test.describe('Patient list', () => {
  test('shows Loading… until the list arrives, then every patient', async ({ page }) => {
    const release = await holdResponses(page, PATIENT_LIST);
    await page.goto('/');

    await expect(page.getByRole('status')).toHaveText('Loading…');
    await expect(page.getByRole('table')).toHaveCount(0);

    release();
    await expect(patientRows(page)).toHaveCount(12);
    await expect(page.getByRole('status')).toHaveCount(0);
  });

  test('is titled Patients and shows the four columns', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Patients');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Patients');
    await expect(page.getByRole('columnheader')).toHaveText(['Name', 'Gender', 'Birth date', 'Phone']);
  });

  test('shows display values, with — for a missing phone', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('row', { name: /Amara Okonkwo/ }).getByRole('cell')).toHaveText([
      'Amara Okonkwo',
      'Female',
      '2 Mar 1984',
      '+1 416 555 0133',
    ]);
    await expect(page.getByRole('row', { name: /Samuel Okafor/ }).getByRole('cell').nth(3)).toHaveText('—');
  });

  test('searching by part of a name shows only the matching patients', async ({ page }) => {
    await page.goto('/');
    await expect(patientRows(page)).toHaveCount(12);

    await page.getByLabel('Search by name').fill('okonkwo');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(patientRows(page)).toHaveCount(1);
    await expect(patientRows(page)).toContainText('Amara Okonkwo');
    await expect(page).toHaveURL('/?search=okonkwo');
  });

  test('the Search button shows its loading state while the search runs', async ({ page }) => {
    await page.goto('/');
    await expect(patientRows(page)).toHaveCount(12);

    const release = await holdResponses(page, /\/api\/patients\?search=/);
    await page.getByLabel('Search by name').fill('chen');
    const search = page.getByRole('button', { name: 'Search' });
    await search.click();

    await expect(search).toHaveAttribute('aria-busy', 'true');
    release();
    await expect(search).not.toHaveAttribute('aria-busy', 'true');
    await expect(patientRows(page)).toHaveCount(1);
  });

  test('a search with no matches says so', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search by name').fill('zzz');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('No patients match your search')).toBeVisible();
  });

  test('an unreachable API shows Something went wrong instead of the table', async ({ page }) => {
    await page.route(PATIENT_LIST, (route) => route.abort('connectionrefused'));
    await page.goto('/');

    await expect(page.getByRole('alert')).toContainText('Something went wrong');
    await expect(page.getByRole('table')).toHaveCount(0);
  });

  test('clicking a row opens that patient', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('row', { name: /Mei Chen/ }).getByRole('cell').nth(1).click();

    await expect(page).toHaveURL('/patients/p-0005');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mei Chen');
  });

  test('a row opens from the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Daniel Tremblay' }).focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL('/patients/p-0002');
  });
});

test.describe('Patient detail', () => {
  test('shows Loading… until the patient arrives', async ({ page }) => {
    const release = await holdResponses(page, '**/api/patients/p-0001');
    await page.goto('/patients/p-0001');

    await expect(page.getByRole('status')).toHaveText('Loading…');
    release();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Amara Okonkwo');
  });

  test("is titled with the patient's name and lists the demographics", async ({ page }) => {
    await page.goto('/patients/p-0001');

    await expect(page).toHaveTitle('Amara Okonkwo');
    await expect(page.getByRole('heading', { name: 'Demographics' })).toBeVisible();
    await expect(page.locator('dt')).toHaveText(['Name', 'Gender', 'Birth date', 'Phone', 'Email', 'Address']);
    await expect(page.locator('dd')).toHaveText([
      'Amara Okonkwo',
      'Female',
      '2 Mar 1984',
      '+1 416 555 0133',
      'amara.okonkwo@example.com',
      '412 Wellesley St E, Toronto, ON, M4X 1H2',
    ]);
  });

  test('shows — for a missing value, never blank or undefined', async ({ page }) => {
    await page.goto('/patients/p-0003');

    const email = valueOf(page, 'Email');
    await expect(email.locator('[aria-hidden="true"]')).toHaveText('—');
    await expect(page.getByRole('main')).not.toContainText('undefined');
    await expect(page.getByRole('main')).not.toContainText('null');
  });

  test('an unknown id shows Patient not found, with Back', async ({ page }) => {
    await page.goto('/patients/p-9999');

    await expect(page.getByRole('alert')).toContainText('Patient not found');
    await expect(page).toHaveTitle('Patient not found');
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL('/');
  });

  test('Back returns to the list with the search still applied', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search by name').fill('raman');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(patientRows(page)).toHaveCount(1);
    await page.getByRole('button', { name: 'Priya Raman' }).click();
    await expect(page).toHaveURL('/patients/p-0003');

    await page.getByRole('button', { name: 'Back' }).click();

    await expect(page).toHaveURL('/?search=raman');
    await expect(patientRows(page)).toHaveCount(1);
    await expect(page.getByLabel('Search by name')).toHaveValue('raman');
  });
});
