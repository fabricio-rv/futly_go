import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo } from 'react-native';

import { LoadingOverlay } from '@/src/components/ui/LoadingOverlay';

type LoadingRequestOptions = {
  message?: string;
  delayMs?: number;
  minVisibleMs?: number;
};

type LoadingContextValue = {
  isVisible: boolean;
  message: string | null;
  show: (options?: LoadingRequestOptions) => string;
  hide: (token: string) => void;
  run: <T>(task: () => Promise<T>, options?: LoadingRequestOptions) => Promise<T>;
};

type ActiveRequest = {
  token: string;
  message: string | null;
  delayMs: number;
  minVisibleMs: number;
};

const DEFAULT_DELAY_MS = 130;
const DEFAULT_MIN_VISIBLE_MS = 380;

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: PropsWithChildren) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const requestsRef = useRef<Map<string, ActiveRequest>>(new Map());
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleSinceRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const ensureReveal = useCallback(() => {
    if (isVisible || revealTimerRef.current) return;
    const first = Array.from(requestsRef.current.values())[0];
    if (!first) return;
    revealTimerRef.current = setTimeout(() => {
      revealTimerRef.current = null;
      if (requestsRef.current.size === 0) return;
      visibleSinceRef.current = Date.now();
      setMessage(first.message);
      setIsVisible(true);
      if (first.message) {
        AccessibilityInfo.announceForAccessibility(first.message);
      }
    }, first.delayMs);
  }, [isVisible]);

  const show = useCallback((options?: LoadingRequestOptions) => {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    requestsRef.current.set(token, {
      token,
      message: options?.message ?? null,
      delayMs: options?.delayMs ?? DEFAULT_DELAY_MS,
      minVisibleMs: options?.minVisibleMs ?? DEFAULT_MIN_VISIBLE_MS,
    });

    if (!isVisible) {
      ensureReveal();
    } else if (options?.message) {
      setMessage(options.message);
    }
    return token;
  }, [ensureReveal, isVisible]);

  const hide = useCallback((token: string) => {
    requestsRef.current.delete(token);
    if (requestsRef.current.size > 0) {
      const next = Array.from(requestsRef.current.values())[0];
      setMessage(next?.message ?? null);
      return;
    }

    if (!isVisible) {
      clearTimers();
      setMessage(null);
      return;
    }

    const elapsed = Date.now() - visibleSinceRef.current;
    const minVisible = DEFAULT_MIN_VISIBLE_MS;
    const waitMs = Math.max(0, minVisible - elapsed);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      setIsVisible(false);
      setMessage(null);
    }, waitMs);
  }, [clearTimers, isVisible]);

  const run = useCallback(async <T,>(task: () => Promise<T>, options?: LoadingRequestOptions) => {
    const token = show(options);
    try {
      return await task();
    } finally {
      hide(token);
    }
  }, [hide, show]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const value = useMemo<LoadingContextValue>(() => ({
    isVisible,
    message,
    show,
    hide,
    run,
  }), [hide, isVisible, message, run, show]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay visible={isVisible} message={message} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

export function useLocalLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const revealRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownAtRef = useRef<number>(0);

  const start = useCallback((delayMs = DEFAULT_DELAY_MS) => {
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    if (revealRef.current) return;
    revealRef.current = setTimeout(() => {
      revealRef.current = null;
      shownAtRef.current = Date.now();
      setIsLoading(true);
    }, delayMs);
  }, []);

  const stop = useCallback((minVisibleMs = DEFAULT_MIN_VISIBLE_MS) => {
    if (revealRef.current) {
      clearTimeout(revealRef.current);
      revealRef.current = null;
      return;
    }
    const elapsed = Date.now() - shownAtRef.current;
    const waitMs = Math.max(0, minVisibleMs - elapsed);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => {
      hideRef.current = null;
      setIsLoading(false);
    }, waitMs);
  }, []);

  const run = useCallback(async <T,>(task: () => Promise<T>) => {
    start();
    try {
      return await task();
    } finally {
      stop();
    }
  }, [start, stop]);

  useEffect(() => () => {
    if (revealRef.current) clearTimeout(revealRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
  }, []);

  return {
    isLoading,
    start,
    stop,
    run,
  };
}
