/**
 * Booking Service - Handles booking-related API calls
 */
import { api } from './api';

/**
 * @typedef {import('../types')} */

export const bookingService = {
  /**
   * Create a new booking
   * @param {Object} bookingData - Complete booking data
   * @returns {Promise<Booking>}
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response;
  },

  /**
   * Get user's bookings
   * @param {Object} filters - Query filters
   * @returns {Promise<Booking[]>}
   */
  getBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/bookings?${queryParams}`);
    return response;
  },

  /**
   * Get single booking by ID
   * @param {string} bookingId
   * @returns {Promise<Booking>}
   */
  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response;
  },

  /**
   * Update booking (draft only)
   * @param {string} bookingId
   * @param {Object} updates
   * @returns {Promise<Booking>}
   */
  updateBooking: async (bookingId, updates) => {
    const response = await api.put(`/bookings/${bookingId}`, updates);
    return response;
  },

  /**
   * Cancel booking
   * @param {string} bookingId
   * @returns {Promise<{success: boolean}>}
   */
  cancelBooking: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response;
  },

  /**
   * Get booking summary/quote
   * @param {Object} bookingData - Partial booking data for quote
   * @returns {Promise<{totalAmount: number, breakdown: Object}>}
   */
  getQuote: async (bookingData) => {
    const response = await api.post('/bookings/quote', bookingData);
    return response;
  },

  /**
   * Validate booking steps
   * @param {Object} stepData - Current step data
   * @param {string} step - Step identifier
   * @returns {Promise<{valid: boolean, errors?: Object}>}
   */
  validateStep: async (stepData, step) => {
    const response = await api.post(`/bookings/validate/${step}`, stepData);
    return response;
  },

  /**
   * [ADMIN] Get all bookings in the system
   * @returns {Promise<Booking[]>}
   */
  getAllBookings: async () => {
    const response = await api.get('/admin/bookings');
    return response;
  },

  /**
   * [ADMIN] Get high-level system statistics
   * @returns {Promise<Object>}
   */
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response;
  },
};

