/**
 * Auth Service - Handles authentication-related API calls
 */
import { api } from './api';

/**
 * @typedef {import('../types')} */

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: User, token: string}>}
 */
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  /**
   * Register new user
   * @param {Object} userData - { name, email, password, phone? }
   * @returns {Promise<{user: User, token: string}>}
   */
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response;
  },

  /**
   * Verify email with token
   * @param {string} token
   * @returns {Promise<{success: boolean}>}
   */
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response;
  },

  /**
   * Get current user profile
   * @returns {Promise<User>}
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response;
  },

  /**
   * Refresh access token
   * @returns {Promise<{token: string}>}
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response;
  },

  /**
   * Logout current session
   * @returns {Promise<void>}
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise<{success: boolean}>}
   */
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<{success: boolean}>}
   */
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, password: newPassword });
    return response;
  },

  /**
   * [ADMIN] Get list of all users
   * @returns {Promise<User[]>}
   */
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response;
  },

  /**
   * Resend verification email
   * @param {string} email
   * @returns {Promise<{success: boolean}>}
   */
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response;
  },
};

