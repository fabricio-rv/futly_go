import { Pressable, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { PITCH_COLORS, PITCH_SIZES } from './constants';
import type { PitchSpotProps } from './types';

export function PitchSpot({
  position,
  index,
  isSelected,
  selectionType,
  onPress,
}: PitchSpotProps) {
  const isPrimary = selectionType === 'primary';
  const isSecondary = selectionType === 'secondary';

  const backgroundColor = isPrimary
    ? PITCH_COLORS.spot.primary
    : isSecondary
      ? PITCH_COLORS.spot.secondary
      : PITCH_COLORS.spot.unselected;

  const borderColor = isSelected
    ? 'rgba(255,255,255,0.9)'
    : 'rgba(255,255,255,0.35)';

  const borderWidth = isSelected
    ? PITCH_SIZES.borderWidth.selected
    : PITCH_SIZES.borderWidth.unselected;

  const textColor = isSelected
    ? PITCH_COLORS.text.selected
    : PITCH_COLORS.text.unselected;

  let badge = '';
  if (isPrimary) badge = '①';
  else if (isSecondary) badge = '②';

  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityLabel={`${position.label} - ${position.key}`}
      accessibilityHint={
        badge
          ? `Selecionado como posição ${isPrimary ? 'principal' : 'secundária'}`
          : 'Posição disponível'
      }
      className="absolute items-center justify-center"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: PITCH_SIZES.spotDiameter,
        height: PITCH_SIZES.spotDiameter,
        marginLeft: -PITCH_SIZES.spotRadius,
        marginTop: -PITCH_SIZES.spotRadius,
      }}
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          borderRadius: PITCH_SIZES.spotRadius,
          backgroundColor,
          borderWidth,
          borderColor,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: isSelected ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0,
          shadowRadius: 4,
          elevation: isSelected ? 4 : 0,
        }}
      >
        <View className="items-center gap-1">
          <Text
            variant="label"
            className="font-bold"
            style={{
              color: textColor,
              fontSize: PITCH_SIZES.fontSize,
              lineHeight: PITCH_SIZES.fontSize * 1.2,
            }}
          >
            {position.key}
          </Text>
          {badge && (
            <Text
              style={{
                color: textColor,
                fontSize: PITCH_SIZES.fontSize - 2,
                fontWeight: '700',
              }}
            >
              {badge}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
