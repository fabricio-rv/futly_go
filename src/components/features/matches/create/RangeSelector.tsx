import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { Text } from "@/src/components/ui";
import { useMatchTheme } from "../shared/theme";

type RangeSelectorProps = {
  minLimit: number;
  maxLimit: number;
  min: number;
  max: number;
  onChange: (nextMin: number, nextMax: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
};

export function RangeSelector({
  minLimit,
  maxLimit,
  min,
  max,
  onChange,
  onDragStateChange,
}: RangeSelectorProps) {
  const matchTheme = useMatchTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [trackWidth, setTrackWidth] = useState(1);
  const minStartRef = useRef(min);
  const maxStartRef = useRef(max);
  const minRef = useRef(min);
  const maxRef = useRef(max);

  useEffect(() => {
    minRef.current = min;
    maxRef.current = max;
  }, [min, max]);

  const span = Math.max(1, maxLimit - minLimit);
  const isSmallScreen = windowWidth <= 390;
  const horizontalInset = isSmallScreen ? 10 : 8;
  const handleTouchSize = isSmallScreen ? 24 : 28;
  const handleCoreSize = isSmallScreen ? 16 : 18;
  const handleHalf = handleTouchSize / 2;
  const handleTop = 3 - handleHalf;
  const minPercent = ((min - minLimit) / span) * 100;
  const maxPercent = ((max - minLimit) / span) * 100;

  const pxToSteps = (dx: number) => {
    if (trackWidth <= 0) return 0;
    // Menos sensivel: precisa arrastar mais pixels para trocar 1 ano.
    const smoothing = 0.65;
    return Math.round((dx / trackWidth) * span * smoothing);
  };

  const minGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          minStartRef.current = minRef.current;
          onDragStateChange?.(true);
        })
        .onUpdate((event) => {
          const steps = pxToSteps(event.translationX);
          const nextMin = Math.max(
            minLimit,
            Math.min(minStartRef.current + steps, maxRef.current - 1),
          );
          if (nextMin !== minRef.current) {
            onChange(nextMin, maxRef.current);
          }
        })
        .onFinalize(() => {
          onDragStateChange?.(false);
        }),
    [minLimit, onChange, onDragStateChange, trackWidth],
  );

  const maxGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          maxStartRef.current = maxRef.current;
          onDragStateChange?.(true);
        })
        .onUpdate((event) => {
          const steps = pxToSteps(event.translationX);
          const nextMax = Math.min(
            maxLimit,
            Math.max(maxStartRef.current + steps, minRef.current + 1),
          );
          if (nextMax !== maxRef.current) {
            onChange(minRef.current, nextMax);
          }
        })
        .onFinalize(() => {
          onDragStateChange?.(false);
        }),
    [maxLimit, onChange, onDragStateChange, trackWidth],
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
        style={{
          backgroundColor: matchTheme.colors.lineStrong,
          marginHorizontal: horizontalInset,
        }}
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
        <GestureDetector gesture={minGesture}>
          <View
            className="absolute items-center justify-center"
            style={{
              left: `${minPercent}%`,
              top: handleTop,
              marginLeft: -handleHalf,
              width: handleTouchSize,
              height: handleTouchSize,
            }}
            collapsable={false}
          >
            <View
              className="rounded-full border-[3px] border-[#22B76C]"
              style={{
                width: handleCoreSize,
                height: handleCoreSize,
                backgroundColor: matchTheme.colors.bgSurfaceA,
              }}
            />
          </View>
        </GestureDetector>
        <GestureDetector gesture={maxGesture}>
          <View
            className="absolute items-center justify-center"
            style={{
              left: `${maxPercent}%`,
              top: handleTop,
              marginLeft: -handleHalf,
              width: handleTouchSize,
              height: handleTouchSize,
            }}
            collapsable={false}
          >
            <View
              className="rounded-full border-[3px] border-[#D4A13A]"
              style={{
                width: handleCoreSize,
                height: handleCoreSize,
                backgroundColor: matchTheme.colors.bgSurfaceA,
              }}
            />
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}
