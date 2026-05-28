import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const PUBLIC_ENDPOINTS = [
  '/auth/login/',
  '/auth/register/',
  '/auth/verify-email/',
  '/auth/resend-verification/',
  '/auth/password-reset/',
  '/auth/password-reset/confirm/',
  '/auth/token/refresh/',
];

const isPublicEndpoint = (url) =>
  PUBLIC_ENDPOINTS.some((e) => url?.includes(e));

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !isPublicEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      // Public endpointlerde (login, register vb.) refresh/alert/redirect yapma
      if (isPublicEndpoint(original.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber(token => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) throw new Error('no refresh token');

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/token/refresh/`,
          { refresh }
        );

        localStorage.setItem('accessToken', data.access);
        if (data.refresh) localStorage.setItem('refreshToken', data.refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
        onRefreshed(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        isRefreshing = false;

        return api(original);
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        // Zaten login sayfasındaysa alert + redirect yapma
        if (window.location.pathname !== '/login') {
          alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapınız.');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// User endpoints
export const searchUsers = (query) => api.get('/users/', { params: { search: query } });
export const getUserProfile = (username) => api.get(`/users/${username}/`);
export const getMe = () => api.get('/users/me/');
export const updateAvatar = (animal) => api.patch('/users/me/', { animal_avatar: animal });
export const deactivateAccount = () => api.delete('/users/me/');
export const reactivateAccount = (email, password) => api.post('/users/reactivate/', { email, password });

// Follow endpoints
export const followUser = (username) => api.post(`/follows/${username}/follow/`);
export const unfollowUser = (username) => api.delete(`/follows/${username}/follow/`);
export const getFollowers = (username) => api.get(`/follows/${username}/followers/`);
export const getFollowing = (username) => api.get(`/follows/${username}/following/`);

// Post endpoints
export const getFeed = () => api.get('/posts/feed/');
export const createPost = (content) => api.post('/posts/', { content });
export const updatePost = (id, content) => api.patch(`/posts/${id}/`, { content });
export const deletePost = (id) => api.delete(`/posts/${id}/`);
export const repostPost = (id) => api.post(`/posts/${id}/repost/`);
export const getUserPosts = (username) => api.get(`/posts/user/${username}/`);
export const getUserReposts = (username) => api.get(`/posts/user/${username}/reposts/`);

// Report endpoints
export const reportPost = (postId, reason) => api.post('/reports/reports/', { post: postId, reason });

// Admin endpoints
export const getAdminStats = () => api.get('/reports/admin/stats/');
export const getAdminPostStats = (startDate, endDate) => api.get('/reports/admin/stats/posts/', { params: { start_date: startDate, end_date: endDate } });
export const getAdminReportedPosts = () => api.get('/reports/admin/reports/');
export const resolveReport = (reportId) => api.patch(`/reports/admin/reports/${reportId}/resolve/`);
export const dismissReport = (reportId) => api.delete(`/reports/admin/reports/${reportId}/dismiss/`);
export const getAdminUsers = (search) => api.get('/reports/admin/users/', { params: { search } });
export const banUser = (username, days) => api.post(`/reports/admin/users/${username}/ban/`, { days });
export const unbanUser = (username) => api.post(`/reports/admin/users/${username}/unban/`);
export const deactivatePost = (postId) => api.patch(`/reports/admin/posts/${postId}/deactivate/`);
export const activatePost = (postId) => api.patch(`/reports/admin/posts/${postId}/activate/`);
export const getAdminAuditLog = () => api.get('/reports/admin/audit-log/');

export default api;
