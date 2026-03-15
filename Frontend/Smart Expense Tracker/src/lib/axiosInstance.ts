import axios from "axios";
import authService from "./authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, 
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


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {

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

        const userId = authService.getUser()?._id;
        
        console.log("🔄 Refresh attempt - userId:", userId);
        
        if (!userId) {
          console.error("❌ Refresh failed - missing userId");
          throw new Error("User ID missing");
        }

        console.log("📤 Calling /api/auth/refresh endpoint...");
        // Refresh token is in HTTP-only cookie, automatically sent by browser
        const response = await api.post(
          `/api/auth/refresh`,
          { userId }
        );

        console.log("✅ Refresh successful!", response.status);
        const { accessToken } = response.data.data;
        authService.updateAccessToken(accessToken);

   
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("❌ Refresh FAILED:", refreshError.response?.status, refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null);
        await authService.logout();
        isRefreshing = false;
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // For other errors, if user is authenticated and token is missing, redirect to login
    if (error.response?.status === 401 && authService.isLoggedIn()) {
      await authService.logout();
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
