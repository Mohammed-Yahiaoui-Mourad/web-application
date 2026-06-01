import { useState } from 'react';
import logo from './assets/amal-logo.jpg';

export default function SignIn({ onLogin, onRegister, switchView, status, hospitals = [] }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'donor', wilaya: '', blood_type: '', phone: '', hospital_id: '' });

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: key === 'has_disease' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        disease_description: form.disease_description || '',
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <img src={logo} alt="Amal" className="auth-hero-logo" />
          <div className="auth-hero">
            <h2>Amal — Save Lives</h2>
            <p>Fast donor matching · Hospital coordination · Real-time updates</p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">💓</div>
              <div className="auth-feature-text">
                <div className="auth-feature-title">Match donors fast</div>
                <div className="auth-feature-desc">Find matching donors in minutes.</div>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon">🏥</div>
              <div className="auth-feature-text">
                <div className="auth-feature-title">Trusted hospitals</div>
                <div className="auth-feature-desc">Coordinate directly with hospital staff.</div>
              </div>
            </div>
          </div>

          <div className="auth-footer-text">Join our community and help save lives.</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
            <p>{mode === 'login' ? 'Sign in to continue' : 'Join and start saving lives today'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="auth-form-group">
                <label className="auth-form-label">Full name</label>
                <input className="auth-form-input" value={form.name} onChange={onChange('name')} placeholder="Jane Doe" required />
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-form-label">Email</label>
              <input type="email" className="auth-form-input" value={form.email} onChange={onChange('email')} placeholder="you@email.com" required />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">Password</label>
              <input type="password" className="auth-form-input" value={form.password} onChange={onChange('password')} placeholder="••••••••" required />
            </div>

            <button className="auth-form-button" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>

            {status && <div className="auth-status">{status}</div>}

            <div className="auth-toggle-link">
              <p>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</p>
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Sign in'}</button>
            </div>

            <div className="auth-developer-info">
              Demo: dev@admin.local · Dev@2026
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
