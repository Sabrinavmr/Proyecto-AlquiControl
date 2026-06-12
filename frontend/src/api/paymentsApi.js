import api from './client'

export const paymentsApi = {
  list: (params = {}) => api.get('/api/payments', { params }).then(r => r.data),
  get: (id) => api.get(`/api/payments/${id}`).then(r => r.data),
  create: (data) => api.post('/api/payments', data).then(r => r.data),
  update: (id, data) => api.put(`/api/payments/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/payments/${id}`),
  markPaid: (id, data) => api.patch(`/api/payments/${id}/mark-paid`, data).then(r => r.data),
  sendReminder: (id, data) => api.post(`/api/payments/${id}/send-reminder`, data).then(r => r.data),
  dashboard: () => api.get('/api/dashboard/summary').then(r => r.data),
}
