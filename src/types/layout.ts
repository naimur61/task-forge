export interface LayoutState {
  /** Desktop left sidebar expanded (true) or collapsed to icons (false). */
  isLeftSidebarOpen: boolean;
  /** Right-hand panel visible. */
  isRightSidebarOpen: boolean;
  /** Mobile navigation drawer visible. */
  isMobileNavOpen: boolean;
}

export type LayoutAction =
  | { type: 'TOGGLE_LEFT_SIDEBAR' }
  | { type: 'TOGGLE_RIGHT_SIDEBAR' }
  | { type: 'SET_LEFT_SIDEBAR'; payload: boolean }
  | { type: 'SET_RIGHT_SIDEBAR'; payload: boolean }
  | { type: 'SET_MOBILE_NAV'; payload: boolean };
