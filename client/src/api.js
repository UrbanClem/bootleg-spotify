import axios from 'axios';

// Demo mode: GitHub Pages can only serve static files, so there is no backend
// to talk to. When VITE_DEMO is set the app runs entirely in the browser
// against a localStorage-backed store. See src/demo/api.js.
const DEMO = import.meta.env.VITE_DEMO === 'true';

let api;

if (DEMO) {
  // The demo API already returns { data } envelopes, so it can be used
  // directly in place of the axios instance.
  const demo = await import('./demo/api');
  api = demo.default;
} else {
  api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 responses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

// Lets components branch on the mode without re-checking the env var.
api.isDemo = DEMO;

export default api;
