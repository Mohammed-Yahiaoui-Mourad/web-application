import { useEffect, useMemo, useState } from 'react';
import {
  authLogin,
  authRegister,
  fetchProfile,
  fetchHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  developerHospitals,
  fetchUsers,
  hospitalDashboard,
  hospitalEntryDelete,
  hospitalEntryUpdate,
  hospitalEntryAction,
  scheduleHospitalEntryTest,
  uploadHospitalEntryTestResult,
  createUserEntry,
  fetchMyEntries,
  respondToEntry,
  updateMyProfile,
  fetchMatches,
} from './api.js';
import logo from './assets/amal-logo.jpg';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const WILAYAS = [
  '01 - Adrar',
  '02 - Chlef',
  '03 - Laghouat',
  '04 - Oum El Bouaghi',
  '05 - Batna',
  '06 - Béjaïa',
  '07 - Biskra',
  '08 - Béchar',
  '09 - Blida',
  '10 - Bouira',
  '11 - Tamanrasset',
  '12 - Tébessa',
  '13 - Tlemcen',
  '14 - Tiaret',
  '15 - Tizi Ouzou',
  '16 - Alger',
  '17 - Djelfa',
  '18 - Jijel',
  '19 - Sétif',
  '20 - Saïda',
  '21 - Skikda',
  '22 - Sidi Bel Abbès',
  '23 - Annaba',
  '24 - Guelma',
  '25 - Constantine',
  '26 - Médéa',
  '27 - Mostaganem',
  '28 - M\'Sila',
  '29 - Mascara',
  '30 - Ouargla',
  '31 - Oran',
  '32 - El Bayadh',
  '33 - Illizi',
  '34 - Bordj Bou Arreridj',
  '35 - Boumerdès',
  '36 - El Tarf',
  '37 - Tindouf',
  '38 - Tissemsilt',
  '39 - El Oued',
  '40 - Khenchela',
  '41 - Souk Ahras',
  '42 - Tipaza',
  '43 - Mila',
  '44 - Aïn Defla',
  '45 - Naâma',
  '46 - Aïn Témouchent',
  '47 - Ghardaïa',
  '48 - Relizane',
  '49 - Timimoun',
  '50 - Bordj Badji Mokhtar',
  '51 - Ouled Djellal',
  '52 - Béni Abbès',
  '53 - In Salah',
  '54 - In Guezzam',
  '55 - Touggourt',
  '56 - Djanet',
  '57 - El M\'Ghair',
  '58 - El Meniaa',
  '59 - Aflou',
  '60 - El Abiodh Sidi Cheikh',
  '61 - El Aricha',
  '62 - El Kantara',
  '63 - Barika',
  '64 - Bou Saâda',
  '65 - Bir El Ater',
  '66 - Ksar El Boukhari',
  '67 - Ksar Chellala',
  '68 - Aïn Oussara',
  '69 - Messaâd',
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [view, setView] = useState('login');
  const [status, setStatus] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [developerHospitalsData, setDeveloperHospitalsData] = useState([]);
  const [matchResults, setMatchResults] = useState(null);
  const [myEntries, setMyEntries] = useState([]);

  useEffect(() => {
    if (token) {
      fetchHospitals().then(setHospitals).catch(() => null);
      fetchMatches(token).then(setMatchResults).catch(() => null);
      if (user?.role === 'hospital') {
        hospitalDashboard(token).then(setDashboardData).catch(() => null);
      }
      if (user?.role === 'developer') {
        developerHospitals(token).then(setDeveloperHospitalsData).catch(() => null);
      }
      if (user?.role === 'donor' || user?.role === 'recipient') {
        fetchMyEntries(token).then((data) => setMyEntries(data.entries || [])).catch(() => null);
      }
    }
  }, [token, user]);

  const login = async (payload) => {
    try {
      const result = await authLogin(payload);
      const profile = await fetchProfile(result.token);
      setToken(result.token);
      setUser(profile);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setView('dashboard');
      setStatus(null);
      addToast('Logged in successfully.', 'success');
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const register = async (role, payload) => {
    try {
      const result = await authRegister(role, payload);
      const profile = await fetchProfile(result.token);
      setToken(result.token);
      setUser(profile);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setView('dashboard');
      setStatus('Registration successful!');
      addToast('Registered successfully.', 'success');
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('login');
    setStatus(null);
  };

  const refreshHospitalDashboard = async () => {
    if (token && user?.role === 'hospital') {
      const data = await hospitalDashboard(token);
      setDashboardData(data);
    }
  };

  const refreshDeveloperHospitals = async () => {
    if (token && user?.role === 'developer') {
      const data = await developerHospitals(token);
      setDeveloperHospitalsData(data);
    }
  };

  const refreshMatches = async () => {
    if (token) {
      const data = await fetchMatches(token);
      setMatchResults(data);
    }
  };

  const refreshMyEntries = async () => {
    if (token) {
      const data = await fetchMyEntries(token);
      setMyEntries(data.entries || []);
    }
  };

  const addToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4200);
  };

  const updateProfile = async (payload) => {
    if (!token) return;
    const profile = await updateMyProfile(payload, token);
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
    return profile;
  };

  const roleLabel = useMemo(() => {
    if (!user) return '';
    if (user.role === 'developer') return 'Platform Developer';
    if (user.role === 'hospital') return 'Hospital Admin';
    if (user.role === 'donor') return 'Donor';
    if (user.role === 'recipient') return 'Recipient';
    return user.role;
  }, [user]);

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar" style={{ display: !token || view === 'login' ? 'none' : 'flex' }}>
        <div className="brand-wrap">
          <img src={logo} alt="Amal logo" className="brand-logo" />
          <div>
            <p className="brand">Amal <span className="brand-subtitle">أمل</span></p>
            <p className="subtitle">معاً لإنقاذ حياة · Ensemble pour sauver des vies.</p>
          </div>
        </div>
        {user && (
          <>
            <nav className="topbar-nav" aria-label="Dashboard navigation">
              <button type="button" onClick={() => scrollToSection('overview')}>Overview</button>
              <button type="button" onClick={() => scrollToSection('actions')}>Actions</button>
              <button type="button" onClick={() => scrollToSection('entries')}>Entries</button>
            </nav>
            <div className="topbar-right">
              <span>{roleLabel}</span>
              <button className="button button-secondary" onClick={logout}>
                Logout
              </button>
            </div>
          </>
        )}
      </header>

      <div className="toast-viewport">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === 'danger' ? 'toast-danger' : 'toast-success'}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <main>
        {!token || view === 'login' ? (
          <AuthPanel onLogin={login} onRegister={register} switchView={setView} status={status} hospitals={hospitals} />
        ) : (
          <div className="dashboard-shell">
            <DashboardShell
              user={user}
              token={token}
              status={status}
              setStatus={setStatus}
              addToast={addToast}
              updateProfile={updateProfile}
              hospitals={hospitals}
              matchResults={matchResults}
              dashboardData={dashboardData}
              developerHospitalsData={developerHospitalsData}
              myEntries={myEntries}
              refreshHospitalDashboard={refreshHospitalDashboard}
              refreshDeveloperHospitals={refreshDeveloperHospitals}
              refreshMatches={refreshMatches}
              refreshMyEntries={refreshMyEntries}
              setView={setView}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function AuthPanel({ onLogin, onRegister, switchView, status, hospitals = [] }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'donor', wilaya: WILAYAS[0], blood_type: BLOOD_GROUPS[0], phone: '', hospital_id: '', has_disease: false, disease_description: '' });

  const onChange = (key) => (event) => {
    const value = key === 'has_disease' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === 'login') {
      await onLogin({ email: form.email, password: form.password });
    } else {
      await onRegister(form.role, {
        name: form.name,
        email: form.email,
        password: form.password,
        wilaya: form.wilaya,
        blood_type: form.blood_type,
        phone: form.phone,
        hospital_id: form.hospital_id || undefined,
        has_disease: form.has_disease,
        disease_description: form.has_disease ? form.disease_description : '',
      });
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Hero Section */}
      <div className="auth-left">
        <div className="auth-left-content">
          <img src={logo} alt="Amal" className="auth-hero-logo" />
          <div className="auth-hero">
            <h2>Save Lives, Together</h2>
            <p>Connect blood donors, recipients, and hospitals in real-time. A platform built to strengthen healthcare networks and accelerate life-saving matches.</p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">🩸</div>
              <div className="auth-feature-text">
                <div className="auth-feature-title">Smart Matching</div>
                <div className="auth-feature-desc">Find compatible donors instantly</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🏥</div>
              <div className="auth-feature-text">
                <div className="auth-feature-title">Hospital Management</div>
                <div className="auth-feature-desc">Streamlined coordination and records</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">⚡</div>
              <div className="auth-feature-text">
                <div className="auth-feature-title">Real-Time Updates</div>
                <div className="auth-feature-desc">Stay informed every step of the way</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-footer-text">
          <p>Amal • أمل</p>
          <p style={{fontSize: '0.8rem', marginTop: '8px', opacity: 0.6}}>Ensemble pour sauver des vies</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>{mode === 'login' ? 'Welcome Back' : 'Join Our Mission'}</h1>
            <p>{mode === 'login' ? 'Sign in to your account to continue' : 'Create an account to start saving lives'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="auth-form-group">
                  <label className="auth-form-label">Full Name</label>
                  <input
                    type="text"
                    className="auth-form-input"
                    value={form.name}
                    onChange={onChange('name')}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="auth-form-group">
                  <label className="auth-form-label">I am a...</label>
                  <select
                    className="auth-form-input"
                    value={form.role}
                    onChange={onChange('role')}
                  >
                    <option value="donor">Blood Donor</option>
                    <option value="recipient">Person in Need</option>
                  </select>
                </div>
              </>
            )}

            <div className="auth-form-group">
              <label className="auth-form-label">Email Address</label>
              <input
                type="email"
                className="auth-form-input"
                value={form.email}
                onChange={onChange('email')}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">Password</label>
              <input
                type="password"
                className="auth-form-input"
                value={form.password}
                onChange={onChange('password')}
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="auth-form-group">
                  <label className="auth-form-label">Region (Wilaya)</label>
                  <select
                    className="auth-form-input"
                    value={form.wilaya}
                    onChange={onChange('wilaya')}
                  >
                    {WILAYAS.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>
                        {wilaya}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="auth-form-group">
                  <label className="auth-form-label">Blood Type</label>
                  <select
                    className="auth-form-input"
                    value={form.blood_type}
                    onChange={onChange('blood_type')}
                  >
                    {BLOOD_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="auth-form-group">
                  <label className="auth-form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="auth-form-input"
                    value={form.phone}
                    onChange={onChange('phone')}
                    placeholder="+213 123 456 789"
                    required
                  />
                </div>
                <div className="auth-form-group">
                  <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={form.has_disease}
                      onChange={onChange('has_disease')}
                      style={{width: '18px', height: '18px', cursor: 'pointer'}}
                    />
                    <span>I have an existing medical condition</span>
                  </label>
                </div>
                {form.has_disease && (
                  <div className="auth-form-group">
                    <label className="auth-form-label">Describe Your Condition</label>
                    <textarea
                      className="auth-form-input"
                      value={form.disease_description}
                      onChange={onChange('disease_description')}
                      placeholder="E.g., Hypertension, Diabetes, Surgery recovery..."
                      rows="3"
                      required
                      style={{resize: 'vertical'}}
                    />
                  </div>
                )}
                <div className="auth-form-group">
                  <label className="auth-form-label">Preferred Hospital (Optional)</label>
                  <select
                    className="auth-form-input"
                    value={form.hospital_id}
                    onChange={onChange('hospital_id')}
                  >
                    <option value="">No preference</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} — {h.wilaya}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="auth-form-button">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {status && <div className="auth-status">{status}</div>}

            <div className="auth-toggle-link">
              <p>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setForm({
                      email: '',
                      password: '',
                      name: '',
                      role: 'donor',
                      wilaya: WILAYAS[0],
                      blood_type: BLOOD_GROUPS[0],
                      phone: '',
                      hospital_id: '',
                      has_disease: false,
                      disease_description: '',
                    });
                  }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="auth-developer-info">
              <strong>Demo Account:</strong> dev@admin.local / Dev@2026
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DashboardShell({ user, token, addToast, updateProfile, hospitals, matchResults, dashboardData, developerHospitalsData, myEntries, refreshHospitalDashboard, refreshDeveloperHospitals, refreshMatches, refreshMyEntries, setView, setStatus }) {
  if (user.role === 'developer') {
    return <DeveloperDashboard token={token} hospitals={developerHospitalsData} refresh={refreshDeveloperHospitals} setStatus={setStatus} addToast={addToast} />;
  }
  if (user.role === 'hospital') {
    return <HospitalDashboard token={token} data={dashboardData} refresh={refreshHospitalDashboard} setStatus={setStatus} addToast={addToast} />;
  }
  if (user.role === 'donor' || user.role === 'recipient') {
    return <MemberDashboard user={user} token={token} hospitals={hospitals} matchResults={matchResults} myEntries={myEntries} refreshMatches={refreshMatches} refreshMyEntries={refreshMyEntries} updateProfile={updateProfile} setStatus={setStatus} addToast={addToast} />;
  }
  return <div className="card">Role not supported yet.</div>;
}

function DeveloperDashboard({ token, hospitals, refresh, setStatus, addToast }) {
  const [form, setForm] = useState({ name: '', wilaya: '01 - Adrar', adminName: '', adminEmail: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', wilaya: '01 - Adrar', adminName: '', adminEmail: '', adminPassword: '' });
  const [created, setCreated] = useState(null);
  const [users, setUsers] = useState([]);

  const onChange = (key) => (evt) => setForm((prev) => ({ ...prev, [key]: evt.target.value }));
  const onEditChange = (key) => (evt) => setEditForm((prev) => ({ ...prev, [key]: evt.target.value }));

  const refreshUsers = async () => {
    try {
      const userList = await fetchUsers(token);
      setUsers(userList);
    } catch (err) {
      setStatus(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUsers();
    }
  }, [token]);

  const create = async (event) => {
    event.preventDefault();
    try {
      const result = await createHospital(form, token);
      setCreated(result);
      setStatus('Hospital created successfully. Share the admin credentials with your hospital team.');
      setForm({ name: '', wilaya: '01 - Adrar', adminName: '', adminEmail: '' });
      refresh();
      addToast('Hospital added successfully.', 'success');
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const beginEdit = (hospital) => {
    setEditId(hospital.id);
    setEditForm({
      name: hospital.name,
      wilaya: hospital.wilaya,
      adminName: hospital.admin_name,
      adminEmail: hospital.admin_email,
      adminPassword: '',
    });
    setStatus(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', wilaya: '01 - Adrar', adminName: '', adminEmail: '', adminPassword: '' });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        wilaya: editForm.wilaya,
        adminName: editForm.adminName,
        adminEmail: editForm.adminEmail,
      };
      if (editForm.adminPassword) {
        payload.adminPassword = editForm.adminPassword;
      }
      await updateHospital(editId, payload, token);
      setStatus('Hospital updated successfully.');
      cancelEdit();
      refresh();
      addToast('Hospital modified successfully.', 'success');
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const removeHospital = async (hospitalId) => {
    if (!window.confirm('Delete this hospital and its admin account? This action is permanent.')) {
      return;
    }
    try {
      await deleteHospital(hospitalId, token);
      setStatus('Hospital deleted successfully.');
      refresh();
      addToast('Hospital deleted successfully.', 'success');
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  return (
    <section id="overview" className="grid-2 gap-xl">
      <article className="card card-glow developer-panel">
        <h2>Developer control center</h2>
        <p className="panel-copy">Create or update hospital accounts and admin credentials.</p>
        <form className="form-grid" onSubmit={create}>
          <label>
            Hospital name
            <input value={form.name} onChange={onChange('name')} placeholder="Central Blood Center" required />
          </label>
          <label>
            Wilaya
            <select value={form.wilaya} onChange={onChange('wilaya')}>
              {WILAYAS.map((wilaya) => <option key={wilaya} value={wilaya}>{wilaya}</option>)}
            </select>
          </label>
          <label>
            Hospital admin name
            <input value={form.adminName} onChange={onChange('adminName')} placeholder="Admin name" required />
          </label>
          <label>
            Hospital admin email
            <input type="email" value={form.adminEmail} onChange={onChange('adminEmail')} placeholder="admin@example.com" required />
          </label>
          <button className="button button-primary full-width">Create hospital</button>
        </form>

        {created && (
          <div className="status-bar">
            <h3>Hospital admin created</h3>
            <p><strong>{created.hospital.name}</strong> in {created.hospital.wilaya}</p>
            <p>Admin email: {created.admin.email}</p>
            <p>Admin password: {created.admin.password}</p>
          </div>
        )}
      </article>

      <article id="entries" className="card card-glow">
        <h2>Managed hospitals</h2>
        {editId && (
          <form className="form-grid edit-panel" onSubmit={saveEdit}>
            <h3>Edit hospital #{editId}</h3>
            <label>
              Hospital name
              <input value={editForm.name} onChange={onEditChange('name')} required />
            </label>
            <label>
              Wilaya
              <select value={editForm.wilaya} onChange={onEditChange('wilaya')}>
                {WILAYAS.map((wilaya) => <option key={wilaya} value={wilaya}>{wilaya}</option>)}
              </select>
            </label>
            <label>
              Admin name
              <input value={editForm.adminName} onChange={onEditChange('adminName')} required />
            </label>
            <label>
              Admin email
              <input type="email" value={editForm.adminEmail} onChange={onEditChange('adminEmail')} required />
            </label>
            <label>
              New password (optional)
              <input type="password" value={editForm.adminPassword} onChange={onEditChange('adminPassword')} placeholder="Leave blank to keep current password" />
            </label>
            <div className="button-row">
              <button type="submit" className="button button-primary">Save changes</button>
              <button type="button" className="button button-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        )}

        <div className="list-panel">
          {hospitals?.length ? hospitals.map((hospital) => (
            <div className="list-row" key={hospital.id}>
              <div>
                <strong>{hospital.name}</strong>
                <p>{hospital.wilaya}</p>
                <p className="muted-text">Admin: {hospital.admin_name} · {hospital.admin_email}</p>
              </div>
              <div className="list-actions">
                <button className="button button-secondary tiny" onClick={() => beginEdit(hospital)}>Edit</button>
                <button className="button button-danger tiny" onClick={() => removeHospital(hospital.id)}>Delete</button>
              </div>
            </div>
          )) : <p>No hospitals created yet.</p>}
        </div>
      </article>

      <article className="card card-glow">
        <h2>All registered users</h2>
        <p className="panel-copy">List of all users created in Supabase, including donors, recipients, hospitals, and developer accounts.</p>
        <div className="list-panel">
          {users.length > 0 ? users.map((userItem) => (
            <div className="list-row" key={userItem.id}>
              <div>
                <strong>{userItem.name || userItem.email}</strong>
                <p>{userItem.role} · {userItem.wilaya || 'N/A'} · {userItem.blood_type || '—'}</p>
                <p className="muted-text">{userItem.email} · {userItem.phone || 'No phone'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joined {new Date(userItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )) : <p>No users found yet.</p>}
        </div>
      </article>
    </section>
  );
}

function HospitalDashboard({ token, data, refresh, setStatus, addToast }) {
  const [schedulingEntry, setSchedulingEntry] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [testEntry, setTestEntry] = useState(null);
  const [testResult, setTestResult] = useState('good');
  const [resultFile, setResultFile] = useState(null);

  const performAction = async (entryId, action) => {
    try {
      await hospitalEntryAction(entryId, action, token);
      setStatus('Action executed.');
      addToast('Action executed successfully.', 'success');
      refresh();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const remove = async (id) => {
    try {
      await hospitalEntryDelete(id, token);
      setStatus('Entry deleted.');
      addToast('Entry deleted successfully.', 'success');
      refresh();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const openTestScheduler = (entry) => {
    setSchedulingEntry(entry.id);
    setAppointmentDate(entry.test_appointment || '');
    setTestEntry(null);
  };

  const scheduleTest = async (event) => {
    event.preventDefault();
    try {
      await scheduleHospitalEntryTest(schedulingEntry, appointmentDate, token);
      setStatus('Test appointment scheduled.');
      addToast('Test appointment scheduled successfully.', 'success');
      setSchedulingEntry(null);
      setAppointmentDate('');
      refresh();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const openTestResult = (entry) => {
    setTestEntry(entry.id);
    setTestResult('good');
    setResultFile(null);
    setSchedulingEntry(null);
  };

  const submitTestResult = async (event) => {
    event.preventDefault();
    try {
      await uploadHospitalEntryTestResult(testEntry, testResult, resultFile, token);
      setStatus(`Test result ${testResult === 'good' ? 'accepted' : 'refused'}.`);
      addToast(`Test result recorded successfully.`, 'success');
      setTestEntry(null);
      setResultFile(null);
      setTestResult('good');
      refresh();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const handleResultFile = (event) => {
    setResultFile(event.target.files[0] || null);
  };

  return (
    <section id="overview" className="grid-1">
      <article className="card card-glow">
        <h2>Hospital care center</h2>
        <p className="panel-copy">Review and manage donors and recipients who have registered and chosen this hospital.</p>
      </article>

      <section id="actions" className="grid-2 gap-xl">
        <article className="card card-glow list-panel">
          <h2>Donors</h2>
          {data?.donors?.length ? data.donors.map((donor) => (
            <div key={donor.id} className="list-row">
              <div>
                <strong>{donor.name}</strong>
                <p>{donor.blood_type} • {donor.wilaya} • {donor.phone}</p>
                <p className="muted-text">Status: {donor.status || 'pending'}{donor.test_appointment ? ` · Appointment: ${new Date(donor.test_appointment).toLocaleString()}` : ''}</p>
                {donor.test_result_status && donor.test_result_status !== 'none' && (
                  <p className="muted-text">Test result: {donor.test_result_status}</p>
                )}
              </div>
              <div className="list-actions">
                <button className="button button-primary tiny" onClick={() => performAction(donor.id, 'accept')}>Accept</button>
                <button className="button button-secondary tiny" onClick={() => openTestScheduler(donor)}>Schedule test</button>
                {donor.status === 'testing_scheduled' && (
                  <button className="button button-secondary tiny" onClick={() => openTestResult(donor)}>Send results</button>
                )}
                <button className="button button-danger tiny" onClick={() => performAction(donor.id, 'refuse')}>Refuse</button>
                <button className="button button-danger tiny" onClick={() => remove(donor.id)}>Delete</button>
              </div>
              {schedulingEntry === donor.id && (
                <div className="list-row expand-row">
                  <form className="form-grid small-form" onSubmit={scheduleTest}>
                    <label>
                      Test appointment
                      <input type="datetime-local" value={appointmentDate} onChange={(evt) => setAppointmentDate(evt.target.value)} required />
                    </label>
                    <div className="button-row">
                      <button type="submit" className="button button-primary tiny">Save appointment</button>
                      <button type="button" className="button button-secondary tiny" onClick={() => setSchedulingEntry(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              {testEntry === donor.id && (
                <div className="list-row expand-row">
                  <form className="form-grid small-form" onSubmit={submitTestResult}>
                    <label>
                      Result status
                      <select value={testResult} onChange={(evt) => setTestResult(evt.target.value)}>
                        <option value="good">Good (accept)</option>
                        <option value="bad">Bad (refuse)</option>
                      </select>
                    </label>
                    <label>
                      Result file (PDF or DOC)
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResultFile} />
                    </label>
                    <div className="button-row">
                      <button type="submit" className="button button-primary tiny">Send result</button>
                      <button type="button" className="button button-secondary tiny" onClick={() => setTestEntry(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )) : <p>No donors yet.</p>}
        </article>

        <article className="card card-glow list-panel">
          <h2>Requests</h2>
          {data?.recipients?.length ? data.recipients.map((recipient) => (
            <div key={recipient.id} className="list-row">
              <div>
                <strong>{recipient.name}</strong>
                <p>{recipient.blood_type} • {recipient.wilaya} • {recipient.phone}</p>
                <p className="muted-text">Priority: {recipient.priority || 'standard'}{recipient.description ? ` · ${recipient.description}` : ''}</p>
                <p className="muted-text">Status: {recipient.status || 'pending'}{recipient.test_appointment ? ` · Appointment: ${new Date(recipient.test_appointment).toLocaleString()}` : ''}</p>
                {recipient.test_result_status && recipient.test_result_status !== 'none' && (
                  <p className="muted-text">Test result: {recipient.test_result_status}</p>
                )}
              </div>
              <div className="list-actions">
                <button className="button button-primary tiny" onClick={() => performAction(recipient.id, 'accept')}>Accept</button>
                <button className="button button-secondary tiny" onClick={() => openTestScheduler(recipient)}>Schedule test</button>
                {recipient.status === 'testing_scheduled' && (
                  <button className="button button-secondary tiny" onClick={() => openTestResult(recipient)}>Send results</button>
                )}
                <button className="button button-danger tiny" onClick={() => performAction(recipient.id, 'refuse')}>Refuse</button>
                <button className="button button-danger tiny" onClick={() => remove(recipient.id)}>Delete</button>
              </div>
              {schedulingEntry === recipient.id && (
                <div className="list-row expand-row">
                  <form className="form-grid small-form" onSubmit={scheduleTest}>
                    <label>
                      Test appointment
                      <input type="datetime-local" value={appointmentDate} onChange={(evt) => setAppointmentDate(evt.target.value)} required />
                    </label>
                    <div className="button-row">
                      <button type="submit" className="button button-primary tiny">Save appointment</button>
                      <button type="button" className="button button-secondary tiny" onClick={() => setSchedulingEntry(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              {testEntry === recipient.id && (
                <div className="list-row expand-row">
                  <form className="form-grid small-form" onSubmit={submitTestResult}>
                    <label>
                      Result status
                      <select value={testResult} onChange={(evt) => setTestResult(evt.target.value)}>
                        <option value="good">Good (accept)</option>
                        <option value="bad">Bad (refuse)</option>
                      </select>
                    </label>
                    <label>
                      Result file (PDF or DOC)
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResultFile} />
                    </label>
                    <div className="button-row">
                      <button type="submit" className="button button-primary tiny">Send result</button>
                      <button type="button" className="button button-secondary tiny" onClick={() => setTestEntry(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )) : <p>No requests yet.</p>}
        </article>
      </section>
    </section>
  );
}

function MemberDashboard({ user, token, hospitals, matchResults, myEntries, refreshMatches, refreshMyEntries, updateProfile, setStatus, addToast }) {
  const [description, setDescription] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState(user.availability_status || 'available');
  const [lastDonationDate, setLastDonationDate] = useState(user.last_donation_date || '');
  const [hasDisease, setHasDisease] = useState(user.has_disease || false);
  const [diseaseDescription, setDiseaseDescription] = useState(user.disease_description || '');
  const creatingLabel = user.role === 'donor' ? 'Share your availability' : 'Create a blood request';

  const submitEntry = async (event) => {
    event.preventDefault();
    try {
      await createUserEntry({ description, hospital_id: hospitalId || undefined }, token);
      setStatus('Your request has been created. Matches will update shortly.');
      addToast('Entry added successfully.', 'success');
      setDescription('');
      setHospitalId('');
      refreshMatches();
      refreshMyEntries();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const respondToMatch = async (entryId, action) => {
    try {
      await respondToEntry(entryId, action, token);
      setStatus(action === 'confirm' ? 'Match confirmed.' : 'Match passed.');
      addToast(action === 'confirm' ? 'Match confirmed successfully.' : 'Match passed.', 'success');
      refreshMatches();
      refreshMyEntries();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        availability_status: availabilityStatus,
        last_donation_date: lastDonationDate,
        has_disease: hasDisease,
        disease_description: hasDisease ? diseaseDescription : '',
      };
      const profile = await updateProfile(payload);
      setAvailabilityStatus(profile.availability_status || 'available');
      setLastDonationDate(profile.last_donation_date || '');
      setHasDisease(profile.has_disease || false);
      setDiseaseDescription(profile.disease_description || '');
      setStatus('Profile updated successfully.');
      addToast('Profile modified successfully.', 'success');
      refreshMatches();
      refreshMyEntries();
    } catch (err) {
      setStatus(err.message);
      addToast(err.message, 'danger');
    }
  };

  return (
    <section id="overview" className="grid-2 gap-xl">
      <article className="card card-glow">
        <h2>Welcome back, {user.name || user.email}</h2>
        <div className="status-row">
          <div className="stat-block">
            <span>Role</span>
            <strong>{user.role === 'donor' ? 'Donor' : 'Person in need'}</strong>
          </div>
          <div className="stat-block">
            <span>Wilaya</span>
            <strong>{user.wilaya}</strong>
          </div>
          <div className="stat-block">
            <span>Blood type</span>
            <strong>{user.blood_type}</strong>
          </div>
          {hasDisease && (
            <div className="stat-block">
              <span>Medical condition</span>
              <strong>{diseaseDescription || 'Yes'}</strong>
            </div>
          )}
        </div>
        <p className="panel-copy">Your dashboard is tailored to your urgency and location. Keep your profile active and watch the matching panel for nearby requests.</p>
      </article>

      <article className="card card-glow">
        <h2>Availability settings</h2>
        <p className="panel-copy">Donors can update availability and last donation date. Cooldown is enforced automatically for donations within 56 days.</p>
        <form className="form-grid" onSubmit={saveProfile}>
          <label>
            Availability status
            <select value={availabilityStatus} onChange={(evt) => setAvailabilityStatus(evt.target.value)}>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="cooldown">Cooldown</option>
            </select>
          </label>
          <label>
            Last donation date
            <input type="date" value={lastDonationDate} onChange={(evt) => setLastDonationDate(evt.target.value)} />
          </label>
          <label>
            Existing medical condition?
            <input type="checkbox" checked={hasDisease} onChange={(evt) => setHasDisease(evt.target.checked)} />
          </label>
          {hasDisease && (
            <label>
              Describe your condition
              <textarea value={diseaseDescription} onChange={(evt) => setDiseaseDescription(evt.target.value)} placeholder="E.g., Hypertension, Diabetes, Surgery recovery..." rows="3" required />
            </label>
          )}
          <button className="button button-primary full-width">Save profile</button>
        </form>
      </article>

      {user.role === 'recipient' && (
        <article className="card card-glow">
          <h2>Create a blood request</h2>
          <p className="panel-copy">Create a new entry with a short situation note. The system will classify urgency automatically.</p>
          <form className="form-grid" onSubmit={submitEntry}>
            <label>
              {creatingLabel}
              <textarea value={description} onChange={(evt) => setDescription(evt.target.value)} rows="4" placeholder="Example: Surgery tomorrow, O+ needed immediately due to heavy bleeding" required />
            </label>
            <label>
              Preferred hospital (optional)
              <select value={hospitalId} onChange={(evt) => setHospitalId(evt.target.value)}>
                <option value="">Any hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>{hospital.name} — {hospital.wilaya}</option>
                ))}
              </select>
            </label>
            <button className="button button-primary full-width">Create entry</button>
          </form>
        </article>
      )}

      <article id="entries" className="card card-glow">
        <h2>My entries</h2>
        <div className="list-panel">
          {myEntries?.length ? myEntries.map((entry) => (
            <div className="list-row" key={entry.id}>
              <div>
                <strong>{entry.type === 'donor' ? 'Availability' : 'Request'}</strong>
                <p>{entry.blood_type} · {entry.wilaya} · {entry.status}</p>
                {entry.type === 'recipient' && (
                  <p className="muted-text">Priority: {entry.priority || 'standard'}{entry.description ? ` · ${entry.description}` : ''}</p>
                )}
              </div>
            </div>
          )) : <p>No entries created yet.</p>}
        </div>
      </article>
    </section>
  );
}

export default App;
