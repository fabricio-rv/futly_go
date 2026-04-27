import { useAppColorScheme } from '@/src/contexts/ThemeContext';

const lightTheme = {
  colors: {
    bgBase: '#F4F6F9',
    bgSurfaceA: '#FAFBFC',
    bgSurfaceB: '#F4F6F9',
    line: 'rgba(0,0,0,0.15)',
    lineStrong: 'rgba(0,0,0,0.20)',
    fgPrimary: '#1F2937',
    fgSecondary: '#475569',
    fgMuted: '#64748B',
    fgFaint: '#94A3B8',
    ok: '#22B76C',
    okSoft: '#1E9A5D',
    warn: '#C68616',
    bad: '#E84C37',
    badSoft: '#D66658',
    goldA: '#A6771F',
    goldB: '#D4A13A',
    goldText: '#2A1A05',
  },
};

const darkTheme = {
  colors: {
    bgBase: '#05070B',
    bgSurfaceA: '#0F1625',
    bgSurfaceB: '#0A0F1C',
    line: 'rgba(255,255,255,0.06)',
    lineStrong: 'rgba(255,255,255,0.10)',
    fgPrimary: '#F5F7FA',
    fgSecondary: 'rgba(255,255,255,0.70)',
    fgMuted: 'rgba(255,255,255,0.45)',
    fgFaint: 'rgba(255,255,255,0.28)',
    ok: '#22B76C',
    okSoft: '#86E5B4',
    warn: '#F5A524',
    bad: '#E84C37',
    badSoft: '#FF8B7A',
    goldA: '#F6D27A',
    goldB: '#D4A13A',
    goldText: '#2A1A05',
  },
};

export const matchTheme = darkTheme;

export function useMatchTheme() {
  const theme = useAppColorScheme();
  return theme === 'light' ? lightTheme : darkTheme;
}

export const matchShadows = {
  panel: {
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  glowGreen: {
    shadowColor: '#009A54',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
};
