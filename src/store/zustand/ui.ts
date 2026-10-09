import { create } from 'zustand';

interface UiState {
  /** Command palette (Cmd/Ctrl + K) is open. */
  isCommandOpen: boolean;
  /** Keyboard shortcuts help (?) is open. */
  isShortcutsOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
}

/** Small global UI state that many components need. Server data stays in React Query. */
export const useUiStore = create<UiState>((set) => ({
  isCommandOpen: false,
  isShortcutsOpen: false,
  setCommandOpen: (open) => set({ isCommandOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
}));
