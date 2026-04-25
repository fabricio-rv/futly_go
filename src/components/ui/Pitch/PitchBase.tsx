import { View } from 'react-native';

import { PITCH_ASPECT_RATIO, PITCH_COLORS } from './constants';
import { PitchSpot } from './PitchSpot';
import type { PitchBaseProps } from './types';
import type { SelectionType } from './types';
import { getFormationByMode } from './formations';

export function PitchBase({
  mode,
  width = 300,
  selectedPrimary,
  selectedSecondary,
  onSpotPress,
}: PitchBaseProps) {
  const formation = getFormationByMode(mode);
  const height = Math.round(width * PITCH_ASPECT_RATIO);

  const secondaryIndicesArray = Array.isArray(selectedSecondary)
    ? selectedSecondary
    : selectedSecondary !== null
      ? [selectedSecondary]
      : [];

  return (
    <View
      className="rounded-[22px] border overflow-hidden"
      style={{
        width,
        height,
        backgroundColor: PITCH_COLORS.background,
        borderColor: PITCH_COLORS.border,
        borderWidth: 1.5,
      }}
    >
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: PITCH_COLORS.field,
        }}
      />

      <View
        className="absolute inset-[12px] rounded-[14px]"
        style={{
          borderWidth: 1,
          borderColor: PITCH_COLORS.line,
        }}
      />

      <View
        className="absolute left-[12px] right-[12px] top-1/2"
        style={{
          borderTopWidth: 1,
          borderTopColor: PITCH_COLORS.line,
          marginTop: -0.5,
        }}
      />

      <View
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: Math.round(width * 0.18),
          height: Math.round(width * 0.18),
          borderWidth: 1,
          borderColor: PITCH_COLORS.line,
          marginLeft: -Math.round(width * 0.09),
          marginTop: -Math.round(width * 0.09),
        }}
      />

      <View
        className="absolute left-1/2 bottom-[12px]"
        style={{
          width: Math.round(width * 0.32),
          height: Math.round(width * 0.16),
          borderWidth: 1,
          borderColor: PITCH_COLORS.line,
          marginLeft: -Math.round(width * 0.16),
        }}
      />

      <View
        className="absolute left-1/2 top-[12px]"
        style={{
          width: Math.round(width * 0.32),
          height: Math.round(width * 0.16),
          borderWidth: 1,
          borderColor: PITCH_COLORS.line,
          marginLeft: -Math.round(width * 0.16),
        }}
      />

      {formation.positions.map((position, index) => {
        const selectionType: SelectionType =
          selectedPrimary === index
            ? 'primary'
            : secondaryIndicesArray.includes(index)
              ? 'secondary'
              : null;

        return (
          <PitchSpot
            key={`${mode}-${position.key}-${index}`}
            position={position}
            index={index}
            isSelected={selectionType !== null}
            selectionType={selectionType}
            onPress={onSpotPress}
          />
        );
      })}
    </View>
  );
}
