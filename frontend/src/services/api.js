/**
 * API configuration and interceptors
 */

import { handleMockRequest } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';


/**
 * Creates an axios instance with default config
 */
class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Makes an HTTP request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    if (USE_MOCKS) {
      return handleMockRequest(options.method || 'GET', endpoint, options.body ? JSON.parse(options.body) : null);
    }

    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await this.parseError(response);
        throw new Error(error.message || 'An error occurred');
      }

      // If no content (204 status), return null
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Parses error response
   * @param {Response} response - Fetch response object
   * @returns {Promise<{message: string, status: number}>} Parsed error
   */
  async parseError(response) {
    let message = 'An error occurred';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = response.statusText || message;
    }
    return { message, status: response.status };
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file using FormData
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise<any>} Response data
   */
  async uploadFile(endpoint, formData) {
    if (USE_MOCKS) {
      return handleMockRequest('POST', endpoint, { fileName: 'mock_file.jpg' });
    }
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await this.parseError(response);
        throw new Error(error.message || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const api = new ApiClient();
