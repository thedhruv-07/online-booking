/**
 * Upload Service - Handles file uploads
 */
import { api } from './api';

export const uploadService = {
  /**
   * Upload a single file
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<{id: string, url: string, name: string}>}
   */
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.uploadFile('/upload/file', formData, onProgress);
    return response;
  },

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array<{id: string, url: string, name: string}>>}
   */
  uploadMultipleFiles: async (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.uploadFile('/upload/files', formData, onProgress);
    return response;
  },

  /**
   * Upload booking document (PDF, etc.)
   * @param {File} document - Document file
   * @param {string} bookingId - Associated booking ID
   * @returns {Promise<{id: string, url: string}>}
   */
  uploadBookingDocument: async (document, bookingId) => {
    const formData = new FormData();
    formData.append('document', document);
    formData.append('bookingId', bookingId);

    const response = await api.uploadFile('/upload/booking', formData);
    return response;
  },

  /**
   * Delete uploaded file
   * @param {string} fileId
   * @returns {Promise<{success: boolean}>}
   */
  deleteFile: async (fileId) => {
    const response = await api.delete(`/upload/file/${fileId}`);
    return response;
  },

  /**
   * Get uploaded files for a booking
   * @param {string} bookingId
   * @returns {Promise<Array<{id: string, name: string, url: string, size: number}>>}
   */
  getBookingFiles: async (bookingId) => {
    const response = await api.get(`/upload/booking/${bookingId}`);
    return response;
  },

  /**
   * Validate file before upload
   * @param {File} file
   * @param {Object} config - Validation config
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateFile: (file, config = {}) => {
    const maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = config.allowedTypes || [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed',
      };
    }

    return { valid: true };
  },
};
