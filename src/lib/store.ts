import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const BACKGROUNDS = [
  { id: 'modern-house', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80', label: 'Modern House' },
  { id: 'cityscape', url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80', label: 'Cityscape' },
  { id: 'minimalist', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80', label: 'Abstract Flow' },
  { id: 'neon', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80', label: 'Neon Glow' },
  { id: 'none', url: '', label: 'Solid Color (No Image)' },
];

interface AppState {
  // UI Customization
  backgroundImage: string;
  setBackgroundImage: (url: string) => void;
  blurIntensity: string;
  setBlurIntensity: (blur: string) => void;
  glassOpacity: string;
  setGlassOpacity: (opacity: string) => void;
  
  // Super Admin Impersonation
  impersonatedCompanyId: string | null;
  setImpersonatedCompanyId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Default to modern house
      backgroundImage: BACKGROUNDS[0]?.url || '',
      setBackgroundImage: (url) => set({ backgroundImage: url }),
      
      // Default styles for iOS liquid glass
      blurIntensity: 'backdrop-blur-2xl',
      setBlurIntensity: (blur) => set({ blurIntensity: blur }),
      
      glassOpacity: 'bg-background/40',
      setGlassOpacity: (opacity) => set({ glassOpacity: opacity }),
      
      impersonatedCompanyId: null,
      setImpersonatedCompanyId: (id) => set({ impersonatedCompanyId: id }),
    }),
    {
      name: 'neon-forge-ui-settings',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
    }
  )
);
