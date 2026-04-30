import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useRef, useState } from "react";
import { PanResponder, View } from "react-native";

import { Text } from "@/src/components/ui";
import { useMatchTheme } from "../shared/theme";

type RangeSelectorProps = {
  minLimit: number;
  maxLimit: number;
  min: number;
  max: number;
  onChange: (nextMin: number, nextMax: number) => void;
};

export function RangeSelector({
  minLimit,
  maxLimit,
  min,
  max,
  onChange,
}: RangeSelectorProps) {
  const matchTheme = useMatchTheme();
  const [trackWidth, setTrackWidth] = useState(1);
  const minStartRef = useRef(min);
  const maxStartRef = useRef(max);

  const span = Math.max(1, maxLimit - minLimit);
  const minPercent = ((min - minLimit) / span) * 100;
  const maxPercent = ((max - minLimit) / span) * 100;

  const pxToSteps = (dx: number) => {
    if (trackWidth <= 0) return 0;
    return Math.round((dx / trackWidth) * span);
  };

  const minPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          minStartRef.current = min;
        },
        onPanResponderMove: (_, gesture) => {
          const steps = pxToSteps(gesture.dx);
          const nextMin = Math.max(
            minLimit,
            Math.min(minStartRef.current + steps, max - 1),
          );

          if (nextMin !== min) {
            onChange(nextMin, max);
          }
        },
      }),
    [max, min, minLimit, onChange, trackWidth],
  );

  const maxPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          maxStartRef.current = max;
        },
        onPanResponderMove: (_, gesture) => {
          const steps = pxToSteps(gesture.dx);
          const nextMax = Math.min(
            maxLimit,
            Math.max(maxStartRef.current + steps, min + 1),
          );

          if (nextMax !== max) {
            onChange(min, nextMax);
          }
        },
      }),
    [max, maxLimit, min, onChange, trackWidth],
  );

  return (
    <View>
      <View className="flex-row items-center px-[2px]">
        <View className="flex-1 min-w-0 flex-row items-center gap-1.5">
          <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
            Min
          </Text>
          <Text
            variant="title"
            numberOfLines={1}
            style={{
              color: matchTheme.colors.fgPrimary,
              fontSize: 20,
              lineHeight: 24,
            }}
          >
            {min}
          </Text>
        </View>
        <View className="flex-1 min-w-0 flex-row items-center justify-end gap-1.5">
          <Text
            variant="title"
            numberOfLines={1}
            style={{
              color: matchTheme.colors.fgPrimary,
              fontSize: 20,
              lineHeight: 24,
            }}
          >
            {max}
          </Text>
          <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
            Max
          </Text>
        </View>
      </View>

      <View
        className="h-[6px] rounded-full mt-3 mb-2 relative overflow-visible"
        style={{ backgroundColor: matchTheme.colors.lineStrong }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={["#22B76C", "#F6D27A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />
        <View
          className="absolute w-[18px] h-[18px] rounded-full border-[3px] border-[#22B76C]"
          style={{
            backgroundColor: matchTheme.colors.bgSurfaceA,
            left: `${minPercent}%`,
            top: -6,
            marginLeft: -9,
          }}
          {...minPan.panHandlers}
        />
        <View
          className="absolute w-[18px] h-[18px] rounded-full border-[3px] border-[#D4A13A]"
          style={{
            backgroundColor: matchTheme.colors.bgSurfaceA,
            left: `${maxPercent}%`,
            top: -6,
            marginLeft: -9,
          }}
          {...maxPan.panHandlers}
        />
      </View>
    </View>
  );
}
