const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (err) {
      data = { error: 'Unable to parse server response' };
    }
  } else {
    const text = await response.text();
    data = { error: text || response.statusText || 'Request failed' };
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authLogin = (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
export const authRegister = (role, payload) => request(`/api/auth/register/${role}`, { method: 'POST', body: JSON.stringify(payload) });
export const fetchProfile = (token) => request('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
export const fetchHospitals = () => request('/api/hospitals');
export const createHospital = (payload, token) => request('/api/developer/hospitals', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
export const updateHospital = (id, payload, token) => request(`/api/developer/hospitals/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
export const deleteHospital = (id, token) => request(`/api/developer/hospitals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
export const developerHospitals = (token) => request('/api/developer/hospitals', { headers: { Authorization: `Bearer ${token}` } });
export const fetchUsers = (token) => request('/api/developer/users', { headers: { Authorization: `Bearer ${token}` } });
export const hospitalDashboard = (token) => request('/api/hospital/dashboard', { headers: { Authorization: `Bearer ${token}` } });
export const hospitalEntryCreate = (payload, token) => request('/api/hospital/entry', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
export const hospitalEntryUpdate = (id, payload, token) => request(`/api/hospital/entry/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
export const hospitalEntryDelete = (id, token) => request(`/api/hospital/entry/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
export const hospitalEntryAction = (id, action, token) => request(`/api/hospital/entry/${id}/action`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ action }) });
export const scheduleHospitalEntryTest = (id, appointment, token) => request(`/api/hospital/entry/${id}/schedule-test`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ appointment }) });
export const uploadHospitalEntryTestResult = (id, result, file, token) => {
  const formData = new FormData();
  formData.append('result', result);
  if (file) formData.append('resultFile', file);
  return fetch(`${API_BASE}/api/hospital/entry/${id}/test-result`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (response) => {
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (err) {
        data = { error: 'Unable to parse server response' };
      }
    } else {
      const text = await response.text();
      data = { error: text || response.statusText || 'Request failed' };
    }
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  });
};
export const createUserEntry = (payload, token) => request('/api/entries', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
export const fetchMyEntries = (token) => request('/api/entries/me', { headers: { Authorization: `Bearer ${token}` } });
export const respondToEntry = (id, action, token) => request(`/api/entries/${id}/respond`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ action }) });
export const updateMyProfile = (payload, token) => request('/api/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
export const fetchMatches = (token) => request('/api/match', { headers: { Authorization: `Bearer ${token}` } });
