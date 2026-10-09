'use client';

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { LayoutAction, LayoutState } from '@/types/layout';

const initialState: LayoutState = {
  isLeftSidebarOpen: true,
  isRightSidebarOpen: false,
  isMobileNavOpen: false,
};

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'TOGGLE_LEFT_SIDEBAR':
      return { ...state, isLeftSidebarOpen: !state.isLeftSidebarOpen };
    case 'TOGGLE_RIGHT_SIDEBAR':
      return { ...state, isRightSidebarOpen: !state.isRightSidebarOpen };
    case 'SET_LEFT_SIDEBAR':
      return { ...state, isLeftSidebarOpen: action.payload };
    case 'SET_RIGHT_SIDEBAR':
      return { ...state, isRightSidebarOpen: action.payload };
    case 'SET_MOBILE_NAV':
      return { ...state, isMobileNavOpen: action.payload };
    default:
      return state;
  }
}

interface LayoutContextValue {
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Actions never change identity, so they are safe in effect dependency arrays.
  const actions = useMemo(
    () => ({
      toggleLeftSidebar: () => dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' }),
      toggleRightSidebar: () => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' }),
      setMobileNavOpen: (open: boolean) => dispatch({ type: 'SET_MOBILE_NAV', payload: open }),
    }),
    [],
  );
  const value = useMemo<LayoutContextValue>(() => ({ state, dispatch, ...actions }), [state, actions]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within a LayoutProvider');
  return context;
}
