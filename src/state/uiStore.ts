import { create } from 'zustand';
import type { ToastMessage } from '@/domain/types';

interface UIStore {
  drawerOpen: boolean;
  toasts: ToastMessage[];
  setDrawer: (o: boolean) => void;
  showToast: (t: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  drawerOpen: false,
  toasts: [],
  setDrawer: (o) => set({ drawerOpen: o }),
  showToast: (t) => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { id, ...t }] });
    setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) })
}));

export function toast(text: string, kind: ToastMessage['kind'] = 'success') {
  useUIStore.getState().showToast({ text, kind });
}
