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
        const refreshToken = authService.getRefreshToken();
        
        console.log("🔄 Refresh attempt - userId:", userId, "refreshToken exists:", !!refreshToken);
        
        if (!userId || !refreshToken) {
          console.error("❌ Refresh failed - missing userId or refreshToken");
          throw new Error("User ID or refresh token missing");
        }

        console.log("📤 Calling /api/auth/refresh endpoint...");

        const response = await api.post(
          `/api/auth/refresh`,
          { userId, refreshToken }
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

    if (error.response?.status === 401 && authService.isLoggedIn()) {
      await authService.logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
