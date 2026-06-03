/**
 * Auto-login utility for development environment
 * Automatically logs in using tokens from .env.local
 */

export const AutoLoginConfig = {
  /**
   * Get auto-login token based on role
   */
  getToken(role: 'admin' | 'donor' = 'admin'): string | null {
    if (!import.meta.env.VITE_AUTO_LOGIN) {
      return null
    }

    if (role === 'admin') {
      return import.meta.env.VITE_ADMIN_TOKEN || null
    } else {
      return import.meta.env.VITE_DONOR_TOKEN || null
    }
  },

  /**
   * Check if auto-login is enabled
   */
  isEnabled(): boolean {
    return import.meta.env.VITE_AUTO_LOGIN === 'true' || import.meta.env.VITE_AUTO_LOGIN === true
  },

  /**
   * Get the role to auto-login with
   */
  getAutoLoginRole(): 'admin' | 'donor' {
    const role = import.meta.env.VITE_AUTO_LOGIN_ROLE
    return role === 'donor' ? 'donor' : 'admin'
  },

  /**
   * Check if we should enable mock data
   */
  shouldUseMockData(): boolean {
    return import.meta.env.DEV && !this.getToken()
  },
}

/**
 * Mock user data for development without real tokens
 */
export const MOCK_USERS = {
  admin: {
    email: 'admin@amal.org',
    id: 'admin-1',
    full_name: 'Admin User',
    role: 'admin_hopital',  // Use admin_hopital for proper routing
    phone_number: '+1234567890',
  },
  donor: {
    email: 'donor1@amal.org',
    id: 'donor-1',
    full_name: 'Test Donor',
    role: 'user',
    phone_number: '+1234567891',
  },
}

/**
 * Initialize auto-login on app startup
 */
export async function initializeAutoLogin() {
  if (!AutoLoginConfig.isEnabled()) {
    return
  }

  const token = AutoLoginConfig.getToken()
  if (token) {
    localStorage.setItem('access_token', token)
    console.log('✅ [AUTO-LOGIN] Logged in with role:', AutoLoginConfig.getAutoLoginRole())
    return true
  }

  return false
}

/**
 * Setup auto-login for the provided role
 */
export function setupAutoLogin(role: 'admin' | 'donor' = 'admin'): void {
  const token = AutoLoginConfig.getToken(role)
  if (token) {
    localStorage.setItem('access_token', token)
    localStorage.setItem('auto_login_role', role)
    console.log(`✅ Auto-login enabled for ${role}`)
  } else {
    console.warn(`⚠️ No token configured for ${role}. Run backend setup_dev.py to generate tokens.`)
  }
}
