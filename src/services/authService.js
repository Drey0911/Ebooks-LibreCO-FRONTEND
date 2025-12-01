import { api } from './api';

export const authService = {
  async login(email, password) {
    return api.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async register(userData) {
    return api.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  async logout() {
    return api.authenticatedRequest('/auth/logout', {
      method: 'POST',
    });
  },
};