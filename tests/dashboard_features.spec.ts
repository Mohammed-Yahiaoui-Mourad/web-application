import { test, expect } from '@playwright/test';

test.describe('Hospital Admin Full Dashboard Verification', () => {
  test('should verify all hospital admin dashboard modules and team additions', async ({ page }) => {
    // 1. Navigate to dev-setup to establish a clean login session
    await page.goto('/dev-setup');
    const setupButton = page.locator('button:has-text("Créer admin CHU")');
    await setupButton.click();
    await page.waitForURL('**/admin-hopital');

    // 2. Verify Dashboard Statistics Cards
    await expect(page.locator('h1')).toContainText('Tableau de bord');
    await expect(page.locator('body')).toContainText('Demandes actives');
    await expect(page.locator('body')).toContainText('Cas urgents');
    await expect(page.locator('body')).toContainText('Rendez-vous du jour');

    // 3. Verify Demandes Module Navigation & List Loading
    await page.click('a[href="/admin-hopital/demandes"]');
    await page.waitForURL('**/admin-hopital/demandes');
    await expect(page.locator('h1')).toContainText('Demandes hospitalières');
    await expect(page.locator('body')).toContainText('Demandes de transfusion');

    // 4. Verify Planning Module Navigation
    await page.click('a[href="/admin-hopital/planning"]');
    await page.waitForURL('**/admin-hopital/planning');
    await expect(page.locator('h1')).toContainText('Planning des collectes');

    // 5. Verify Donneurs Module Navigation & List Loading
    await page.click('a[href="/admin-hopital/donneurs"]');
    await page.waitForURL('**/admin-hopital/donneurs');
    await expect(page.locator('h1')).toContainText('Registre des donneurs');

    // 6. Verify Historique Module Navigation & List Loading
    await page.click('a[href="/admin-hopital/historique"]');
    await page.waitForURL('**/admin-hopital/historique');
    await expect(page.locator('h1')).toContainText('Historique des dons');

    // 7. Verify Team Module & Adding a Member
    await page.click('a[href="/admin-hopital/equipe"]');
    await page.waitForURL('**/admin-hopital/equipe');
    await expect(page.locator('h1')).toContainText('Équipe hospitalière');

    // Open detail drawer to add a member
    await page.click('button:has-text("Ajouter un membre")');
    
    // Fill out the team member form
    const uniqueEmail = `nurse.${Date.now()}@bloodmatch.dz`;
    const formGrid = page.locator('div.grid.gap-4.sm\\:grid-cols-2');
    await formGrid.locator('input').nth(0).fill('Samia');
    await formGrid.locator('input').nth(1).fill('Belaidi');
    await formGrid.locator('input').nth(2).fill('Infirmière');
    await formGrid.locator('input').nth(3).fill('Banque du sang');
    await formGrid.locator('input').nth(4).fill(uniqueEmail);
    await formGrid.locator('input').nth(5).fill('0555998877');
    await formGrid.locator('input').nth(6).fill('08:00 - 16:00');

    // Save and verify successful addition message
    await page.click('button:has-text("Enregistrer")');
    await expect(page.locator('body')).toContainText('Le nouveau membre a été ajouté', { timeout: 10000 });

    // Verify member shows in list
    await expect(page.locator('body')).toContainText('Samia Belaidi');
    await expect(page.locator('body')).toContainText(uniqueEmail);
  });
});
