import { create } from 'zustand';

/**
 * UI Store - Manages global UI state like sidebar, modals, etc.
 */
const useUIStore = create((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
}));

export default useUIStore;
