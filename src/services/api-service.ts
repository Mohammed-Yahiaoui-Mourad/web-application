/**
 * API Service Layer for AMAL Web Application
 * Provides domain-specific methods for all API endpoints
 */

import { apiClient, ApiResponse } from './api-client';

// ==================== Types ====================

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface DonorProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  blood_type: string;
  latitude: number;
  longitude: number;
  is_available: boolean;
  last_donation: string | null;
  wilaya: string;
  address: string;
  occupation: string;
  age: number;
  gender: string;
  total_donations: number;
  notes: string;
  preferred_contact: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  department: string;
  blood_type: string;
  units_needed: number;
  donors_confirmed: number;
  procedure: string;
  status: 'pending' | 'active' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
  required_by: string;
  created_at: string;
  attending_physician: string;
  requested_by: string;
  room: string;
  contact_phone: string;
  notes: string;
}

export interface DashboardStats {
  users: {
    total: number;
    admins: number;
    donors: number;
    available_donors: number;
  };
  requests: {
    total: number;
    pending: number;
    partially_fulfilled: number;
    fulfilled: number;
  };
  schedules: {
    total: number;
    upcoming: number;
    completed: number;
  };
}

export interface DonationSchedule {
  id: string;
  donor_id: string;
  request_id: string | null;
  scheduled_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

// ==================== Authentication Service ====================

export const authService = {
  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    is_donor?: boolean;
    blood_type?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<User> {
    return apiClient.post<User>('/api/auth/register', data);
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return apiClient.post<LoginResponse>('/api/auth/login', formData);
  },

  /**
   * Store authentication token
   */
  setToken(token: string): void {
    apiClient.setToken(token);
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return apiClient.getToken();
  },

  /**
   * Clear authentication token (logout)
   */
  logout(): void {
    apiClient.clearToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },
};

// ==================== Admin Dashboard Service ====================

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/admin/dashboard');
  },

  /**
   * Get all blood requests
   */
  async getRequests(status?: string): Promise<BloodRequest[]> {
    const endpoint = status ? `/api/admin/requests?status_filter=${status}` : '/api/admin/requests';
    return apiClient.get<BloodRequest[]>(endpoint);
  },

  /**
   * Get all donors
   */
  async getDonors(): Promise<DonorProfile[]> {
    return apiClient.get<DonorProfile[]>('/api/admin/donors');
  },

  /**
   * Get all appointments/schedules
   */
  async getAppointments(): Promise<DonationSchedule[]> {
    return apiClient.get<DonationSchedule[]>('/api/admin/appointments');
  },

  /**
   * Broadcast alert to donors for a blood request
   */
  async broadcastTodonors(requestId: string): Promise<any> {
    return apiClient.post(`/api/admin/requests/${requestId}/broadcast`, {});
  },

  /**
   * Update blood request status
   */
  async updateRequestStatus(requestId: string, status: string): Promise<BloodRequest> {
    return apiClient.patch<BloodRequest>(`/api/admin/requests/${requestId}/status`, {
      status,
    });
  },

  /**
   * Run auto-scheduling for matching donors to requests
   */
  async runAutoScheduling(): Promise<any> {
    return apiClient.post('/api/admin/run-auto-scheduling', {});
  },
};

// ==================== Donor Service ====================

export const donorService = {
  /**
   * Get current user's donor profile
   */
  async getProfile(): Promise<DonorProfile> {
    return apiClient.get<DonorProfile>('/api/donations/profile');
  },

  /**
   * Update donor availability status
   */
  async updateAvailability(isAvailable: boolean): Promise<DonorProfile> {
    return apiClient.patch<DonorProfile>('/api/donations/profile/availability', {
      is_available: isAvailable,
    });
  },

  /**
   * Get donor's scheduled appointments
   */
  async getMyAppointments(): Promise<DonationSchedule[]> {
    return apiClient.get<DonationSchedule[]>('/api/donations/my-appointments');
  },

  /**
   * Schedule a new donation appointment
   */
  async scheduleAppointment(data: {
    scheduled_date: string;
    request_id?: string;
    notes?: string;
  }): Promise<DonationSchedule> {
    return apiClient.post<DonationSchedule>('/api/donations/schedule', data);
  },
};

// ==================== Blood Requests Service ====================

export const requestService = {
  /**
   * Get all blood requests (public)
   */
  async getRequests(): Promise<BloodRequest[]> {
    return apiClient.get<BloodRequest[]>('/api/requests');
  },

  /**
   * Get a specific blood request
   */
  async getRequest(id: string): Promise<BloodRequest> {
    return apiClient.get<BloodRequest>(`/api/requests/${id}`);
  },

  /**
   * Create a new blood request (admin only)
   */
  async createRequest(data: any): Promise<BloodRequest> {
    return apiClient.post<BloodRequest>('/api/requests', data);
  },

  /**
   * Update a blood request
   */
  async updateRequest(id: string, data: any): Promise<BloodRequest> {
    return apiClient.patch<BloodRequest>(`/api/requests/${id}`, data);
  },
};

// ==================== Notifications Service ====================

export const notificationService = {
  /**
   * Get user notifications
   */
  async getNotifications(): Promise<any[]> {
    return apiClient.get<any[]>('/api/notifications');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${notificationId}`, { read: true });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/notifications/mark-all-read', {});
  },
};
