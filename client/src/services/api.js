import axios from 'axios';

const getApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  if (raw.endsWith('/api')) return raw;
  return `${raw.replace(/\/+$/, '')}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60s to accommodate Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('winter_arc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token only if token was invalid
      if (localStorage.getItem('winter_arc_token')) {
        localStorage.removeItem('winter_arc_token');
        localStorage.removeItem('winter_arc_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
