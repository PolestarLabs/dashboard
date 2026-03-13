import { defineStore } from 'pinia';
import { getMe, logout, type AuthUser } from '@/api';

interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    initialized: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async fetchMe() {
      try {
        const user = await getMe();
        this.user = user;
      } finally {
        this.initialized = true;
      }
    },
    async logout() {
      await logout();
      this.user = null;
      this.initialized = true;
    },
    setUser(user: AuthUser | null) {
      this.user = user;
    },
  },
});

