import { api } from './api';

export const factoryService = {
  getFactories: async () => {
    const response = await api.get('/user/factories');

    return Array.isArray(response) ? response : (response?.data ?? []);
  },

  createFactory: async ({ name, location, phone }) => {
    const response = await api.post('/user/factories', { name, location, phone });
    return response?.data ?? response;
  },
};
