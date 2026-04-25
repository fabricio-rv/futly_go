import type { FiltroPartidas, InfraItem, Jogador, Match, Partida, Player, RatingTag } from './types';

export const playersSeed: Jogador[] = [
  { id: 'p1', name: 'Fabricio R.', initials: 'FR', rating: 4.6, position: 'Pivo', gradient: ['#1B3A5F', '#071428'] },
  { id: 'p2', name: 'Luiz G.', initials: 'LG', rating: 4.9, position: 'Fixo', gradient: ['#5A3018', '#2A160A'] },
  { id: 'p3', name: 'Carla S.', initials: 'CS', rating: 4.7, position: 'Ala', gradient: ['#6C7487', '#20242E'] },
  { id: 'p4', name: 'Amanda M.', initials: 'AM', rating: 4.3, position: 'Ala', gradient: ['#8B6CF5', '#3B2C7E'] },
  { id: 'p5', name: 'Pedro K.', initials: 'PK', rating: 4.5, position: 'GK', gradient: ['#C69745', '#3A2A0B'], isHost: true },
];

const [playerFr, playerLg, playerCs, playerAm, playerPk] = playersSeed as [Jogador, Jogador, Jogador, Jogador, Jogador];

export const findFilters: FiltroPartidas[] = [
  { id: 'f1', label: 'RS', active: true },
  { id: 'f2', label: 'POA' },
  { id: 'f3', label: 'Hoje', active: true },
  { id: 'f4', label: 'Noite' },
  { id: 'f5', label: 'Pivo' },
  { id: 'f6', label: 'Futsal' },
  { id: 'f7', label: 'Ate R$30' },
];

export const findMatches: Partida[] = [
  {
    id: '2148',
    title: 'Arena Central - Quadra B',
    dateLabel: 'QUI - NOITE',
    timeLabel: '19h30',
    shiftLabel: 'Noite',
    modality: 'futsal',
    location: 'Cidade Baixa',
    distanceKm: 2.4,
    levelLabel: 'Casual',
    levelTone: 'gold',
    pricePerPlayer: 25,
    occupiedSlots: 5,
    totalSlots: 7,
    status: 'open',
    statusLabel: 'Vagas abertas',
    startsIn: '2h 14m',
    players: [playerFr, playerLg, playerCs, playerAm],
  },
  {
    id: '2151',
    title: 'Estadio do Bairro',
    dateLabel: 'QUI - NOITE',
    timeLabel: '20h00',
    shiftLabel: 'Noite',
    modality: 'society',
    location: 'Petropolis',
    distanceKm: 4.1,
    levelLabel: 'Intermediário',
    levelTone: 'sky',
    pricePerPlayer: 40,
    occupiedSlots: 11,
    totalSlots: 14,
    status: 'open',
    statusLabel: 'Vagas abertas',
    startsIn: '2h 44m',
    players: [playerPk, playerAm, playerCs],
  },
  {
    id: '2160',
    title: 'CT Bola Cheia',
    dateLabel: 'SEX - NOITE',
    timeLabel: '21h00',
    shiftLabel: 'Noite',
    modality: 'campo11',
    location: 'Sao Joao',
    distanceKm: 8.2,
    levelLabel: 'Avançado',
    levelTone: 'neutral',
    pricePerPlayer: 55,
    occupiedSlots: 22,
    totalSlots: 22,
    status: 'done',
    statusLabel: 'Lotada',
    isDimmed: true,
    players: playersSeed,
  },
];

export const infraItems: InfraItem[] = [
  { id: 'i1', label: 'Vestiario', enabled: true },
  { id: 'i2', label: 'Chuveiro', enabled: true },
  { id: 'i3', label: 'Estac.', enabled: true },
  { id: 'i4', label: 'Bar', enabled: false },
  { id: 'i5', label: 'Arbitro', enabled: true, highlighted: 'gold' },
  { id: 'i6', label: 'Wi-Fi', enabled: false },
];

