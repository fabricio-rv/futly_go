import { supabase } from '@/src/lib/supabase';
import type { Tables } from '@/src/types/database';

type NotificationRow = Tables<'notifications'>;
type RequestRow = Tables<'match_participation_requests'>;
type MatchRow = Tables<'matches'>;

type RecentAction = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  type: 'request' | 'rating' | 'match';
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Faça login novamente para continuar.');
  }

  return data.user.id;
}

async function syncRatingNotifications() {
  await supabase.rpc('sync_rating_notifications_for_current_user');
}

function requestStatusLabel(status: RequestRow['status'], t?: (key: string, fallback: string) => string) {
  const translate = t || ((_, fallback) => fallback);
  if (status === 'pending') return translate('requestStatus.sent', 'Solicitação enviada');
  if (status === 'accepted') return translate('requestStatus.approved', 'Solicitação aprovada');
  if (status === 'rejected') return translate('requestStatus.rejected', 'Solicitação recusada');
  return translate('requestStatus.cancelled', 'Solicitação cancelada');
}

function translateNotificationTitle(type: string, fallbackTitle: string, t?: (key: string, fallback: string) => string) {
  const translate = t || ((_, fallback) => fallback);

  const titleMap: Record<string, [string, string]> = {
    'participation_requested': ['newParticipationRequest', 'Nova Solicitação de Participação'],
    'participation_pending': ['requestStatus.sent', 'Solicitação enviada'],
    'participation_accepted': ['requestStatus.approved', 'Solicitação aprovada'],
    'participation_rejected': ['requestStatus.rejected', 'Solicitação recusada'],
    'match_rating_available': ['evaluationAvailable', 'Avaliação Disponível'],
    'rating_pending': ['actionTypes.ratingPending', 'Avaliação Pendente'],
    'match_created': ['actionTypes.matchCreated', 'Partida Criada'],
    'participation_confirmed': ['actionTypes.participationConfirmed', 'Participação Confirmada'],
    'rating_sent': ['actionTypes.ratingSent', 'Avaliação Enviada'],
    'rate_player': ['actionTypes.ratePlayer', 'Avaliar Jogador'],
    'rate_host': ['actionTypes.rateHost', 'Avaliar Host'],
  };

  const [key, fallback] = titleMap[type] || [type, fallbackTitle];
  return translate(key, fallback);
}

export async function fetchNotifications(t?: (key: string, fallback: string) => string) {
  await syncRatingNotifications();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw new Error('Não foi possível carregar notificacoes.');
  }

  const rows = (data ?? []) as NotificationRow[];

  if (!t) {
    return rows;
  }

  return rows.map((row) => ({
    ...row,
    title: translateNotificationTitle(row.type, row.title, t),
  }));
}

export async function fetchUnreadNotificationsCount() {
  await syncRatingNotifications();

  const userId = await getCurrentUserId();

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error('Não foi possível carregar contador de notificacoes.');
  }

  return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    throw new Error('Não foi possível marcar notificacao como lida.');
  }
}

export async function markAllNotificationsRead() {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error('Não foi possível marcar todas notificacoes como lidas.');
  }
}

