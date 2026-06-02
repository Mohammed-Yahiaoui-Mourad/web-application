export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'admin@amal.org',
  full_name: 'Admin Test',
  first_name: 'Admin',
  last_name: 'Test',
  role: 'admin_hopital',
  hopital_id: 'mock-hospital-id',
  region: 'Alger'
};

export const MOCK_STATS = {
  users: {
    total: 1250,
    admins: 45,
    donors: 850,
    available_donors: 320,
    patients: 355
  },
  requests: {
    total: 124,
    pending: 12,
    partially_fulfilled: 8,
    fulfilled: 104
  },
  schedules: {
    total: 450,
    upcoming: 24,
    completed: 426
  },
  hospitals: {
    total: 18
  }
};

export const MOCK_DONORS = [
  { id: 'd-1', full_name: 'Ahmed Benali', blood_type: 'O+', phone: '0555123456', last_donation: '2024-03-15', wilaya: 'Alger', age: 28, gender: 'M', email: 'ahmed@email.com', total_donations: 5 },
  { id: 'd-2', full_name: 'Sara Mansouri', blood_type: 'A-', phone: '0555987654', last_donation: '2024-01-20', wilaya: 'Oran', age: 34, gender: 'F', email: 'sara@email.com', total_donations: 8 },
  { id: 'd-3', full_name: 'Yacine Brahimi', blood_type: 'B+', phone: '0555667788', last_donation: '2024-04-02', wilaya: 'Setif', age: 22, gender: 'M', email: 'yacine@email.com', total_donations: 2 },
  { id: 'd-4', full_name: 'Lina Kassim', blood_type: 'O-', phone: '0555112233', last_donation: '2023-11-12', wilaya: 'Alger', age: 29, gender: 'F', email: 'lina@email.com', total_donations: 4 },
  { id: 'd-5', full_name: 'Mourad Slimani', blood_type: 'AB+', phone: '0555445566', last_donation: '2024-05-10', wilaya: 'Alger', age: 41, gender: 'M', email: 'mourad@email.com', total_donations: 12 },
];

export const MOCK_APPOINTMENTS = [
  {
    id: 'app-1',
    donor_id: 'd-1',
    donor_name: 'Ahmed Benali',
    blood_type: 'O+',
    scheduled_time: new Date().toISOString(), // Today
    status: 'scheduled',
    request_id: 'req-1'
  },
  {
    id: 'app-2',
    donor_id: 'd-3',
    donor_name: 'Yacine Brahimi',
    blood_type: 'B+',
    scheduled_time: new Date(Date.now() + 3600000 * 2).toISOString(), // In 2 hours
    status: 'scheduled',
    request_id: 'req-3'
  },
  {
    id: 'app-3',
    donor_id: 'd-5',
    donor_name: 'Mourad Slimani',
    blood_type: 'AB+',
    scheduled_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'scheduled',
    request_id: 'req-5'
  },
  {
    id: 'app-4',
    donor_id: 'd-2',
    donor_name: 'Sara Mansouri',
    blood_type: 'A-',
    scheduled_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'completed',
    units_donated: 1,
    request_id: 'req-2'
  }
];

export const MOCK_REQUESTS = [
  {
    id: 'req-1',
    status: 'active',
    blood_type: 'O+',
    urgency_level: 'critical',
    severity: 'critical',
    required_units: 3,
    units_needed: 3,
    donors_confirmed: 1,
    patient_id: 'p-1',
    patient_name: 'Mohamed Brahimi',
    hopital_id: 'mock-hospital-id',
    hospital_name: 'CHU Mustapha Pacha',
    created_at: new Date().toISOString()
  },
  {
    id: 'req-2',
    status: 'active',
    blood_type: 'A-',
    urgency_level: 'high',
    severity: 'high',
    required_units: 2,
    units_needed: 2,
    donors_confirmed: 0,
    patient_id: 'p-2',
    patient_name: 'Fatima Zohra',
    hopital_id: 'mock-hospital-id',
    hospital_name: 'CHU Mustapha Pacha',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'req-3',
    status: 'partially_fulfilled',
    blood_type: 'B+',
    urgency_level: 'medium',
    severity: 'normal',
    required_units: 5,
    units_needed: 2,
    donors_confirmed: 3,
    patient_id: 'p-3',
    patient_name: 'Amine Kasmi',
    hopital_id: 'mock-hospital-id',
    hospital_name: 'CHU Mustapha Pacha',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'req-4',
    status: 'fulfilled',
    blood_type: 'O-',
    urgency_level: 'critical',
    severity: 'critical',
    required_units: 1,
    units_needed: 0,
    donors_confirmed: 1,
    patient_id: 'p-4',
    patient_name: 'Karima Benali',
    hopital_id: 'mock-hospital-id',
    hospital_name: 'CHU Mustapha Pacha',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const MOCK_HOSPITALS = [
  { id: 'mock-hospital-id', name: 'CHU Mustapha Pacha', region: 'Alger', address: 'Place du 1er Mai' },
  { id: 'h-2', name: 'EPH Bologhine', region: 'Alger', address: 'Bologhine' },
  { id: 'h-3', name: 'CHU 1er Novembre', region: 'Oran', address: 'Bir El Djir' }
];

export const MOCK_RESPONSES: Record<string, any> = {
  '/api/auth/login': { access_token: 'mock-token', token_type: 'bearer' },
  '/api/auth/me': MOCK_USER,
  '/api/admin/dashboard': MOCK_STATS,
  '/api/admin/requests': MOCK_REQUESTS,
  '/api/admin/hospitals': MOCK_HOSPITALS,
  '/api/admin/force-match': { data: 5 },
  '/api/auth/profile': MOCK_USER,
  '/api/admin/appointments': MOCK_APPOINTMENTS,
  '/api/admin/donors': MOCK_DONORS,
};
