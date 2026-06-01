const { Pool } = require('pg');

// Extract database connection info from Supabase URL
// Format: https://[project-id].supabase.co
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Parse Supabase project ID from URL
const projectId = supabaseUrl.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/)?.[1];
if (!projectId) {
  console.error('Invalid Supabase URL format');
  process.exit(1);
}

// Create PostgreSQL connection pool
const pool = new Pool({
  host: `${projectId}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: supabaseServiceKey,
  ssl: 'require'
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
