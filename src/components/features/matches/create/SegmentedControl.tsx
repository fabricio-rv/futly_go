import { Pressable, View } from "react-native";

import { Text } from "@/src/components/ui";
import { useMatchTheme } from "../shared/theme";

type SegmentedControlProps = {
  options: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  compact?: boolean;
  appearance?: "pills" | "flat";
  radius?: number;
  containerColor?: string;
  borderColor?: string;
};

export function SegmentedControl({
  options,
  activeId,
  onChange,
  compact = false,
  appearance = "pills",
  radius = 14,
  containerColor,
  borderColor,
}: SegmentedControlProps) {
  const matchTheme = useMatchTheme();
  const isFlat = appearance === "flat";
  const outerRadius = radius;
  const innerHeight = compact ? 30 : 40;
  const outerHeight = compact ? 32 : 42;
  const bgColor =
    containerColor ?? (isFlat ? "#10B981" : matchTheme.colors.lineStrong);
  const outlineColor = borderColor ?? bgColor;

  return (
    <View
      className="border flex-row overflow-hidden"
      style={{
        borderRadius: outerRadius,
        backgroundColor: bgColor,
        borderColor: outlineColor,
        minHeight: outerHeight,
      }}
    >
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className="flex-1 items-center justify-center"
            style={{
              backgroundColor: isFlat
                ? active
                  ? matchTheme.colors.ok
                  : "transparent"
                : active
                  ? matchTheme.colors.ok
                  : matchTheme.colors.bgSurfaceA,
              minHeight: innerHeight,
            }}
          >
            <Text
              variant={compact ? "caption" : "label"}
              style={{
                color: isFlat
                  ? active
                    ? "#05070B"
                    : matchTheme.colors.fgSecondary
                  : active
                    ? "#05070B"
                    : matchTheme.colors.fgSecondary,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
