'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

let toastId = 0;

const toastState: {
  toasts: Toast[];
  listeners: Array<(toasts: Toast[]) => void>;
} = {
  toasts: [],
  listeners: []
};

function addToast(toast: Omit<Toast, 'id'>) {
  const newToast: Toast = {
    ...toast,
    id: String(++toastId)
  };
  
  toastState.toasts.push(newToast);
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));
  
  // Auto-remove after duration
  if (toast.duration !== 0) {
    setTimeout(() => {
      removeToast(newToast.id);
    }, toast.duration || 5000);
  }
}

function removeToast(id: string) {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id);
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Subscribe to toast updates
  useState(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    toastState.listeners.push(listener);
    
    return () => {
      const index = toastState.listeners.indexOf(listener);
      if (index > -1) {
        toastState.listeners.splice(index, 1);
      }
    };
  });

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    addToast(props);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
}
