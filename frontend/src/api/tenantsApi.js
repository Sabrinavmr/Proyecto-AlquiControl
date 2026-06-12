import api from './client'

export const tenantsApi = {
  list: (params = {}) => api.get('/api/tenants', { params }).then(r => r.data),
  get: (id) => api.get(`/api/tenants/${id}`).then(r => r.data),
  create: (data) => api.post('/api/tenants', data).then(r => r.data),
  update: (id, data) => api.put(`/api/tenants/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/tenants/${id}`),
}
