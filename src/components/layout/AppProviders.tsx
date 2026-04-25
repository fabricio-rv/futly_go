import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/src/contexts/ThemeContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
