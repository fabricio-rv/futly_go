import type { Enums, Tables, TablesInsert } from '@/src/types/database';

export type MatchRow = Tables<'matches'>;
export type MatchInsert = TablesInsert<'matches'>;
export type MatchStatus = Enums<'match_status'>;

export type MatchModality = 'futsal' | 'society' | 'campo11';
export type MatchUiStatus = 'open' | 'confirmed' | 'live' | 'done' | 'host';

export interface HostInfo {
  id: string;
  name: string;
  initials: string;
  rating: number;
  matchesHosted: number;
  phone?: string;
  responseEta?: string;
  verified?: boolean;
}

export interface Jogador {
  id: string;
  name: string;
  initials: string;
  rating: number | null;
  position: string;
  gradient: [string, string];
  isHost?: boolean;
}

export interface PosicaoSlot {
  id: string;
  label: string;
  left: number;
  top: number;
  state: 'host' | 'taken' | 'empty' | 'locked';
}

export interface InfraItem {
  id: string;
  label: string;
  enabled: boolean;
  highlighted?: 'ok' | 'gold';
}

export interface Partida {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  shiftLabel: string;
  modality: MatchModality;
  location: string;
  distanceKm?: number;
  levelLabel: string;
  levelTone: 'gold' | 'sky' | 'neutral';
  pricePerPlayer: number;
  occupiedSlots: number;
  totalSlots: number;
  status: MatchUiStatus;
  statusLabel: string;
  isDimmed?: boolean;
  startsIn?: string;
  host?: HostInfo;
  players?: Jogador[];
  infra?: InfraItem[];
}

export interface FiltroPartidas {
  id: string;
  label: string;
  active?: boolean;
}

export interface AgendaItem {
  id: string;
  title: string;
  subtitle: string;
  statusLabel?: string;
  rating?: number;
}

export interface RatingTag {
  id: string;
  label: string;
  selected?: boolean;
  active?: boolean;
}

export interface Player {
  id: string;
  name: string;
  initials: string;
  role: string;
  rating: number;
  position: string;
  gradient: [string, string];
  isHost?: boolean;
}

export interface Match {
  id: string;
  mode: 'FUTSAL' | 'SOCIETY' | 'CAMPO11';
  status: 'open' | 'full' | 'host' | 'confirmed' | 'live';
  dateLabel: string;
  weekdayLabel: string;
  timeLabel: string;
  shiftLabel: string;
  price: number;
  title: string;
  location: string;
  distance: string;
  level: string;
  occupiedSlots: number;
  totalSlots: number;
  countdown: string;
  banner: [string, string, string];
  players: Player[];
}

export type MatchLevel =
  | 'Pereba'
  | 'Resenha'
  | 'Casual'
  | 'Intermediário'
  | 'Avançado'
  | 'Competitivo'
  | 'Semi-Amador'
  | 'Amador'
  | 'Ex-profissional';

export interface Avaliacao {
  id: string;
  targetId: string;
  targetType: 'host' | 'player';
  stars: number;
  tags: RatingTag[];
  comment?: string;
  anonymous: boolean;
}
