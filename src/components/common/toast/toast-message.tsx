'use client';

import toast, { ToastOptions } from 'react-hot-toast';
import { LabelAndPlaceholderTextFormat } from '@/lib/utils';
import { ToastMessageChange } from './custom-message';

/**
 * Available toast notification types
 */
type ToastType = 'success' | 'error' | 'loading' | 'custom';

/**
 * Extended toast options including custom flags
 */
type ExtendedToastOptions = ToastOptions & {
  textFormat?: boolean;
  changeMessage?: boolean;
};

/**
 * Default toast configuration
 */
const defaultOptions: ExtendedToastOptions = {
  duration: 3000,
  position: 'top-center',
  textFormat: true,
  changeMessage: false,
};

/**
 * ToastMessageShow — Unified toast notification system.
 *
 * Supports:
 * - Success / Error / Loading / Custom types
 * - Extracts messages from API error responses
 * - Optional message transformation via ToastMessageChange
 * - Optional text case formatting
 *
 * @example
 * ToastMessageShow('success', 'Profile updated successfully');
 * ToastMessageShow('error', apiErrorResponse);
 * ToastMessageShow('loading', 'Saving...', { textFormat: false });
 */
export const ToastMessageShow = (
  type: ToastType,
  message: any,
  options: ExtendedToastOptions = {},
) => {
  const { textFormat, changeMessage, ...toastOptions } = {
    ...defaultOptions,
    ...options,
  };

  const MessageHandler = (msg: string) => {
    let finalMessage = msg;
    if (changeMessage) finalMessage = ToastMessageChange(finalMessage);
    if (textFormat) finalMessage = LabelAndPlaceholderTextFormat(finalMessage);
    return finalMessage;
  };

  switch (type) {
    case 'success': {
      if (typeof message !== 'string') {
        message = message?.data?.message || message?.message || 'Successfully updated';
      }
      message = MessageHandler(message);
      toast.success(message, toastOptions);
      break;
    }
    case 'error': {
      if (typeof message !== 'string') {
        message =
          message?.response?.data?.message ||
          message?.response?.message ||
          message?.data?.message ||
          message?.message ||
          'Something went wrong';
      }
      message = MessageHandler(message);
      toast.error(message, toastOptions);
      break;
    }
    case 'loading':
      message = MessageHandler(message);
      toast.loading(message, toastOptions);
      break;
    case 'custom':
      message = MessageHandler(message);
      toast(message, toastOptions);
      break;
    default:
      message = MessageHandler(message);
      toast(message, toastOptions);
  }
};

/** Shortcut: Show a success toast */
export const toastSuccessMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow('success', msg, options);

/** Shortcut: Show an error toast */
export const toastErrorMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow('error', msg, options);

/** Shortcut: Show a loading toast */
export const toastLoadingMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow('loading', msg, options);

/** Shortcut: Show a custom toast */
export const toastCustomMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow('custom', msg, options);
