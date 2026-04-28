import type { PropsWithChildren } from 'react';
import { I18nProvider } from '@/src/contexts/I18nContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { ChatPushProvider } from '@/src/features/notifications/providers/ChatPushProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ChatPushProvider>{children}</ChatPushProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
