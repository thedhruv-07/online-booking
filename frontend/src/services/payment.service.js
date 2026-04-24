/**
 * Payment Service - Handles payment-related operations
 */
import { api } from './api';

export const paymentService = {
  /**
   * Create a payment intent
   * @param {string} bookingId
   * @param {string} method - paypal|bank_transfer
   * @returns {Promise<{paymentId: string, clientSecret?: string, bankDetails?: Object}>}
   */
  createPayment: async (bookingId, method) => {
    const response = await api.post('/payments', { bookingId, method });
    return response;
  },

  /**
   * Get payment status
   * @param {string} paymentId
   * @returns {Promise<Payment>}
   */
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response;
  },

  /**
   * Verify PayPal payment
   * @param {string} paymentId
   * @param {string} payerId
   * @returns {Promise<{success: boolean, payment: Payment}>}
   */
  verifyPayPalPayment: async (paymentId, payerId) => {
    const response = await api.post('/payments/verify/paypal', { paymentId, payerId });
    return response;
  },

  /**
   * Confirm bank transfer
   * @param {string} paymentId
   * @param {File} receiptFile - Bank transfer receipt
   * @returns {Promise<{success: boolean}>}
   */
  confirmBankTransfer: async (paymentId, receiptFile) => {
    const formData = new FormData();
    formData.append('receipt', receiptFile);

    const response = await api.uploadFile(`/payments/${paymentId}/bank-transfer`, formData);
    return response;
  },

  /**
   * Get payment history for user
   * @param {Object} filters - Query filters
   * @returns {Promise<Payment[]>}
   */
  getPaymentHistory: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/payments?${queryParams}`);
    return response;
  },

  /**
   * Request payment refund
   * @param {string} paymentId
   * @param {string} reason
   * @returns {Promise<{success: boolean}>}
   */
  requestRefund: async (paymentId, reason) => {
    const response = await api.post(`/payments/${paymentId}/refund`, { reason });
    return response;
  },

  /**
   * [ADMIN] Get all payments in the system
   * @returns {Promise<Payment[]>}
   */
  getAllPayments: async () => {
    const response = await api.get('/admin/payments');
    return response;
  },

  /**
   * Demo successful payment
   * @param {string} bookingId
   * @returns {Promise<{success: boolean, message: string}>}
   */
  demoSuccess: async (bookingId) => {
    const response = await api.post('/payments/demo-success', { bookingId });
    return response;
  },

  /**
   * Download Invoice PDF
   * @param {string} bookingId
   */
  downloadInvoice: async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/invoice/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to download invoice');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

