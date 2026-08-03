import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const http = axios.create({ baseURL: BASE, timeout: 30000 })

http.interceptors.response.use(
  r => r.data,
  e => Promise.reject(e)
)

const ApiService = {
  checkHealth: () => http.get('/health'),

  // Transactions
  getTransactions:    (p)       => http.get('/transactions', { params: p }),
  getTransaction:     (id)      => http.get(`/transactions/${id}`),
  updateTransaction:  (id, d)   => http.put(`/transactions/${id}`, d),
  deleteTransaction:  (id)      => http.delete(`/transactions/${id}`),

  // Categories
  getCategories:    ()        => http.get('/categories'),
  getCategory:      (id)      => http.get(`/categories/${id}`),
  createCategory:   (d)       => http.post('/categories', d),
  updateCategory:   (id, d)   => http.put(`/categories/${id}`, d),
  deleteCategory:   (id)      => http.delete(`/categories/${id}`),
  getCategoryStats: (id)      => http.get(`/categories/${id}/stats`),

  // Uploads
  getUploads: () => http.get('/uploads'),
  uploadFile: (file, password = null) => {
    const form = new FormData()
    form.append('file', file)
    if (password) form.append('password', password)
    return http.post('/uploads/file', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getUploadStatus: (id) => http.get(`/uploads/${id}`),

  // Analytics
  getMonthlySummary:        (y, m)    => http.get(`/analytics/monthly/${y}/${m}`),
  getYearlySummary:         (y)       => http.get(`/analytics/yearly/${y}`),
  getCategoryTrends:        (cat)     => http.get(`/analytics/trends/${cat}`),
  getInsights:              ()        => http.get('/analytics/insights'),
  getRecurringTransactions: ()        => http.get('/analytics/recurring'),

  // Security
  getAuditLogs: (p) => http.get('/security/audit-logs', { params: p }),
}

export default ApiService