export async function fetchRecentActions(t?: (key: string, fallback: string) => string) {
  const translate = t || ((_, fallback) => fallback);
  const userId = await getCurrentUserId();

  const [
    { data: myRequests, error: myRequestsError },
    { data: allRequests, error: allRequestsError },
    { data: ratingRows, error: ratingError },
    { data: createdMatches, error: createdError },
    { data: joinedRows, error: joinedError },
    { data: ratingTasks, error: ratingTasksError },
  ] = await Promise.all([
    supabase
      .from('match_participation_requests')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(80),
    supabase
      .from('match_participation_requests')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(300),
    supabase
      .from('ratings')
      .select('id,match_id,score,target_role,created_at')
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false })
      .limit(80),
    supabase
      .from('matches')
      .select('id,title,created_at,match_date,match_time,duration_minutes')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(80),
    supabase
      .from('match_participants')
      .select('id,match_id,joined_at,status,is_host')
      .eq('user_id', userId)
      .eq('status', 'confirmado')
      .eq('is_host', false)
      .order('joined_at', { ascending: false })
      .limit(80),
    supabase
      .from('match_rating_tasks')
      .select('task_id,match_id,match_title,target_user_name,target_role,action_label,match_date')
      .order('match_date', { ascending: false })
      .limit(80),
  ]);

  if (myRequestsError) throw new Error('Não foi possível carregar ações recentes.');
  if (allRequestsError) throw new Error('Não foi possível carregar ações recentes.');
  if (ratingError) throw new Error('Não foi possível carregar ações recentes.');
  if (createdError) throw new Error('Não foi possível carregar ações recentes.');
  if (joinedError) throw new Error('Não foi possível carregar ações recentes.');
  if (ratingTasksError) throw new Error('Não foi possível carregar ações recentes.');

  const createdMatchIds = new Set((createdMatches ?? []).map((match) => match.id));

  const hostDecisionRequests = ((allRequests ?? []) as RequestRow[])
    .filter((request) => createdMatchIds.has(request.match_id) && request.status !== 'pending');

  const matchIds = Array.from(new Set([
    ...((myRequests ?? []) as RequestRow[]).map((row) => row.match_id),
    ...hostDecisionRequests.map((row) => row.match_id),
    ...((ratingRows ?? []) as Array<{ match_id: string }>).map((row) => row.match_id),
    ...(joinedRows ?? []).map((row) => row.match_id),
    ...(createdMatches ?? []).map((row) => row.id),
  ]));

  let matchById = new Map<string, MatchRow>();
  if (matchIds.length > 0) {
    const { data, error } = await supabase.from('matches').select('*').in('id', matchIds);
    if (!error) {
      matchById = new Map((data ?? []).map((row) => [row.id, row as MatchRow]));
    }
  }

  const requestActions: RecentAction[] = ((myRequests ?? []) as RequestRow[])
    .filter((row) => row.status !== 'cancelled' && row.status !== 'pending')
    .map((row) => ({
      id: `request:self:${row.id}`,
      title: requestStatusLabel(row.status, translate),
      body: `${matchById.get(row.match_id)?.title ?? 'Partida'} - ${row.requested_position_label}`,
      createdAt: row.updated_at,
      type: 'request',
    }));

  const hostRequestActions: RecentAction[] = hostDecisionRequests.map((row) => ({
    id: `request:host:${row.id}`,
    title: row.status === 'accepted' ? translate('requestStatus.approvedByYou', 'Solicitação aprovada por você') : translate('requestStatus.rejectedByYou', 'Solicitação recusada por você'),
    body: `${matchById.get(row.match_id)?.title ?? 'Partida'} - ${row.requested_position_label}`,
    createdAt: row.updated_at,
    type: 'request',
  }));

  const ratingActions: RecentAction[] = (ratingRows ?? []).map((row) => ({
    id: `rating:${row.id}`,
    title: translate('actionTypes.ratingSent', 'Avaliação Enviada'),
    body: `${matchById.get(row.match_id)?.title ?? 'Partida'} - nota ${row.score}/5`,
    createdAt: row.created_at,
    type: 'rating',
  }));

  const createdMatchActions: RecentAction[] = (createdMatches ?? []).map((match) => ({
    id: `created:${match.id}`,
    title: translate('actionTypes.matchCreated', 'Partida Criada'),
    body: `${match.title} - ${match.match_date} ${String(match.match_time).slice(0, 5)}`,
    createdAt: match.created_at,
    type: 'match',
  }));

  const joinedMatchActions: RecentAction[] = (joinedRows ?? []).map((row) => ({
    id: `joined:${row.id}`,
    title: translate('actionTypes.participationConfirmed', 'Participação Confirmada'),
    body: `${matchById.get(row.match_id)?.title ?? 'Partida'} - vaga garantida`,
    createdAt: row.joined_at,
    type: 'match',
  }));

  const ratingPendingActions: RecentAction[] = (ratingTasks ?? []).map((task) => ({
    id: `rating:pending:${task.task_id ?? `${task.match_id}:${task.target_role}`}`,
    title: task.action_label ?? translate('actionTypes.ratingPending', 'Avaliação pendente'),
    body: `${task.match_title ?? 'Partida'} - ${task.target_user_name ?? 'Atleta'}`,
    createdAt: task.match_date ? `${task.match_date}T23:59:59.000Z` : new Date().toISOString(),
    type: 'rating',
  }));

  return [
    ...requestActions,
    ...hostRequestActions,
    ...ratingActions,
    ...ratingPendingActions,
    ...createdMatchActions,
    ...joinedMatchActions,
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 120);
}

export function subscribeNotifications(onChange: () => void) {
  const channelName = `notifications-feed:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`;
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'match_participation_requests' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'match_participants' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings' }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
