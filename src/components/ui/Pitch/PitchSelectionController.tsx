import { useState, useEffect } from 'react';
import { View } from 'react-native';

import { PitchBase } from './PitchBase';
import { PitchModalitySelector } from './PitchModalitySelector';
import type {
  PitchSelectionControllerProps,
  PitchSelection,
  PitchMode,
} from './types';

export function PitchSelectionController({
  mode: initialMode = 'futsal',
  width = 300,
  onSelectionChange,
  onModeChange,
}: PitchSelectionControllerProps) {
  const [mode, setMode] = useState<PitchMode>(initialMode);
  const [selectedPrimary, setSelectedPrimary] = useState<number | null>(null);
  const [selectedSecondary, setSelectedSecondary] = useState<number | null>(
    null
  );

  const handleModeChange = (newMode: PitchMode) => {
    setMode(newMode);
    setSelectedPrimary(null);
    setSelectedSecondary(null);
    onModeChange?.(newMode);
  };

  const handleSpotPress = (index: number) => {
    let newPrimary = selectedPrimary;
    let newSecondary = selectedSecondary;

    if (selectedPrimary === index) {
      newPrimary = null;
    } else if (selectedSecondary === index) {
      newSecondary = null;
    } else if (selectedPrimary === null) {
      newPrimary = index;
    } else if (selectedSecondary === null) {
      newSecondary = index;
    } else {
      newPrimary = index;
      newSecondary = null;
    }

    setSelectedPrimary(newPrimary);
    setSelectedSecondary(newSecondary);

    const selection: PitchSelection = {
      primary: newPrimary,
      secondary: newSecondary,
    };
    onSelectionChange?.(selection);
  };

  useEffect(() => {
    if (initialMode !== mode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  return (
    <View className="gap-4">
      <PitchModalitySelector value={mode} onChange={handleModeChange} />
      <PitchBase
        mode={mode}
        width={width}
        selectedPrimary={selectedPrimary}
        selectedSecondary={selectedSecondary}
        onSpotPress={handleSpotPress}
      />
    </View>
  );
}
