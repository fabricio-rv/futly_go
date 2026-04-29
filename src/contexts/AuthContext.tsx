import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { router, useSegments } from 'expo-router';
import type { Session, User } from '@supabase/supabase-js';

import { resetChatIdentityCache } from '@/src/features/chat/services/chatService';
import { supabase } from '@/src/lib/supabase';

type AuthContextValue = {
  initialized: boolean;
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function getStableSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[auth] session restore skipped:', error.message);
    return null;
  }

  return data.session ?? null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const segments = useSegments();
  const lastSessionRef = useRef<Session | null>(null);
  const warmupChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const navigationSequenceRef = useRef(0);

  const refreshSession = useMemo(() => async () => {
    const nextSession = await getStableSession();
    lastSessionRef.current = nextSession;
    setSession(nextSession);
    setInitialized(true);
    return nextSession;
  }, []);

  useEffect(() => {
    let active = true;

    getStableSession().then((restoredSession) => {
      if (!active) return;
      lastSessionRef.current = restoredSession;
      setSession(restoredSession);
      setInitialized(true);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        lastSessionRef.current = null;
        setSession(null);
        resetChatIdentityCache();
        setInitialized(true);
        return;
      }

      if (nextSession) {
        lastSessionRef.current = nextSession;
        setSession(nextSession);
        setInitialized(true);
        return;
      }

      if (event === 'INITIAL_SESSION') {
        lastSessionRef.current = null;
        setSession(null);
        setInitialized(true);
        return;
      }

      if (lastSessionRef.current) {
        void refreshSession();
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [refreshSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshSession();
    });

    return () => subscription.remove();
  }, [refreshSession]);

  useEffect(() => {
    if (!initialized) return;

    const navigationSequence = ++navigationSequenceRef.current;
    const routeGroup = segments[0];
    if (session && routeGroup === '(auth)') {
      void (async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('state, city, cep')
          .eq('id', session.user.id)
          .maybeSingle();

        if (navigationSequence !== navigationSequenceRef.current) return;

        const needsProfileCompletion = !profile
          || !profile.state?.trim()
          || !profile.city?.trim()
          || !profile.cep?.trim();

        router.replace(needsProfileCompletion ? '/(app)/edit-profile' : '/(app)');
      })();
      return;
    }

    if (!session && routeGroup === '(app)') {
      router.replace('/(auth)');
    }
  }, [initialized, segments, session]);

  useEffect(() => {
    if (warmupChannelRef.current) {
      supabase.removeChannel(warmupChannelRef.current);
      warmupChannelRef.current = null;
    }

    if (!session?.user?.id) return;

    const realtime = (supabase as unknown as { realtime?: { connect?: () => void } }).realtime;
    realtime?.connect?.();

    const channel = supabase.channel(`realtime-prewarm:${session.user.id}`);
    warmupChannelRef.current = channel;
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (warmupChannelRef.current === channel) warmupChannelRef.current = null;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(() => ({
    initialized,
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    refreshSession,
  }), [initialized, refreshSession, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
