# BloodBridge + Supabase Integration - Complete Setup

## ✅ Setup Complete! Here's What You Need to Do:

### 1. Configure Environment Variables

**File: `.env.local` (root folder)**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
JWT_SECRET=donneurs-secret-2026
```

**File: `client/.env.local`**
```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2. Get Credentials from Supabase

1. Go to: https://supabase.com/dashboard/org/bsdrwsokdgozabmssowx
2. Navigate to **Settings > API**
3. Copy:
   - Project URL
   - anon public key
   - service_role secret

### 3. Create Database Tables

In Supabase Dashboard > SQL Editor, run this:

```sql
CREATE TABLE IF NOT EXISTS hospitals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  admin_user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  wilaya TEXT,
  blood_type TEXT,
  phone TEXT,
  availability_status TEXT DEFAULT 'available',
  last_donation_date TIMESTAMP,
  hospital_id BIGINT REFERENCES hospitals(id),
  has_disease BOOLEAN DEFAULT FALSE,
  disease_description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entries (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  hospital_id BIGINT REFERENCES hospitals(id),
  user_id BIGINT REFERENCES users(id),
  description TEXT,
  priority TEXT DEFAULT 'standard',
  response_status TEXT DEFAULT 'none',
  test_appointment TIMESTAMP,
  test_result_status TEXT DEFAULT 'none',
  test_result_file TEXT,
  responding_user_id BIGINT REFERENCES users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_hospital_id ON entries(hospital_id);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
```

### 4. Install Dependencies

```bash
npm install
cd client
npm install
cd ..
```

### 5. Start the Application

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

### 6. Test It

1. Open http://localhost:5173
2. Register a new user
3. Check Supabase > Table Editor > users to verify

---

## Files Modified

- ✅ `package.json` - Added pg and @supabase/supabase-js
- ✅ `server.js` - Migrated from SQLite to PostgreSQL
- ✅ `.env.local` - Created with template
- ✅ `supabase-client.js` - PostgreSQL connection setup
- ✅ `client/.env.local` - Created with template

## Default Admin Account

After first run:
- **Email**: `dev@admin.local`
- **Password**: `Dev@2026`
- **Role**: Developer

---

## Key Changes Made

1. **Database**: SQLite ➜ PostgreSQL (Supabase)
2. **Driver**: `sqlite3` ➜ `pg` (node-postgres)
3. **Query syntax**: 
   - `?` parameters ➜ `$1, $2, $3`
   - `last_insert_rowid()` ➜ `RETURNING id`
4. **Data types**:
   - Boolean: `INTEGER` ➜ `BOOLEAN`
   - Dates: `TEXT` ➜ `TIMESTAMP`

---

## Common Issues

| Problem | Fix |
|---------|-----|
| "Missing credentials" | Fill in `.env.local` values from Supabase Settings > API |
| "Connection refused" | Check VITE_SUPABASE_URL starts with `https://` |
| "relation does not exist" | Run the SQL table creation script in Supabase |
| "Cannot find module 'pg'" | Run `npm install` in root folder |

---

**Ready to go!** Your BloodBridge app is now connected to Supabase.
