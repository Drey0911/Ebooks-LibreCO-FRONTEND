import { api } from './api';

export const purchaseService = {
  async createPurchase(purchaseData) {
    return api.authenticatedRequest('/purchases', {
      method: 'POST',
      body: purchaseData,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },

  async getUserPurchases() {
    return api.authenticatedRequest('/purchases', {
      method: 'GET',
    });
  },

  async checkBookPurchase(libroId) {
    return api.authenticatedRequest(`/purchases/check/${libroId}`, {
      method: 'GET',
    });
  },

  async getPurchaseDetail(purchaseId) {
    return api.authenticatedRequest(`/purchases/${purchaseId}`, {
      method: 'GET',
    });
  }
};