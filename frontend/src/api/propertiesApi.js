import api from './client'

export const propertiesApi = {
  list: (params = {}) => api.get('/api/properties', { params }).then(r => r.data),
  get: (id) => api.get(`/api/properties/${id}`).then(r => r.data),
  create: (data) => api.post('/api/properties', data).then(r => r.data),
  update: (id, data) => api.put(`/api/properties/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/properties/${id}`),
}
