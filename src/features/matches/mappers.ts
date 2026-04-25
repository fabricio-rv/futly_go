import type { Partida } from '@/src/features/matches/types';
import { getMatchLevelLabel } from '@/src/features/matches/constants';
import type { Tables } from '@/src/types/database';

type MatchRow = Tables<'matches'>;

type MapOptions = {
  currentUserId?: string | null;
};

export type MatchSlotMetrics = {
  totalSlots: number;
  openSlots: number;
};

function formatDateLabel(matchDate: string, turno: string) {
  const date = new Date(`${matchDate}T12:00:00`);
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const turnoLabel = turno.charAt(0).toUpperCase() + turno.slice(1);
  return `${weekday} - ${turnoLabel}`;
}

function formatTimeLabel(value: string) {
  const [hour = '00', minute = '00'] = value.split(':');
  return `${hour}h${minute}`;
}

function getStartsInLabel(matchDate: string, matchTime: string) {
  const when = new Date(`${matchDate}T${matchTime}`);
  const diff = when.getTime() - Date.now();

  if (diff <= 0) return 'Em andamento';

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function getLevelTone(price: number): Partida['levelTone'] {
  if (price <= 30) return 'gold';
  if (price <= 50) return 'sky';
  return 'neutral';
}

export function getMatchSlotMetrics(formationJson: unknown): MatchSlotMetrics {
  if (!formationJson || typeof formationJson !== 'object') {
    return { totalSlots: 0, openSlots: 0 };
  }

  const slots = (formationJson as { slots?: unknown[] }).slots;
  if (!Array.isArray(slots)) {
    return { totalSlots: 0, openSlots: 0 };
  }

  const openSlots = slots.reduce<number>((acc, slot) => {
    if (!slot || typeof slot !== 'object') return acc;
    return (slot as { open?: unknown }).open === false ? acc : acc + 1;
  }, 0);

  return { totalSlots: slots.length, openSlots };
}

export function mapMatchRowToPartida(match: MatchRow, occupiedSlots: number, options: MapOptions = {}): Partida {
  const { totalSlots } = getMatchSlotMetrics(match.formation_json);
  const isHost = options.currentUserId ? match.created_by === options.currentUserId : false;

  return {
    id: match.id,
    title: match.title,
    dateLabel: formatDateLabel(match.match_date, match.turno),
    timeLabel: formatTimeLabel(match.match_time),
    shiftLabel: match.turno.charAt(0).toUpperCase() + match.turno.slice(1),
    modality: match.modality === 'campo' ? 'campo11' : (match.modality as Partida['modality']),
    location: [match.district, match.city].filter(Boolean).join(' - ') || match.city || 'Sem local',
    levelLabel: getMatchLevelLabel(match.accepted_levels[0]),
    levelTone: getLevelTone(Number(match.price_per_person)),
    pricePerPlayer: Number(match.price_per_person),
    occupiedSlots,
    totalSlots,
    status: isHost ? 'host' : match.status === 'finalizada' ? 'done' : 'open',
    statusLabel: isHost ? 'Criada por você' : match.status === 'finalizada' ? 'Finalizada' : 'Vagas abertas',
    startsIn: getStartsInLabel(match.match_date, match.match_time),
  };
}
