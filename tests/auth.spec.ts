import { test, expect } from '@playwright/test';

test.describe('Hospital Admin Authentication & Setup', () => {
  test('should successfully run developer setup and login to hospital admin dashboard', async ({ page }) => {
    // Listen for console logs
    page.on('console', (msg) => {
      console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', (err) => {
      console.error(`BROWSER ERROR: ${err.message}`);
    });

    // 1. Navigate to dev-setup page
    await page.goto('/dev-setup');
    
    // Check page header
    await expect(page.locator('h1')).toContainText('Setup dev — Admin CHU');
    
    // 2. Click on Setup & login button
    const setupButton = page.locator('button:has-text("Créer admin CHU")');
    await expect(setupButton).toBeEnabled();
    
    // Click and wait for navigation/setup log completion
    await setupButton.click();
    
    // Verify dev logs contain success messages
    const logOutput = page.locator('pre');
    await expect(logOutput).toContainText('Hôpital trouvé', { timeout: 15000 });
    await expect(logOutput).toContainText('Connexion en tant que : chu.admin@bloodmatch.dz', { timeout: 15000 });
    
    // 3. Verify page redirects to dashboard
    await page.waitForURL('**/admin-hopital');
    
    // 4. Verify dashboard elements are visible and populated
    await expect(page.locator('h1')).toContainText('Tableau de bord');
    
    // Verify the hospital admin profile name is visible
    await expect(page.locator('body')).toContainText('CHU 1er Novembre');
  });
});
