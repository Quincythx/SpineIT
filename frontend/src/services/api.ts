import axios from 'axios';
import type {
  AuthTokens,
  User,
  Genre,
  Review,
  Comment,
  Like,
  Bookmark,
  PaginatedResponse,
} from '../types/api';

// Set base URL to production SpineIT API or local fallback via VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spineit-api.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT access token if present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('spineit_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized by attempting JWT token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If request returns 401 and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('spineit_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/login/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem('spineit_access_token', newAccessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or blacklisted -> Clear tokens & log out
          localStorage.removeItem('spineit_access_token');
          localStorage.removeItem('spineit_refresh_token');
          localStorage.removeItem('spineit_user');
          window.dispatchEvent(new Event('spineit_auth_change'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// API Endpoint Functions
// ==========================================

export const api = {
  // --- AUTH ENDPOINTS ---
  login: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post<AuthTokens>('/auth/login/', credentials);
    return res.data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const res = await apiClient.post<User>('/auth/register/', userData);
    return res.data;
  },

  logout: async (refreshToken: string) => {
    try {
      await apiClient.post('/auth/logout/', { refresh: refreshToken });
    } finally {
      localStorage.removeItem('spineit_access_token');
      localStorage.removeItem('spineit_refresh_token');
      localStorage.removeItem('spineit_user');
    }
  },

  getProfile: async () => {
    const res = await apiClient.get<User>('/auth/profile/');
    return res.data;
  },

  updateProfile: async (data: FormData | Partial<User>) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await apiClient.patch<User>('/auth/profile/', data, { headers });
    return res.data;
  },

  // --- REVIEWS ENDPOINTS ---
  getReviews: async (params?: { search?: string; page?: number }) => {
    const res = await apiClient.get<PaginatedResponse<Review>>('/reviews/', { params });
    const results = Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
    return { ...res.data, results };
  },

  getReview: async (id: number) => {
    const res = await apiClient.get<Review>(`/reviews/${id}/`);
    return res.data;
  },

  createReview: async (formData: FormData) => {
    const res = await apiClient.post<Review>('/reviews/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateReview: async (id: number, formData: FormData) => {
    const res = await apiClient.patch<Review>(`/reviews/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteReview: async (id: number) => {
    await apiClient.delete(`/reviews/${id}/`);
  },

  // --- GENRES ENDPOINTS ---
  getGenres: async () => {
    const res = await apiClient.get<PaginatedResponse<Genre> | Genre[]>('/genres/');
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray((res.data as PaginatedResponse<Genre>).results)) {
      return (res.data as PaginatedResponse<Genre>).results;
    }
    return [];
  },

  // --- COMMENTS ENDPOINTS ---
  getComments: async (reviewId?: number) => {
    const res = await apiClient.get<PaginatedResponse<Comment> | Comment[]>('/comments/');
    const comments = Array.isArray(res.data) 
      ? res.data 
      : (res.data && Array.isArray((res.data as PaginatedResponse<Comment>).results) ? (res.data as PaginatedResponse<Comment>).results : []);
    if (reviewId) {
      return comments.filter((c) => c.review === reviewId);
    }
    return comments;
  },

  createComment: async (reviewId: number, text: string) => {
    const res = await apiClient.post<Comment>('/comments/', { review: reviewId, text });
    return res.data;
  },

  deleteComment: async (id: number) => {
    await apiClient.delete(`/comments/${id}/`);
  },

  // --- LIKES ENDPOINTS ---
  getLikes: async () => {
    const res = await apiClient.get<PaginatedResponse<Like> | Like[]>('/likes/');
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray((res.data as PaginatedResponse<Like>).results)) {
      return (res.data as PaginatedResponse<Like>).results;
    }
    return [];
  },

  addLike: async (reviewId: number) => {
    const res = await apiClient.post<Like>('/likes/', { review: reviewId });
    return res.data;
  },

  removeLike: async (likeId: number) => {
    await apiClient.delete(`/likes/${likeId}/`);
  },

  // --- BOOKMARKS ENDPOINTS ---
  getBookmarks: async () => {
    const res = await apiClient.get<PaginatedResponse<Bookmark> | Bookmark[]>('/bookmarks/');
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray((res.data as PaginatedResponse<Bookmark>).results)) {
      return (res.data as PaginatedResponse<Bookmark>).results;
    }
    return [];
  },

  addBookmark: async (reviewId: number) => {
    const res = await apiClient.post<Bookmark>('/bookmarks/', { review: reviewId });
    return res.data;
  },

  removeBookmark: async (bookmarkId: number) => {
    await apiClient.delete(`/bookmarks/${bookmarkId}/`);
  },
};
