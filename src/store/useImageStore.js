import { create } from 'zustand';

const useImageStore = create((set) => ({
  // Loading states
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Generated image
  generatedImage: null,
  setGeneratedImage: (generatedImage) => set({ generatedImage }),
  
  // Error state
  error: null,
  setError: (error) => set({ error }),
  
  // Reset state
  resetState: () => set({ 
    isLoading: false, 
    generatedImage: null, 
    error: null 
  }),
}));

export default useImageStore;
