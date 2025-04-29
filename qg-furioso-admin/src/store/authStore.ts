import { create } from 'zustand';
import { AdminUser } from '@types';

interface AuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  
  setAdmin: (admin) => set({ 
    admin, 
    isAuthenticated: !!admin 
  }),
  
  clearAuth: () => set({ 
    admin: null, 
    isAuthenticated: false 
  }),
}));