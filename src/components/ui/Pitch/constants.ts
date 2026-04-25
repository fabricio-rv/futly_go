export const PITCH_COLORS = {
  background: '#0B2D1D',
  field: 'rgba(0,154,84,0.18)',
  border: '#1F8A4A',
  line: 'rgba(255,255,255,0.15)',
  spot: {
    unselected: 'rgba(5,7,11,0.66)',
    primary: '#22B76C',
    secondary: '#3D9FE8',
  },
  text: {
    selected: '#F5F7FA',
    unselected: 'rgba(245,247,250,0.86)',
  },
};

export const PITCH_SIZES = {
  spotRadius: 27,
  spotDiameter: 54,
  borderWidth: {
    unselected: 1.5,
    selected: 3,
  },
  fontSize: 12,
};

export const PITCH_ASPECT_RATIO = 1.52;

export const MODALITY_OPTIONS = [
  { label: 'Futsal', value: 'futsal', icon: '⚽' },
  { label: 'Society', value: 'society', icon: '⚽' },
  { label: 'Campo', value: 'campo', icon: '⚽' },
];
