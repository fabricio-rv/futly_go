import { useCallback, useState } from 'react';

import {
  fetchSettings,
  updateSettings,
  type Settings,
} from '@/src/features/settings/services/settingsService';
import { useTheme } from '@/src/contexts/ThemeContext';

export function useSettings() {
  const { setTheme: setAppTheme } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSettings();
      setSettings(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar preferências.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotifications = useCallback(async (enabled: boolean) => {
    try {
      const updated = await updateSettings({ notificationsEnabled: enabled });
      setSettings(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar notificações.';
      setError(message);
      throw err;
    }
  }, []);

  const updateLocation = useCallback(async (enabled: boolean) => {
    try {
      const updated = await updateSettings({ locationEnabled: enabled });
      setSettings(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar localização.';
      setError(message);
      throw err;
    }
  }, []);

  const setTheme = useCallback(async (theme: 'light' | 'dark') => {
    try {
      const updated = await updateSettings({ theme });
      setSettings(updated);
      await setAppTheme(theme);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar tema.';
      setError(message);
      throw err;
    }
  }, [setAppTheme]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateNotifications,
    updateLocation,
    setTheme,
  };
}
