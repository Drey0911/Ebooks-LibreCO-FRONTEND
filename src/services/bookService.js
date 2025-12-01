import { api } from './api';

export const bookService = {
  // Obtener todos los libros
  async getAllBooks(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.promocional !== undefined) params.append('promocional', filters.promocional);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return api.request(`/books?${params.toString()}`);
  },

  // Obtener libro por ID
  async getBookById(id) {
    return api.request(`/books/${id}`);
  },

  // Obtener detalles completos del libro (requiere autenticación)
  async getBookDetails(id) {
    return api.authenticatedRequest(`/books/${id}/detalles`);
  },

  // Obtener libros promocionales
  async getPromotionalBooks(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return api.request(`/books/promocionales?${params.toString()}`);
  },

  // Obtener libros por categoría
  async getBooksByCategory(categoria, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return api.request(`/books/categoria/${categoria}?${params.toString()}`);
  },

  // Buscar libros
  async searchBooks(query, filters = {}) {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    return api.request(`/books/search?${params.toString()}`);
  }
};