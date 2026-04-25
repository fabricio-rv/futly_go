import { useCallback, useState } from 'react';

import {
  fetchMyProfile,
  updateMyProfile,
  type UpdateProfileInput,
  type ProfileRow,
} from '@/src/features/profile/services/profileService';

export function useProfile() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMyProfile();
      setProfile(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar perfil.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (input: UpdateProfileInput) => {
    setSaving(true);
    setError(null);

    try {
      const updated = await updateMyProfile(input);
      setProfile(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar perfil.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    profile,
    loading,
    saving,
    error,
    loadProfile,
    saveProfile,
  };
}
