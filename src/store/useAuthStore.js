import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
}));

export default useAuthStore;
