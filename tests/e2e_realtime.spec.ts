import { test, expect } from '@playwright/test';

test.describe('Real-time Blood Requests (SSE) Verification', () => {
  test('should verify a new blood request appears in the hospital dashboard in real-time', async ({ page, request }) => {
    // 1. Authenticate and go to dashboard via dev-setup
    await page.goto('/dev-setup');
    const setupButton = page.locator('button:has-text("Créer admin CHU")');
    await setupButton.click();
    await page.waitForURL('**/admin-hopital');

    // 2. Go to Demandes page
    await page.click('a[href="/admin-hopital/demandes"]');
    await page.waitForURL('**/admin-hopital/demandes');
    await expect(page.locator('h1')).toContainText('Demandes hospitalières');

    // Wait a bit to ensure SSE connection is fully established
    await page.waitForTimeout(2000);

    // 3. Create a donor user via backend API
    const testEmail = `donor.${Date.now()}@bloodtest.dz`;
    const registerResponse = await request.post('http://localhost:8000/api/auth/register', {
      data: {
        email: testEmail,
        password: 'password123',
        full_name: 'Test Donor Realtime',
        phone_number: '0555001122',
        blood_type: 'O+',
        role: 'donor'
      }
    });
    expect(registerResponse.ok()).toBeTruthy();

    const loginResponse = await request.post('http://localhost:8000/api/auth/login', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `username=${encodeURIComponent(testEmail)}&password=password123`
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;

    // 4. Simulate mobile app creating a blood request
    const uniquePatientName = `Patient Urgence ${Date.now()}`;
    const createReqResponse = await request.post('http://localhost:8000/api/requests/create', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        recipient_name: uniquePatientName,
        blood_type: 'O-',
        required_units: 3,
        hospital_name: 'CHU 1er Novembre',
        hospital_latitude: 35.6911,
        hospital_longitude: -0.6417,
        urgency_level: 'critical',
        needed_by: new Date(Date.now() + 86400000).toISOString()
      }
    });
    if (!createReqResponse.ok()) {
      console.error(await createReqResponse.text());
    }
    expect(createReqResponse.ok()).toBeTruthy();

    const createData = await createReqResponse.json();
    const requestId = createData.data.id;

    // 5. Verify the dashboard updates automatically without reload
    // We should see the request ID appear in the list
    await expect(page.locator('body')).toContainText(requestId, { timeout: 15000 });
    await expect(page.locator('body')).toContainText('O-', { timeout: 15000 });
  });
});
