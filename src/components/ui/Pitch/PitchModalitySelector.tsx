import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { MODALITY_OPTIONS } from './constants';
import type { PitchMode } from './types';

interface PitchModalitySelectorProps {
  value: PitchMode;
  onChange: (mode: PitchMode) => void;
}

export function PitchModalitySelector({
  value,
  onChange,
}: PitchModalitySelectorProps) {
  return (
    <View className="flex-row gap-3 mb-4">
      {MODALITY_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value as PitchMode)}
            className={`flex-1 py-3 px-4 rounded-lg items-center justify-center border-2 ${
              isSelected
                ? 'bg-emerald-500/20 border-emerald-500'
                : 'bg-[rgba(0,0,0,0.04)] dark:bg-slate-900/50 border-[rgba(0,0,0,0.10)] dark:border-slate-700'
            }`}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <Text
              className={`font-semibold text-sm ${
                isSelected ? 'text-emerald-400' : 'text-[#6B7280] dark:text-slate-300'
              }`}
            >
              {option.icon} {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
