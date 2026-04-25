export type PitchMode = 'futsal' | 'society' | 'campo';
export type SelectionType = 'primary' | 'secondary' | null;

export interface PitchPosition {
  key: string;
  label: string;
  x: number;
  y: number;
}

export interface PitchFormation {
  mode: PitchMode;
  positions: PitchPosition[];
  description: string;
}

export interface SelectionState {
  positionIndex: number;
  type: SelectionType;
}

export interface PitchSelection {
  primary: number | null;
  secondary: number | null;
}

export interface PitchSpotProps {
  position: PitchPosition;
  index: number;
  isSelected: boolean;
  selectionType: SelectionType;
  onPress: (index: number) => void;
}

export interface PitchBaseProps {
  mode: PitchMode;
  width?: number;
  selectedPrimary: number | null;
  selectedSecondary: number | number[] | null;
  onSpotPress: (index: number) => void;
}

export interface PitchSelectionControllerProps {
  mode: PitchMode;
  width?: number;
  onSelectionChange?: (selection: PitchSelection) => void;
  onModeChange?: (mode: PitchMode) => void;
}
