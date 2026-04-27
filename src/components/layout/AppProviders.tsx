import type { PropsWithChildren } from 'react';
import { I18nProvider } from '@/src/contexts/I18nContext';
import { ThemeProvider } from '@/src/contexts/ThemeContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <I18nProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
