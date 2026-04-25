import type { PitchFormation } from './types';

export const PITCH_FORMATIONS: Record<string, PitchFormation> = {
  futsal: {
    mode: 'futsal',
    description: 'Futsal 1-2-1 (5v5)',
    positions: [
      { key: 'GOL', label: 'Goleiro', x: 50, y: 90 },
      { key: 'FIXO', label: 'Fixo', x: 50, y: 68 },
      { key: 'ALA-E', label: 'Ala Esquerdo', x: 16, y: 46 },
      { key: 'ALA-D', label: 'Ala Direito', x: 84, y: 46 },
      { key: 'PIVO', label: 'Pivô', x: 50, y: 24 },
    ],
  },
  society: {
    mode: 'society',
    description: 'Society 2-3-2 (7v7)',
    positions: [
      { key: 'GOL', label: 'Goleiro', x: 50, y: 90 },
      { key: 'FIXO', label: 'Fixo', x: 50, y: 70 },
      { key: 'VOL', label: 'Primeiro do Meio', x: 68, y: 46 },
      { key: 'ALA-E', label: 'Ala Esquerdo', x: 14, y: 59 },
      { key: 'MC', label: 'Segundo do Meio', x: 34, y: 42 },
      { key: 'ALA-D', label: 'Ala Direito', x: 86, y: 59 },
      { key: 'PIVO', label: 'Pivô', x: 50, y: 20 },
    ],
  },
  campo: {
    mode: 'campo',
    description: 'Campo 4-3-3 (11v11)',
    positions: [
      { key: 'GOL', label: 'Goleiro', x: 50, y: 92 },
      { key: 'LD', label: 'Lateral Direito', x: 84, y: 76 },
      { key: 'ZAG-D', label: 'Zagueiro Direito', x: 60, y: 76 },
      { key: 'ZAG-E', label: 'Zagueiro Esquerdo', x: 40, y: 76 },
      { key: 'LE', label: 'Lateral Esquerdo', x: 16, y: 76 },
      { key: 'VOL', label: 'Volante', x: 70, y: 56 },
      { key: 'MC', label: 'Meia Central', x: 32, y: 54 },
      { key: 'MEI', label: 'Meia Atacante', x: 50, y: 34 },
      { key: 'PE', label: 'Ponta Esquerda', x: 14, y: 20 },
      { key: 'ATA', label: 'Centroavante', x: 50, y: 12 },
      { key: 'PD', label: 'Ponta Direita', x: 86, y: 20 },
    ],
  },
};

export function getFormationByMode(mode: string): PitchFormation {
  return PITCH_FORMATIONS[mode] || PITCH_FORMATIONS.futsal;
}
