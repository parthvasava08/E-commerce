import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isVerify = error.config.url.includes("/api/admin/verify");
      if (!isVerify) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
