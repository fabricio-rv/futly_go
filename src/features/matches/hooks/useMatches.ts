import { useCallback, useMemo, useState } from 'react';

import type { Partida } from '@/src/features/matches/types';
import { actionSuccess } from '@/src/lib/haptics';
import {
  createMatch as createMatchService,
  fetchAvailableMatches as fetchAvailableMatchesService,
  fetchHostPendingRequests as fetchHostPendingRequestsService,
  getMatchDetails as getMatchDetailsService,
  getUserAgenda as getUserAgendaService,
  joinMatch as joinMatchService,
  leaveMatch as leaveMatchService,
  processParticipationRequest as processParticipationRequestService,
  submitMatchRating as submitMatchRatingService,
  type AgendaResult,
  type AvailableMatchesFilters,
  type CreateMatchInput,
  type HostPendingRequest,
  type MatchDetails,
} from '@/src/features/matches/services/matchesService';

export function useMatches() {
  const [availableMatches, setAvailableMatches] = useState<Partida[]>([]);
  const [agenda, setAgenda] = useState<AgendaResult>({ criadas: [], marcadas: [], pendentes: [], ratingTasks: [] });
  const [hostPendingRequests, setHostPendingRequests] = useState<HostPendingRequest[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
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

  const getMatchDetails = useCallback(async (matchId: string): Promise<MatchDetails> => {
    setLoadingDetails(true);
    setError(null);

    try {
      return await getMatchDetailsService(matchId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar detalhes da partida.';
      setError(message);
      throw err;
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const createMatch = useCallback(async (payload: CreateMatchInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await createMatchService(payload);
      void actionSuccess();
      return result;
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
      void actionSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao confirmar presença.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const leaveMatch = useCallback(async (matchId: string) => {
    setSubmitting(true);
    setError(null);

    try {
      await leaveMatchService(matchId);
      void actionSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desmarcar presença.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const processParticipationRequest = useCallback(async (requestId: string, action: 'accept' | 'reject', reason?: string | null) => {
    setSubmitting(true);
    setError(null);

    try {
      await processParticipationRequestService(requestId, action, reason);
      void actionSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar solicitação.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const submitMatchRating = useCallback(async (params: {
    matchId: string;
    reviewedId: string;
    targetRole: 'creator' | 'player';
    score: number;
    comment?: string | null;
  }) => {
    setSubmitting(true);
    setError(null);

    try {
      await submitMatchRatingService(params);
      void actionSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar avaliação.';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const getHostPendingRequests = useCallback(async () => {
    try {
      const data = await fetchHostPendingRequestsService();
      setHostPendingRequests(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar solicitacoes.';
      setError(message);
      throw err;
    }
  }, []);

  const hasData = useMemo(
    () => availableMatches.length > 0 || agenda.criadas.length > 0 || agenda.marcadas.length > 0 || agenda.pendentes.length > 0,
    [agenda.criadas.length, agenda.marcadas.length, agenda.pendentes.length, availableMatches.length],
  );

  return {
    availableMatches,
    agenda,
    hostPendingRequests,
    loadingAvailable,
    loadingAgenda,
    loadingDetails,
    submitting,
    error,
    hasData,
    createMatch,
    fetchAvailableMatches,
    joinMatch,
    leaveMatch,
    processParticipationRequest,
    submitMatchRating,
    getMatchDetails,
    getHostPendingRequests,
    getUserAgenda,
  };
}
