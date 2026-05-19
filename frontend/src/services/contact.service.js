import { api } from './api';

export const contactService = {
  getContacts: async () => {
    const response = await api.get('/user/contacts');
    return Array.isArray(response) ? response : (response?.data ?? []);
  },

  createContact: async ({ name, email, phone, designation }) => {
    const response = await api.post('/user/contacts', { name, email, phone, designation });
    return response?.data ?? response;
  },
};
