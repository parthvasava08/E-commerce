import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config.url;
      const isAuthRoute =
        url.includes("/api/users/verify") ||
        url.includes("/api/users/login") ||
        url.includes("/api/users/logout") ||
        url.includes("/api/admin/verify");

      if (!isAuthRoute) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
