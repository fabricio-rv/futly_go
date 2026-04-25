export type Theme = 'light' | 'dark';

export const themeColors = {
  light: {
    bg: {
      primary: '#FFFFFF',
      secondary: '#F8FAFB',
      tertiary: '#F3F4F6',
    },
    border: {
      primary: '#E5E7EB',
      secondary: '#D1D5DB',
      light: '#F3F4F6',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      muted: '#D1D5DB',
    },
    icon: {
      primary: '#1F2937',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
  },
  dark: {
    bg: {
      primary: '#05070B',
      secondary: '#0C111E',
      tertiary: '#101626',
    },
    border: {
      primary: 'rgba(255,255,255,0.10)',
      secondary: 'rgba(255,255,255,0.06)',
      light: 'rgba(255,255,255,0.04)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.70)',
      tertiary: 'rgba(255,255,255,0.45)',
      muted: 'rgba(255,255,255,0.28)',
    },
    icon: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.70)',
      muted: 'rgba(255,255,255,0.45)',
    },
  },
};

export function getThemeColor(theme: Theme, category: keyof typeof themeColors['light'], property: string): string {
  const colors = themeColors[theme];
  const cat = colors[category as keyof typeof colors] as any;
  return cat?.[property] || '#000000';
}
