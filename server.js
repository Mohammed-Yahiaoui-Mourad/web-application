require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const supabase = require('./supabase-client');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'donneurs-secret-2026';

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadDir });
app.use('/uploads', express.static(uploadDir));

const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));

// PostgreSQL query helpers using Supabase connection pool
async function run(sql, params = []) {
  try {
    const result = await supabase.query(sql, params);
    return { changes: result.rowCount };
  } catch (err) {
    throw err;
  }
}

async function get(sql, params = []) {
  try {
    const result = await supabase.query(sql, params);
    return result.rows?.[0];
  } catch (err) {
    throw err;
  }
}

async function all(sql, params = []) {
  try {
    const result = await supabase.query(sql, params);
    return result.rows || [];
  } catch (err) {
    throw err;
  }
}

const BLOOD_COMPATIBILITY = {
  recipient: {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
  },
  donor: {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
  },
};

function compatibleDonorTypes(recipientBloodType) {
  return BLOOD_COMPATIBILITY.recipient[recipientBloodType] || [recipientBloodType];
}

function compatibleRecipientTypes(donorBloodType) {
  return BLOOD_COMPATIBILITY.donor[donorBloodType] || [donorBloodType];
}

function classifyUrgency(description) {
  const text = (description || '').toLowerCase();
  const criticalKeywords = ['immediately', 'urgent', 'critical', 'ic', 'icu', 'severe', 'shock', 'bleeding', 'loss', 'transfusion', 'hemoglobin', 'tachycardic', 'emergency'];
  const urgentKeywords = ['soon', 'needs', 'post-op', 'surgery', 'urgent', 'hospitalized', 'infection', 'fever', 'low', 'high'];

  if (criticalKeywords.some((keyword) => text.includes(keyword))) {
    return 'critical';
  }
  if (urgentKeywords.some((keyword) => text.includes(keyword))) {
    return 'urgent';
  }
  return 'standard';
}

