
import axios from 'axios';

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // send session cookie
});


const PROTECTED_PREFIXES = [
  "/admin",
  "/pharmacy",
  "/staff",
  "/user",
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const path = window.location.pathname;
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        path.startsWith(prefix)
      );
      if (isProtected) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;