import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import type { DimensionValue, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type SkeletonBlockProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function SkeletonBlock({ width = '100%', height = 14, borderRadius = 10, style }: SkeletonBlockProps) {
  const theme = useAppColorScheme();
  const baseColor = theme === 'light' ? '#E2E8F0' : '#1E293B';
  const glowFrom = theme === 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.06)';
  const glowMid = theme === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(148,163,184,0.20)';

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: baseColor }, style]}>
      <MotiView
        from={{ translateX: -180 }}
        animate={{ translateX: 240 }}
        transition={{
          type: 'timing',
          duration: 1150,
          loop: true,
        }}
        style={{ position: 'absolute', top: 0, bottom: 0, width: 120 }}
      >
        <LinearGradient
          colors={[glowFrom, glowMid, glowFrom]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </MotiView>
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="rounded-[20px] border border-zinc-300/70 dark:border-slate-500/20 bg-zinc-100 dark:bg-slate-900 p-4 mb-3">
      <SkeletonBlock width="48%" height={12} />
      <SkeletonBlock width="72%" height={20} style={{ marginTop: 12 }} />
      <SkeletonBlock width="92%" height={14} style={{ marginTop: 10 }} />
      <View className="flex-row items-center gap-2 mt-4">
        <SkeletonBlock width={32} height={32} borderRadius={999} />
        <SkeletonBlock width={32} height={32} borderRadius={999} />
        <SkeletonBlock width={32} height={32} borderRadius={999} />
        <SkeletonBlock width="34%" height={10} />
      </View>
    </View>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}
