import { api } from './api';

export const locationService = {
  detectLocation: async () => {
    try {

      const response = await api.get('/location/detect');
      return response.data;
    } catch (error) {
      console.error('Location detection failed:', error);

      return {
        ip: 'unknown',
        countryCode: 'US',
        countryName: 'United States',
        region: 'other'
      };
    }
  }
};
