# Manual Integration Testing Guide 🩸

This guide outlines the step-by-step procedure to manually test the integration between the **FastAPI Backend (running in Podman)**, the **Hospital Admin Web Dashboard**, and the **React Native / Expo Mobile App**.

---

## 1. Environment & Infrastructure Verification

Make sure the backend container stack is running and healthy:

```bash
# Check status of Podman containers
podman ps
```
You should see:
* **`amal_web`** running on port `8000`.
* **`amal_postgres`** (PostGIS PostgreSQL database) running on port `5433` -> container port `5432`.

To reset the database state and re-seed clean dev credentials at any time, run:
```bash
# Re-run the seeding script in the container
podman exec -it amal_web python3 /app/setup_dev.py
```

---

## 2. Hospital & Super Admin Dashboard Testing

### Setup & Credentials
* **URL**: `http://localhost:5173/dev-setup`
* **Test Credentials**:
  * **Hospital Admin**: `chu.admin@bloodmatch.dz` / `chu_1234`
  * **Root System Admin**: `admin@amal.org` / `admin123`

### Steps to Test:
1. **Developer Bootstrap**:
   * Open `http://localhost:5173/dev-setup` in your browser.
   * Click **"Créer admin CHU"** to dynamically register a clean hospital admin for the "CHU 1er Novembre" hospital. You will be automatically logged in and redirected to the dashboard.
2. **Dashboard Verification**:
   * Verify that the stats cards (Active requests, urgent cases, daily appointments) load successfully.
3. **Module Navigation**:
   * Click through the sidebar sections: **Demandes**, **Planning**, **Donneurs**, **Historique**, and **Équipe**.
   * Confirm each page renders its title and loads tables/grids without errors.
4. **Team Management**:
   * Go to the **Équipe** page.
   * Click the **"Ajouter un membre"** button in the top right.
   * Fill out the form fields (Prénom, Nom, Fonction, Service, Email, Téléphone, Shift).
   * Click **Enregistrer** and verify that a success banner appears and the new member instantly displays in the team roster table with their initials (e.g., `SB` for Samia Belaidi).

---

## 3. Mobile Application Testing (Donor Flow)

### Setup & Credentials
* Go to the mobile app directory:
  ```bash
  cd /Users/digitalcenter/mobile-app-Repository
  # Start the Expo Dev server
  npm run start -- --web
  ```
* **Donor 1 Account**: `donor1@amal.org` / `donor123`
* **Donor 2 Account**: `donor2@amal.org` / `donor123`

### Steps to Test:
1. **Login**:
   * Navigate to the login screen.
   * Enter email `donor1@amal.org` and password `donor123`.
   * Verify authentication completes successfully, token is stored, and you are redirected to the Home/Map screen.
2. **Availability Toggle**:
   * On the dashboard/home view, locate the **"Disponible pour un don"** toggle.
   * Switch the toggle off/on and verify that the status updates immediately.
3. **Medical Pre-Screening Questionnaire**:
   * Navigate to the Pre-Screening questionnaire screen.
   * Complete the questionnaire questions (answering all "No" to ensure eligibility).
   * Verify a medical clearance token is generated, and the donor is marked as available.
4. **Appointment Scheduling**:
   * Navigate to the scheduling screen.
   * Select a center, choose a date and time slot.
   * Submit and verify the appointment is successfully registered in the schedules list.
5. **Real-time Synchronization**:
   * Go back to the Hospital Dashboard (**Planning** or **Donneurs** page) and confirm that the mobile-created appointment or donor status is instantly updated and displayed to the hospital administrators.
6. **Real-time Blood Requests (SSE) Verification**:
   * Open the hospital dashboard (**Demandes**) and keep the page open.
   * From the mobile app (or using Postman/curl), create a new **Blood Request** (Demande de Sang/Snag).
   * Verify that the new request appears *instantly* in the Hospital Admin Dashboard list without requiring a page refresh.
   * This confirms the Server-Sent Events (SSE) websocket is active and properly broadcasting database changes in real-time.
