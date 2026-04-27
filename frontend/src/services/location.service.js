import { api } from './api';

export const locationService = {
  detectLocation: async () => {
    try {
      // Use the new backend location route
      const response = await api.get('/location/detect');
      return response.data;
    } catch (error) {
      console.error('Location detection failed:', error);
      // Fallback
      return {
        ip: 'unknown',
        countryCode: 'US',
        countryName: 'United States',
        region: 'other'
      };
    }
  }
};
