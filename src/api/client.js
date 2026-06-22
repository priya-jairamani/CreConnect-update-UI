import axios from 'axios';
import { getMockApiResponse } from '@/utils/mockApiData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request: attach access token ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: auto-refresh on 401 ────────────────────────────────────
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  queue = [];
};

function buildError(error) {
  // No response at all = server offline / CORS / DNS
  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED';
    return {
      message: isTimeout
        ? 'Request timed out. The server may be starting up — please try again.'
        : 'Cannot connect to server. Make sure the backend is running on port 5000.',
      offline: true,
    };
  }
  // Server responded with an error status
  const body = error.response.data;
  return {
    message: body?.message || body?.error || error.message || 'Something went wrong',
    status:  error.response.status,
    data:    body,
  };
}

api.interceptors.response.use(
  // Unwrap the standard { success, data, timestamp } envelope
  (res) => res.data?.data !== undefined ? { ...res, data: res.data.data } : res,
  async (error) => {
    const original = error.config;

    // Demo mode: backend unreachable — serve mock data instead of erroring out
    if (!error.response && localStorage.getItem('cc_demo_mode') === 'true') {
      const mock = getMockApiResponse(original.method, original.url);
      if (mock.data !== null) return Promise.resolve(mock);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const userId       = localStorage.getItem('userId');
      const refreshToken = localStorage.getItem('refreshToken');

      if (userId && refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { userId, refreshToken });
          const payload = res.data?.data || res.data;
          const accessToken = payload?.accessToken;
          const newRefresh  = payload?.refreshToken;
          if (!accessToken || !newRefresh) throw new Error('Invalid refresh response');
          localStorage.setItem('accessToken',  accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          processQueue(null, accessToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        } catch (err) {
          processQueue(err, null);
          ['accessToken', 'refreshToken', 'userId', 'cc_user'].forEach((k) => localStorage.removeItem(k));
          window.location.href = '/login';
        } finally {
          isRefreshing = false;
        }
      } else {
        ['accessToken', 'refreshToken', 'userId', 'cc_user'].forEach((k) => localStorage.removeItem(k));
        window.location.href = '/login';
      }
    }

    return Promise.reject(buildError(error));
  },
);

export default api;
