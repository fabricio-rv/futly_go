import { Pressable, View } from 'react-native';

import { Text } from '../ui/Text';

export type PitchMode = 'futsal' | 'society' | 'campo';

type Slot = {
  key: string;
  x: number;
  y: number;
};

const formations: Record<PitchMode, Slot[]> = {
  futsal: [
    { key: 'GOL', x: 50, y: 90 },
    { key: 'FIXO', x: 50, y: 65 },
    { key: 'ALD', x: 80, y: 40 },
    { key: 'ALE', x: 20, y: 40 },
    { key: 'PIVO', x: 50, y: 16 },
  ],
  society: [
    { key: 'GOL', x: 50, y: 90 },
    { key: 'FIXO', x: 50, y: 70 },
    { key: 'VOL', x: 36, y: 52 },
    { key: 'MC', x: 66, y: 48 },
    { key: 'ALE', x: 15, y: 30 },
    { key: 'ALD', x: 85, y: 30 },
    { key: 'PIVO', x: 50, y: 15 },
  ],
  campo: [
    { key: 'GOL', x: 50, y: 92 },
    { key: 'LE', x: 16, y: 76 },
    { key: 'ZAG-E', x: 40, y: 76 },
    { key: 'ZAG-D', x: 60, y: 76 },
    { key: 'LD', x: 84, y: 76 },
    { key: 'VOL', x: 30, y: 56 },
    { key: 'MC', x: 70, y: 54 },
    { key: 'MEI', x: 50, y: 40 },
    { key: 'PE', x: 15, y: 26 },
    { key: 'ATA', x: 50, y: 15 },
    { key: 'PD', x: 85, y: 26 },
  ],
};

type PitchSpotTone = 'inactive' | 'available' | 'pending' | 'confirmed';

type TacticalPitchProps = {
  mode?: PitchMode;
  selectedIndexes?: number[];
  spotTones?: PitchSpotTone[];
  onToggleIndex?: (index: number) => void;
  width?: number;
};

const toneByState: Record<PitchSpotTone, { bg: string; border: string; text: string; borderWidth: number }> = {
  inactive: {
    bg: 'rgba(148,163,184,0.26)',
    border: 'rgba(203,213,225,0.48)',
    text: 'rgba(241,245,249,0.88)',
    borderWidth: 1.5,
  },
  available: {
    bg: '#22B76C',
    border: 'rgba(255,255,255,0.8)',
    text: '#F5F7FA',
    borderWidth: 3,
  },
  pending: {
    bg: '#EAB308',
    border: 'rgba(255,255,255,0.85)',
    text: '#111827',
    borderWidth: 3,
  },
  confirmed: {
    bg: '#38BDF8',
    border: 'rgba(255,255,255,0.9)',
    text: '#0B1020',
    borderWidth: 3,
  },
};

export function TacticalPitch({
  mode = 'futsal',
  selectedIndexes = [],
  spotTones,
  onToggleIndex,
  width = 300,
}: TacticalPitchProps) {
  const slots = formations[mode];
  const selected = new Set(selectedIndexes);
  const height = Math.round(width * 1.52);

  return (
    <View
      className="rounded-[22px] border border-emerald-500/35 overflow-hidden"
      style={{
        width,
        height,
        backgroundColor: '#0B2D1D',
      }}
    >
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0,154,84,0.18)',
        }}
      />

      <View className="absolute inset-[12px] rounded-[14px] border border-white/15" />
      <View className="absolute left-[12px] right-[12px] top-1/2 border-t border-white/15" />
      <View className="absolute left-1/2 top-1/2 w-14 h-14 rounded-full border border-white/15 -ml-7 -mt-7" />

      {slots.map((slot, index) => {
        const tone: PitchSpotTone = spotTones?.[index] ?? (selected.has(index) ? 'available' : 'inactive');
        const toneToken = toneByState[tone];

        return (
          <Pressable
            key={`${slot.key}-${index}`}
            onPress={() => onToggleIndex?.(index)}
            disabled={!onToggleIndex}
            className="absolute items-center justify-center rounded-full"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: 54,
              height: 54,
              marginLeft: -27,
              marginTop: -27,
              backgroundColor: toneToken.bg,
              borderWidth: toneToken.borderWidth,
              borderColor: toneToken.border,
              opacity: onToggleIndex ? 1 : 0.98,
            }}
          >
            <Text
              variant="label"
              className="font-bold"
              style={{
                color: toneToken.text,
                fontSize: 12,
              }}
            >
              {slot.key}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
