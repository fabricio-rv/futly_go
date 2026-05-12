import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { I18nProvider } from '@/src/contexts/I18nContext';
import { LoadingProvider } from '@/src/contexts/LoadingContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { ToastProvider } from '@/src/contexts/ToastContext';
import { ChatPushProvider } from '@/src/features/notifications/providers/ChatPushProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <LoadingProvider>
          <ToastProvider>
            <AuthProvider>
              <ChatPushProvider>{children}</ChatPushProvider>
            </AuthProvider>
          </ToastProvider>
        </LoadingProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
