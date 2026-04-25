import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Partida } from '@/src/features/matches/types';
import {
  createMatch as createMatchService,
  fetchAvailableMatches as fetchAvailableMatchesService,
  getUserAgenda as getUserAgendaService,
  joinMatch as joinMatchService,
  type AgendaResult,
  type AvailableMatchesFilters,
  type CreateMatchInput,
} from '@/src/features/matches/services/matchesService';

export function useMatches() {
  const [availableMatches, setAvailableMatches] = useState<Partida[]>([]);
  const [agenda, setAgenda] = useState<AgendaResult>({ criadas: [], marcadas: [] });
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableMatches = useCallback(async (filters: AvailableMatchesFilters = {}) => {
    setLoadingAvailable(true);
    setError(null);

    try {
      const data = await fetchAvailableMatchesService(filters);
      setAvailableMatches(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar partidas.';
      setError(message);
      throw err;
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const getUserAgenda = useCallback(async () => {
    setLoadingAgenda(true);
    setError(null);

    try {
      const data = await getUserAgendaService();
      setAgenda(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar agenda.';
      setError(message);
      throw err;
    } finally {
      setLoadingAgenda(false);
    }
  }, []);

  const createMatch = useCallback(async (payload: CreateMatchInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const match = await createMatchService(payload);
      return match;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar partida.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const joinMatch = useCallback(async (params: { matchId: string; positionKey: string; positionLabel: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      await joinMatchService(params);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao confirmar presença.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const hasData = useMemo(
    () => availableMatches.length > 0 || agenda.criadas.length > 0 || agenda.marcadas.length > 0,
    [agenda.criadas.length, agenda.marcadas.length, availableMatches.length],
  );

  return {
    availableMatches,
    agenda,
    loadingAvailable,
    loadingAgenda,
    submitting,
    error,
    hasData,
    createMatch,
    fetchAvailableMatches,
    joinMatch,
    getUserAgenda,
  };
}
