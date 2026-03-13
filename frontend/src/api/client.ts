import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:7056' // 'https://api-staging.pollux.gg';

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore();
      auth.setUser(null);
    }
    return Promise.reject(error);
  },
);

