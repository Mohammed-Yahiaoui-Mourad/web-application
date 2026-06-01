# Supabase Setup Guide for BloodBridge

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard/org/bsdrwsokdgozabmssowx
2. Select your project (or create a new one)
3. Navigate to **Settings > API** in the left sidebar
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (under Project API keys) → `VITE_SUPABASE_ANON_KEY`
   - **service_role** (under Project API keys) → `SUPABASE_SERVICE_ROLE_KEY`

5. Paste these values into `.env.local`

## Step 2: Create Tables in Supabase

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create hospitals table
CREATE TABLE hospitals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  admin_user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
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
  disease_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create entries table
CREATE TABLE entries (
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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_hospital_id ON users(hospital_id);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_hospital_id ON entries(hospital_id);
CREATE INDEX idx_entries_status ON entries(status);
```

## Step 3: Set Up Row Level Security (Optional but Recommended)

For security, you can enable RLS on tables. Go to each table in Supabase, click "Authentication" tab and enable RLS.

## Step 4: Install Dependencies

```bash
npm install @supabase/supabase-js dotenv
cd client
npm install
```

## Step 5: Restart Your Server

```bash
npm start
# or for development
npm run dev
```

## Testing

1. The app should now connect to Supabase instead of SQLite
2. Try registering a new user
3. Check the Supabase database tables to verify data is being stored

## Troubleshooting

- **"Missing Supabase credentials"**: Make sure `.env.local` has the correct values
- **Connection errors**: Verify your Supabase project is active and the URL is correct
- **Table doesn't exist**: Run the SQL setup script in Supabase SQL Editor
- **File upload issues**: Configure storage buckets in Supabase > Storage
