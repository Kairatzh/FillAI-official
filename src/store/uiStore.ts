import { create } from 'zustand';

interface UIState {
  cursorPosition: { x: number; y: number };
  panelVisible: boolean;
  panelPosition: { x: number; y: number };
  searchQuery: string;
  currentPage: 'graph' | 'library' | 'community' | 'profile';
  sidebarOpen: boolean;
  setCursorPosition: (x: number, y: number) => void;
  showPanel: (x: number, y: number) => void;
  hidePanel: () => void;
  updatePanelPosition: (x: number, y: number) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: 'graph' | 'library' | 'community' | 'profile') => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cursorPosition: { x: 0, y: 0 },
  panelVisible: false,
  panelPosition: { x: 0, y: 0 },
  searchQuery: '',
  currentPage: 'graph',
  sidebarOpen: true,

  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),

  showPanel: (x, y) =>
    set({
      panelVisible: true,
      panelPosition: { x, y },
    }),

  hidePanel: () => set({ panelVisible: false }),

  updatePanelPosition: (x, y) => set({ panelPosition: { x, y } }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
