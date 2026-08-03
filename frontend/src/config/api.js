// API Configuration for frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id) => `/transactions/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id) => `/categories/${id}`,
  CATEGORY_STATS: (id) => `/categories/${id}/stats`,
  
  // Uploads
  UPLOADS: '/uploads',
  UPLOAD_FILE: '/uploads/file',
  UPLOAD_STATUS: (id) => `/uploads/${id}`,
  
  // Analytics
  MONTHLY_SUMMARY: (year, month) => `/analytics/monthly/${year}/${month}`,
  YEARLY_SUMMARY: (year) => `/analytics/yearly/${year}`,
  CATEGORY_TRENDS: (category) => `/analytics/trends/${category}`,
  INSIGHTS: '/analytics/insights',
  RECURRING: '/analytics/recurring',
  
  // Security
  ENCRYPT_FILE: '/security/encrypt',
  DECRYPT_FILE: '/security/decrypt',
  ACCESS_LOGS: '/security/audit-logs',
}

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_CONFIG
}
