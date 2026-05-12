import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo } from 'react-native';

import { AppToastHost, type AppToastAction, type AppToastItem, type AppToastTone } from '@/src/components/ui/AppToastHost';

type ShowToastInput = {
  tone?: AppToastTone;
  title: string;
  description?: string;
  action?: AppToastAction;
  durationMs?: number;
  dedupeKey?: string;
};

type ToastContextValue = {
  showToast: (input: ShowToastInput) => string;
  dismissToast: (id: string) => void;
  success: (title: string, description?: string, action?: AppToastAction) => string;
  error: (title: string, description?: string, action?: AppToastAction) => string;
  warning: (title: string, description?: string, action?: AppToastAction) => string;
  info: (title: string, description?: string, action?: AppToastAction) => string;
};

const TOAST_DURATION_DEFAULT = 3200;
const TOAST_DURATION_ERROR = 4600;

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [queue, setQueue] = useState<AppToastItem[]>([]);
  const recentDedupeRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((input: ShowToastInput) => {
    const tone = input.tone ?? 'info';
    const dedupeKey = input.dedupeKey || `${tone}:${input.title}:${input.description ?? ''}`;
    const now = Date.now();
    const lastAt = recentDedupeRef.current.get(dedupeKey) ?? 0;
    if (now - lastAt < 1200) {
      return `${dedupeKey}:${lastAt}`;
    }
    recentDedupeRef.current.set(dedupeKey, now);

    const toast: AppToastItem = {
      id: `${now}-${Math.random().toString(36).slice(2, 9)}`,
      tone,
      title: input.title,
      description: input.description,
      action: input.action,
      durationMs: input.durationMs ?? (tone === 'error' ? TOAST_DURATION_ERROR : TOAST_DURATION_DEFAULT),
    };

    setQueue((prev) => [...prev, toast]);
    const announceText = [toast.title, toast.description].filter(Boolean).join('. ');
    AccessibilityInfo.announceForAccessibility(announceText);
    return toast.id;
  }, []);

  const success = useCallback((title: string, description?: string, action?: AppToastAction) => (
    showToast({ tone: 'success', title, description, action })
  ), [showToast]);
  const error = useCallback((title: string, description?: string, action?: AppToastAction) => (
    showToast({ tone: 'error', title, description, action })
  ), [showToast]);
  const warning = useCallback((title: string, description?: string, action?: AppToastAction) => (
    showToast({ tone: 'warning', title, description, action })
  ), [showToast]);
  const info = useCallback((title: string, description?: string, action?: AppToastAction) => (
    showToast({ tone: 'info', title, description, action })
  ), [showToast]);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  }), [dismissToast, error, info, showToast, success, warning]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AppToastHost toast={queue[0] ?? null} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
