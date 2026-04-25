import type { Enums } from '@/src/types/database';

export type MatchLevel = Enums<'match_level'>;
export type MatchTurno = Enums<'match_turno'>;

export const MATCH_LEVEL_LABELS: Record<MatchLevel, string> = {
  pereba: 'Pereba',
  resenha: 'Resenha',
  casual: 'Casual',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  competitivo: 'Competitivo',
  semi_amador: 'Semi-Amador',
  amador: 'Amador',
  ex_profissional: 'Ex-profissional',
};

export const MATCH_POSITIONS = {
  futsal: [
    { key: 'GOL', label: 'Goleiro' },
    { key: 'FIXO', label: 'Fixo' },
    { key: 'ALE', label: 'Ala Esquerdo' },
    { key: 'ALD', label: 'Ala Direito' },
    { key: 'PIVÔ', label: 'Pivô' },
  ],
  society: [
    { key: 'GOL', label: 'Goleiro' },
    { key: 'FIXO', label: 'Fixo' },
    { key: 'VOL', label: 'Primeiro do Meio' },
    { key: 'MC', label: 'Segundo do Meio' },
    { key: 'ALE', label: 'Ala Esquerdo' },
    { key: 'ALD', label: 'Ala Direito' },
    { key: 'PIVÔ', label: 'Pivô' },
  ],
  campo: [
    { key: 'GOL', label: 'Goleiro' },
    { key: 'LE', label: 'Lateral Esquerdo' },
    { key: 'ZAG-E', label: 'Zagueiro Esquerdo' },
    { key: 'ZAG-D', label: 'Zagueiro Direito' },
    { key: 'LD', label: 'Lateral Direito' },
    { key: 'VOL', label: 'Volante' },
    { key: 'MC', label: 'Meia Central' },
    { key: 'MEI', label: 'Meia Atacante' },
    { key: 'PE', label: 'Ponta Esquerda' },
    { key: 'ATA', label: 'Centroavante' },
    { key: 'PD', label: 'Ponta Direita' },
  ],
} as const;

export type MatchModality = keyof typeof MATCH_POSITIONS;

export const ATHLETE_POSITION_OPTIONS = [
  'Goleiro',
  'Fixo',
  'Ala Esquerdo',
  'Ala Direito',
  'Pivô',
  'Primeiro do Meio',
  'Segundo do Meio',
  'Volante',
  'Meia Central',
  'Meia Atacante',
  'Lateral Direito',
  'Lateral Esquerdo',
  'Zagueiro Direito',
  'Zagueiro Esquerdo',
  'Ponta Esquerda',
  'Ponta Direita',
  'Centroavante',
] as const;

export const TURNO_OPTIONS: Array<{ value: MatchTurno; label: string }> = [
  { value: 'manha', label: 'Manha' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
];

export function getMatchLevelLabel(level: MatchLevel | null | undefined) {
  if (!level) return 'Sem nível';
  return MATCH_LEVEL_LABELS[level] ?? 'Sem nível';
}