export const hostMatch: Partida = {
  id: '2148',
  title: 'Arena Central - Quadra B',
  dateLabel: 'HOJE - NOITE',
  timeLabel: '19h30',
  shiftLabel: 'Noite',
  modality: 'futsal',
  location: 'Cidade Baixa',
  levelLabel: 'Resenha',
  levelTone: 'gold',
  pricePerPlayer: 25,
  occupiedSlots: 5,
  totalSlots: 7,
  status: 'host',
  statusLabel: 'Host',
  startsIn: '02h 14m',
  players: playersSeed,
};

export const playerMatch: Partida = {
  id: '2151',
  title: 'Estadio do Bairro - Petropolis',
  dateLabel: 'SAB - TARDE',
  timeLabel: '16h00',
  shiftLabel: 'Tarde',
  modality: 'society',
  location: 'Petropolis',
  levelLabel: 'Intermediário',
  levelTone: 'neutral',
  pricePerPlayer: 40,
  occupiedSlots: 11,
  totalSlots: 14,
  status: 'confirmed',
  statusLabel: 'Confirmado',
  players: playersSeed,
};

export const historyMatches = [
  { id: 'h1', title: 'vs. Barca do Ze - 4x2', subtitle: 'Ontem - Arena Central - MVP +75 XP', statusLabel: 'Avaliar' },
  { id: 'h2', title: 'Copa do Bairro R3 - 2x3', subtitle: 'Ha 4 dias - Estadio do Bairro - Avaliado', statusLabel: '4 estrelas' },
  { id: 'h3', title: 'Pelada do Pivo - 3x3', subtitle: 'Ha 1 sem - Quadra Por-do-Sol - Avaliado', statusLabel: '5 estrelas' },
];

export const ratingTags: RatingTag[] = [
  { id: 'r1', label: 'Pontual', selected: true, active: true },
  { id: 'r2', label: 'Comunicativo', selected: true, active: true },
  { id: 'r3', label: 'Bom local' },
  { id: 'r4', label: 'Time equilibrado' },
  { id: 'r5', label: 'Atrasou' },
];

function toPlayer(j: Jogador): Player {
  return {
    id: j.id,
    name: j.name,
    initials: j.initials,
    role: j.position,
    rating: j.rating ?? 0,
    position: j.position,
    gradient: [j.gradient[0], j.gradient[1]],
    isHost: j.isHost,
  };
}

function toMatch(partida: Partida): Match {
  return {
    id: partida.id,
    mode: partida.modality.toUpperCase() as Match['mode'],
    status: partida.status === 'done' ? 'full' : (partida.status as Match['status']),
    dateLabel: '25 ABR',
    weekdayLabel: partida.dateLabel.split(' - ')[0] ?? 'QUI',
    timeLabel: partida.timeLabel,
    shiftLabel: (partida.shiftLabel || 'NOITE').toUpperCase(),
    price: partida.pricePerPlayer,
    title: partida.title,
    location: partida.location,
    distance: partida.distanceKm ? `${partida.distanceKm}km` : '',
    level: partida.levelLabel as Match['level'],
    occupiedSlots: partida.occupiedSlots,
    totalSlots: partida.totalSlots,
    countdown: partida.startsIn ?? '--',
    banner: ['#0F3A24', '#072314', '#021109'],
    players: (partida.players ?? []).map(toPlayer),
  };
}

// Legacy exports used by older screens
export const hostPlayer: Player = toPlayer(playerPk);
export const feedMatches: Match[] = findMatches.map(toMatch);
export const createdMatches: Match[] = [toMatch(hostMatch)];
export const bookedMatches: Match[] = [toMatch(playerMatch)];
export const historicalMatches = [
  { id: 'h1', title: 'vs. Barca do Ze - 4x2', sub: 'Ontem - Arena Central - MVP +75 XP', pending: true },
  { id: 'h2', title: 'Copa do Bairro R3 - 2x3', sub: 'Ha 4 dias - Estadio do Bairro - Avaliado', pending: false },
  { id: 'h3', title: 'Pelada do Pivo - 3x3', sub: 'Ha 1 sem - Quadra Por-do-Sol - Avaliado', pending: false },
];
export const matchFacilities = infraItems.map((i) => ({ label: i.label, enabled: i.enabled, icon: 'grid' as const }));
export const rateTags = ratingTags.map((tag) => ({ id: tag.id, label: tag.label, active: tag.active }));
export const ratePlayers: Player[] = playersSeed.map(toPlayer);
