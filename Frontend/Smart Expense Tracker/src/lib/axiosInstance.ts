import axios from "axios";
import authService from "./authService";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Allow cookies (refreshToken) to be sent/received
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor: handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not a refresh request, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        authService.updateAccessToken(accessToken);

        // Update the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.logout();
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For other errors, if user is authenticated and token is missing, redirect to login
    if (error.response?.status === 401 && authService.isLoggedIn()) {
      authService.logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Request interceptor: Add access token to headers
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