function isCooldownActive(lastDonationDate) {
  if (!lastDonationDate) return false;
  const donatedAt = new Date(lastDonationDate);
  if (Number.isNaN(donatedAt.getTime())) return false;
  const diffDays = Math.floor((Date.now() - donatedAt.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 56;
}

async function initDb() {
  try {
    // Create hospitals table
    await run(`CREATE TABLE IF NOT EXISTS hospitals (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      admin_user_id BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create users table
    await run(`CREATE TABLE IF NOT EXISTS users (
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
    )`);

    // Create entries table
    await run(`CREATE TABLE IF NOT EXISTS entries (
      id BIGSERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      phone TEXT NOT NULL,
      wilaya TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      hospital_id BIGINT REFERENCES hospitals(id),
      user_id BIGINT REFERENCES users(id),
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'standard',
      response_status TEXT DEFAULT 'none',
      test_appointment TIMESTAMP,
      test_result_status TEXT DEFAULT 'none',
      test_result_file TEXT,
      responding_user_id BIGINT REFERENCES users(id),
      responded_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create indexes for better performance
    await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_entries_hospital_id ON entries(hospital_id)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status)`);

    // Seed developer account
    const developerEmail = 'dev@admin.local';
    const existingDeveloper = await get('SELECT id FROM users WHERE email = $1', [developerEmail]);
    if (!existingDeveloper) {
      const passwordHash = await bcrypt.hash('Dev@2026', 10);
      await run(
        'INSERT INTO users (name, email, password, role, wilaya) VALUES ($1, $2, $3, $4, $5)',
        ['Platform Developer', developerEmail, passwordHash, 'developer', 'nationwide']
      );
      console.log('Developer seeded:', developerEmail, 'password: Dev@2026');
    }

    // Seed sample hospital and users for demo/testing
    let sampleHospital = await get('SELECT id FROM hospitals WHERE name = $1', ['Central Blood Center']);
    if (!sampleHospital) {
      const hospitalResult = await supabase.query(
        'INSERT INTO hospitals (name, wilaya) VALUES ($1, $2) RETURNING id',
        ['Central Blood Center', '16 - Alger']
      );
      const hospitalId = hospitalResult.rows[0].id;
      const adminPassword = await bcrypt.hash('Hosp1234!', 10);
      const adminResult = await supabase.query(
        'INSERT INTO users (name, email, password, role, wilaya, hospital_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        ['Hospital Admin', 'hospital.admin@demo.local', adminPassword, 'hospital', '16 - Alger', hospitalId]
      );
      await run('UPDATE hospitals SET admin_user_id = $1 WHERE id = $2', [adminResult.rows[0].id, hospitalId]);
      console.log('Sample hospital seeded: Central Blood Center');
      sampleHospital = { id: hospitalId };
    }

    const sampleUsers = [
      {
        name: 'Sara Donor',
        email: 'sara.donor@demo.local',
        password: 'Donor2026',
        role: 'donor',
        wilaya: '16 - Alger',
        blood_type: 'O+',
        phone: '+213661234567',
        availability_status: 'available',
        hospital_id: sampleHospital.id,
      },
      {
        name: 'Adam Recipient',
        email: 'adam.recipient@demo.local',
        password: 'Recipient2026',
        role: 'recipient',
        wilaya: '16 - Alger',
        blood_type: 'O+',
        phone: '+213698765432',
        availability_status: 'available',
        hospital_id: sampleHospital.id,
      },
    ];

    for (const userData of sampleUsers) {
      const existingSampleUser = await get('SELECT id FROM users WHERE email = $1', [userData.email]);
      if (!existingSampleUser) {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        await supabase.query(
          'INSERT INTO users (name, email, password, role, wilaya, blood_type, phone, availability_status, hospital_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [userData.name, userData.email, passwordHash, userData.role, userData.wilaya, userData.blood_type, userData.phone, userData.availability_status, userData.hospital_id]
        );
        console.log('Sample user seeded:', userData.email);
      }
    }

    const entriesCount = await get('SELECT COUNT(*) AS count FROM entries');
    if (Number(entriesCount.count) === 0) {
      const donorUser = await get('SELECT id FROM users WHERE email = $1', ['sara.donor@demo.local']);
      const recipientUser = await get('SELECT id FROM users WHERE email = $1', ['adam.recipient@demo.local']);
      await supabase.query(
        'INSERT INTO entries (type, name, blood_type, phone, wilaya, status, hospital_id, user_id, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        ['donor', 'Sara Donor', 'O+', '+213661234567', '16 - Alger', 'available', sampleHospital.id, donorUser.id, 'Available for donation in Algiers', 'standard']
      );
      await supabase.query(
        'INSERT INTO entries (type, name, blood_type, phone, wilaya, status, hospital_id, user_id, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        ['recipient', 'Adam Recipient', 'O+', '+213698765432', '16 - Alger', 'pending', sampleHospital.id, recipientUser.id, 'Urgent O+ request for surgery tomorrow', 'critical']
      );
      console.log('Sample entries seeded');
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await get('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return res.status(400).json({ error: 'Invalid credentials' });

  const tokenUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    hospital_id: user.hospital_id,
  };
  const token = jwt.sign(tokenUser, JWT_SECRET, { expiresIn: '12h' });

  res.json({ token, user: tokenUser, name: user.name, role: user.role, wilaya: user.wilaya, blood_type: user.blood_type, hospital_id: user.hospital_id });
});

app.post('/api/auth/register/:role', async (req, res) => {
  const role = req.params.role;
  if (!['donor', 'recipient'].includes(role)) {
    return res.status(400).json({ error: 'Role must be donor or recipient' });
  }

  const { name, email, password, wilaya, blood_type, phone, hospital_id, last_donation_date, has_disease, disease_description } = req.body;
  if (!name || !email || !password || !wilaya || !blood_type || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existing = await get('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) return res.status(400).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const availability_status = isCooldownActive(last_donation_date) ? 'cooldown' : 'available';
  await run(
    'INSERT INTO users (name, email, password, role, wilaya, blood_type, phone, availability_status, last_donation_date, has_disease, disease_description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [name, email, passwordHash, role, wilaya, blood_type, phone, availability_status, last_donation_date || null, has_disease ? true : false, (has_disease && disease_description) ? disease_description : '']
  );

  const user = await get('SELECT id, email, role, name, wilaya, blood_type, phone, availability_status, last_donation_date, hospital_id, has_disease, disease_description FROM users WHERE email = $1', [email]);
  // If the user selected a hospital at signup, create a pending entry for the hospital admin to review
  if (hospital_id) {
    const hospital = await get('SELECT id FROM hospitals WHERE id = $1', [hospital_id]);
    if (hospital) {
      // ensure the user we just created is actually a donor/recipient before linking
      const createdUser = await get('SELECT id, role FROM users WHERE id = $1', [user.id]);
      if (createdUser && (createdUser.role === 'donor' || createdUser.role === 'recipient')) {
        await run(
          'INSERT INTO entries (type, name, blood_type, phone, wilaya, status, hospital_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [role, name, blood_type, phone, wilaya, 'pending', hospital_id, user.id]
        );
      }
    }
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user });
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const user = await get('SELECT id, name, email, role, wilaya, blood_type, phone, availability_status, last_donation_date, hospital_id, has_disease, disease_description FROM users WHERE id = $1', [req.user.id]);
  res.json(user);
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { phone, availability_status, last_donation_date, has_disease, disease_description } = req.body;
  const user = await get('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updatedLastDonationDate = last_donation_date || user.last_donation_date;
  let updatedAvailabilityStatus = user.availability_status;

  if (updatedLastDonationDate && isCooldownActive(updatedLastDonationDate)) {
    updatedAvailabilityStatus = 'cooldown';
  } else if (availability_status) {
    updatedAvailabilityStatus = availability_status;
  }

  const updatedHasDisease = has_disease !== undefined ? (has_disease ? true : false) : user.has_disease;
  const updatedDiseaseDescription = (has_disease || (has_disease === undefined && user.has_disease)) ? (disease_description || user.disease_description || '') : '';

  await run(
    'UPDATE users SET phone = $1, availability_status = $2, last_donation_date = $3, has_disease = $4, disease_description = $5 WHERE id = $6',
    [phone || user.phone, updatedAvailabilityStatus, updatedLastDonationDate || null, updatedHasDisease, updatedDiseaseDescription, req.user.id]
  );

  const updatedUser = await get('SELECT id, name, email, role, wilaya, blood_type, phone, availability_status, last_donation_date, hospital_id, has_disease, disease_description FROM users WHERE id = $1', [req.user.id]);
  res.json(updatedUser);
});

app.post('/api/entries', authenticateToken, requireAnyRole(['donor', 'recipient']), async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { description = '', hospital_id } = req.body;
  const type = user.role === 'donor' ? 'donor' : 'recipient';
  const priority = classifyUrgency(description);

  if (hospital_id) {
    const hospital = await get('SELECT id FROM hospitals WHERE id = $1', [hospital_id]);
    if (!hospital) {
      return res.status(400).json({ error: 'Selected hospital not found' });
    }
  }

  const result = await supabase.query(
    'INSERT INTO entries (type, name, blood_type, phone, wilaya, status, hospital_id, user_id, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [type, user.name, user.blood_type, user.phone || '', user.wilaya, 'pending', hospital_id || null, user.id, description, priority]
  );
  const entry = result.rows[0];
  res.json(entry);
});

app.get('/api/entries/me', authenticateToken, requireAnyRole(['donor', 'recipient']), async (req, res) => {
  const entries = await all('SELECT * FROM entries WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
  res.json({ entries });
});

app.post('/api/entries/:id/respond', authenticateToken, requireAnyRole(['donor', 'recipient']), async (req, res) => {
  const entryId = Number(req.params.id);
  const { action } = req.body;
  if (!['confirm', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Action must be confirm or pass' });
  }

  const entry = await get('SELECT * FROM entries WHERE id = $1', [entryId]);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  if (entry.type === req.user.role) {
    return res.status(403).json({ error: 'Cannot respond to an entry of the same type as your account' });
  }

  const responseStatus = action === 'confirm' ? 'confirmed' : 'passed';
  await run(
    'UPDATE entries SET response_status = $1, responding_user_id = $2, responded_at = $3 WHERE id = $4',
    [responseStatus, req.user.id, new Date().toISOString(), entryId]
  );

  const updated = await get('SELECT * FROM entries WHERE id = $1', [entryId]);
  res.json(updated);
});

app.get('/api/hospitals', async (req, res) => {
  const hospitals = await all('SELECT id, name, wilaya FROM hospitals ORDER BY name');
  res.json(hospitals);
});

app.post('/api/developer/hospitals', authenticateToken, requireRole('developer'), async (req, res) => {
  const { name, wilaya, adminName, adminEmail } = req.body;
  if (!name || !wilaya || !adminName || !adminEmail) {
    return res.status(400).json({ error: 'Hospital name, wilaya, admin name, and admin email are required' });
  }

  const existingHospital = await get('SELECT id FROM hospitals WHERE name = $1', [name]);
  if (existingHospital) return res.status(400).json({ error: 'Hospital with this name already exists' });

  const existingAdmin = await get('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existingAdmin) return res.status(400).json({ error: 'Admin email is already used' });

  const password = `Hosp${Math.floor(1000 + Math.random() * 9000)}!`;
  const passwordHash = await bcrypt.hash(password, 10);

  const hospitalResult = await supabase.query('INSERT INTO hospitals (name, wilaya) VALUES ($1, $2) RETURNING id', [name, wilaya]);
  const hospitalId = hospitalResult.rows[0].id;
  const userResult = await supabase.query(
    'INSERT INTO users (name, email, password, role, wilaya, hospital_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [adminName, adminEmail, passwordHash, 'hospital', wilaya, hospitalId]
  );
  const adminUserId = userResult.rows[0].id;
  await run('UPDATE hospitals SET admin_user_id = $1 WHERE id = $2', [adminUserId, hospitalId]);

  res.json({ hospital: { id: hospitalId, name, wilaya }, admin: { email: adminEmail, password } });
});

app.get('/api/developer/hospitals', authenticateToken, requireRole('developer'), async (req, res) => {
  const rows = await all(`
    SELECT h.id, h.name, h.wilaya, u.email AS admin_email, u.name AS admin_name
    FROM hospitals h
    LEFT JOIN users u ON u.id = h.admin_user_id
    ORDER BY h.name
  `);
  res.json(rows);
});

app.get('/api/developer/users', authenticateToken, requireRole('developer'), async (req, res) => {
  const users = await all(`
    SELECT id, name, email, role, wilaya, blood_type, phone, availability_status, hospital_id, created_at
    FROM users
    ORDER BY created_at DESC
  `);
  res.json(users);
});

app.put('/api/developer/hospitals/:id', authenticateToken, requireRole('developer'), async (req, res) => {
  const hospitalId = Number(req.params.id);
  const { name, wilaya, adminName, adminEmail, adminPassword } = req.body;
  const hospital = await get('SELECT * FROM hospitals WHERE id = $1', [hospitalId]);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  const adminUser = await get('SELECT * FROM users WHERE id = $1', [hospital.admin_user_id]);
  if (!adminUser) return res.status(404).json({ error: 'Hospital admin not found' });

  const newName = name?.trim() || hospital.name;
  const newWilaya = wilaya?.trim() || hospital.wilaya;
  const newAdminName = adminName?.trim() || adminUser.name;
  const newAdminEmail = adminEmail?.trim() || adminUser.email;

  if (newName !== hospital.name) {
    const existingHospital = await get('SELECT id FROM hospitals WHERE name = $1 AND id != $2', [newName, hospitalId]);
    if (existingHospital) return res.status(400).json({ error: 'Another hospital already uses that name' });
  }

  if (newAdminEmail !== adminUser.email) {
    const existingAdmin = await get('SELECT id FROM users WHERE email = $1 AND id != $2', [newAdminEmail, adminUser.id]);
    if (existingAdmin) return res.status(400).json({ error: 'Admin email is already used' });
  }

  await run('UPDATE hospitals SET name = $1, wilaya = $2 WHERE id = $3', [newName, newWilaya, hospitalId]);

  let updateUserSql = 'UPDATE users SET name = $1, email = $2, wilaya = $3';
  const params = [newAdminName, newAdminEmail, newWilaya];
  let paramIndex = 4;
  if (adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    updateUserSql += `, password = $${paramIndex}`;
    params.push(passwordHash);
    paramIndex++;
  }
  updateUserSql += ` WHERE id = $${paramIndex}`;
  params.push(adminUser.id);
  await run(updateUserSql, params);

  res.json({ hospital: { id: hospitalId, name: newName, wilaya: newWilaya }, admin: { name: newAdminName, email: newAdminEmail } });
});

app.delete('/api/developer/hospitals/:id', authenticateToken, requireRole('developer'), async (req, res) => {
  const hospitalId = Number(req.params.id);
  const hospital = await get('SELECT * FROM hospitals WHERE id = $1', [hospitalId]);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  await run('DELETE FROM entries WHERE hospital_id = $1', [hospitalId]);
  if (hospital.admin_user_id) {
    await run('DELETE FROM users WHERE id = $1', [hospital.admin_user_id]);
  }
  await run('DELETE FROM hospitals WHERE id = $1', [hospitalId]);

  res.json({ success: true });
});

app.get('/api/hospital/dashboard', authenticateToken, requireRole('hospital'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const donors = await all('SELECT * FROM entries WHERE hospital_id = $1 AND type = $2 ORDER BY created_at DESC', [hospitalId, 'donor']);
  const recipients = await all('SELECT * FROM entries WHERE hospital_id = $1 AND type = $2 ORDER BY created_at DESC', [hospitalId, 'recipient']);
  res.json({ donors, recipients });
});

// Entries can only be created through user registration, not manually
// Hospital admins cannot create entries directly
app.post('/api/hospital/entry', authenticateToken, requireRole('hospital'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const { type, name, blood_type, phone, wilaya, status = 'pending', description = '' } = req.body;
  if (!['donor', 'recipient'].includes(type)) {
    return res.status(400).json({ error: 'Entry type must be donor or recipient' });
  }
  if (!name || !blood_type || !phone || !wilaya) {
    return res.status(400).json({ error: 'Name, blood type, phone, and wilaya are required' });
  }

  const priority = classifyUrgency(description);
  const result = await supabase.query(
    'INSERT INTO entries (type, name, blood_type, phone, wilaya, status, hospital_id, user_id, description, priority) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [type, name, blood_type, phone, wilaya, status, hospitalId, null, description, priority]
  );
  const entry = result.rows[0];
  res.json(entry);
});

app.put('/api/hospital/entry/:id', authenticateToken, requireRole('hospital'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const entryId = Number(req.params.id);
  const existing = await get('SELECT * FROM entries WHERE id = $1 AND hospital_id = $2', [entryId, hospitalId]);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });

  const { name, blood_type, phone, wilaya, status, description, priority } = req.body;
  const updatedDescription = description !== undefined ? description : existing.description;
  const updatedPriority = priority || classifyUrgency(updatedDescription);
  await run(
    'UPDATE entries SET name = $1, blood_type = $2, phone = $3, wilaya = $4, status = $5, description = $6, priority = $7 WHERE id = $8',
    [name || existing.name, blood_type || existing.blood_type, phone || existing.phone, wilaya || existing.wilaya, status || existing.status, updatedDescription, updatedPriority, entryId]
  );
  const updated = await get('SELECT * FROM entries WHERE id = $1', [entryId]);
  res.json(updated);
});

app.delete('/api/hospital/entry/:id', authenticateToken, requireRole('hospital'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const entryId = Number(req.params.id);
  const existing = await get('SELECT * FROM entries WHERE id = $1 AND hospital_id = $2', [entryId, hospitalId]);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });

  await run('DELETE FROM entries WHERE id = $1', [entryId]);
  res.json({ success: true });
});

app.post('/api/hospital/entry/:id/action', authenticateToken, requireRole('hospital'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const entryId = Number(req.params.id);
  const { action } = req.body;
  const existing = await get('SELECT * FROM entries WHERE id = $1 AND hospital_id = $2', [entryId, hospitalId]);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });

  const allowed = ['accept', 'refuse', 'test'];
  if (!allowed.includes(action)) return res.status(400).json({ error: 'Invalid action' });

  let newStatus = existing.status;
  if (action === 'accept') newStatus = 'accepted';
  if (action === 'refuse') newStatus = 'refused';
  if (action === 'test') newStatus = 'tested';

  await run('UPDATE entries SET status = $1 WHERE id = $2', [newStatus, entryId]);

  // If accepted and linked to a user, associate the user with this hospital
  if (action === 'accept' && existing.user_id) {
    // only associate users who are actual donors/recipients (not developer/admin users)
    const linkedUser = await get('SELECT id, role FROM users WHERE id = $1', [existing.user_id]);
    if (linkedUser && (linkedUser.role === 'donor' || linkedUser.role === 'recipient')) {
      await run('UPDATE users SET hospital_id = $1 WHERE id = $2', [hospitalId, existing.user_id]);
    }
  }

  const updated = await get('SELECT * FROM entries WHERE id = $1', [entryId]);
  res.json(updated);
});

app.post('/api/hospital/entry/:id/schedule-test', authenticateToken, requireRole('hospital'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const entryId = Number(req.params.id);
  const { appointment } = req.body;
  const existing = await get('SELECT * FROM entries WHERE id = $1 AND hospital_id = $2', [entryId, hospitalId]);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });
  if (!appointment) return res.status(400).json({ error: 'Appointment date is required' });

  await run('UPDATE entries SET status = $1, test_appointment = $2 WHERE id = $3', ['testing_scheduled', appointment, entryId]);
  const updated = await get('SELECT * FROM entries WHERE id = $1', [entryId]);
  res.json(updated);
});

app.post('/api/hospital/entry/:id/test-result', authenticateToken, requireRole('hospital'), upload.single('resultFile'), async (req, res) => {
  const hospitalId = req.user.hospital_id;
  const entryId = Number(req.params.id);
  const { result } = req.body;
  const existing = await get('SELECT * FROM entries WHERE id = $1 AND hospital_id = $2', [entryId, hospitalId]);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });
  if (!['good', 'bad'].includes(result)) {
    return res.status(400).json({ error: 'Result must be good or bad' });
  }

  const filePath = req.file ? `/uploads/${req.file.filename}` : existing.test_result_file;
  const testResultStatus = result;
  const updatedStatus = result === 'good' ? 'accepted' : 'refused';

  await run(
    'UPDATE entries SET status = $1, test_result_status = $2, test_result_file = $3 WHERE id = $4',
    [updatedStatus, testResultStatus, filePath, entryId]
  );

  if (result === 'good' && existing.user_id) {
    const linkedUser = await get('SELECT id, role FROM users WHERE id = $1', [existing.user_id]);
    if (linkedUser && (linkedUser.role === 'donor' || linkedUser.role === 'recipient')) {
      await run('UPDATE users SET hospital_id = $1 WHERE id = $2', [hospitalId, existing.user_id]);
    }
  }

  const updated = await get('SELECT * FROM entries WHERE id = $1', [entryId]);
  res.json(updated);
});

app.get('/api/match', authenticateToken, async (req, res) => {
  if (req.user.role === 'donor') {
    const donor = await get('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const compatibleTypes = compatibleRecipientTypes(donor.blood_type);
    const placeholders = compatibleTypes.map((_, i) => `$${i + 2}`).join(',');
    const matches = await all(
      `SELECT * FROM entries WHERE type = $1 AND blood_type IN (${placeholders}) AND wilaya = $${compatibleTypes.length + 2} ORDER BY CASE priority WHEN 'critical' THEN 3 WHEN 'urgent' THEN 2 ELSE 1 END DESC, created_at DESC`,
      ['recipient', ...compatibleTypes, donor.wilaya]
    );
    return res.json({ matches });
  }

  if (req.user.role === 'recipient') {
    const recipient = await get('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const compatibleTypes = compatibleDonorTypes(recipient.blood_type);
    const placeholders = compatibleTypes.map((_, i) => `$${i + 2}`).join(',');
    const matches = await all(
      `SELECT e.* FROM entries e
        LEFT JOIN users u ON u.id = e.user_id
        WHERE e.type = $1
          AND e.blood_type IN (${placeholders})
          AND e.wilaya = $${compatibleTypes.length + 2}
          AND (e.user_id IS NULL OR u.availability_status = 'available')
        ORDER BY CASE e.priority WHEN 'critical' THEN 3 WHEN 'urgent' THEN 2 ELSE 1 END DESC, e.created_at DESC`,
      ['donor', ...compatibleTypes, recipient.wilaya]
    );
    return res.json({ matches });
  }

  if (req.user.role === 'hospital') {
    const hospitalId = req.user.hospital_id;
    const donors = await all('SELECT * FROM entries WHERE hospital_id = $1 AND type = $2 ORDER BY created_at DESC', [hospitalId, 'donor']);
    const recipients = await all('SELECT * FROM entries WHERE hospital_id = $1 AND type = $2 ORDER BY created_at DESC', [hospitalId, 'recipient']);
    return res.json({ donors, recipients });
  }

  res.status(400).json({ error: 'No matching data for this role' });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ready' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to initialize database:', err);
    process.exit(1);
  });
