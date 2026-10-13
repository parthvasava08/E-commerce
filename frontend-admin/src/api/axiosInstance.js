import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthCall =
        url.includes("/api/admin/verify") || url.includes("/api/admin/login");
      if (!isAuthCall) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
