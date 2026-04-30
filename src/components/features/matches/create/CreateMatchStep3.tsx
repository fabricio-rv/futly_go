import { View } from "react-native";

import { SegmentedControl } from "@/src/components/features/matches/create/SegmentedControl";
import { SectionTitle } from "@/src/components/features/matches/shared/SectionTitle";
import { useMatchTheme } from "@/src/components/features/matches/shared/theme";
import { TacticalPitch, type PitchMode } from "@/src/components/fifa";
import { Card, Input, Text } from "@/src/components/ui";

type CreateMatchStep3Props = {
  matchTheme: ReturnType<typeof useMatchTheme>;
  titles: {
    descriptionOptional: string;
  };
  labels: {
    positionsHint: string;
    hostPosition: string;
    confirmedCount: string;
    openSlotsCount: string;
    blockedSlotCount: string;
    modalityFutsal: string;
    modalitySociety: string;
    modalityCampo: string;
  };
  mode: PitchMode;
  selectedPositionIndexes: number[];
  pitchWidth: number;
  pitchOffsetTop: number;
  description: string;
  onModeChange: (value: PitchMode) => void;
  onTogglePosition: (index: number) => void;
  onDescriptionChange: (value: string) => void;
};

export function CreateMatchStep3({
  matchTheme,
  titles,
  labels,
  mode,
  selectedPositionIndexes,
  pitchWidth,
  pitchOffsetTop,
  description,
  onModeChange,
  onTogglePosition,
  onDescriptionChange,
}: CreateMatchStep3Props) {
  return (
    <View className="gap-[14px]">
      <Card
        className="p-4"
        style={{
          backgroundColor: matchTheme.colors.bgSurfaceA,
          borderColor: "rgba(34,183,108,0.35)",
        }}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View>
            <Text
              variant="caption"
              style={{ color: matchTheme.colors.fgMuted }}
            >
              {labels.positionsHint}
            </Text>
            <View className="gap-1 mt-2">
              <Text
                variant="caption"
                style={{ color: matchTheme.colors.fgSecondary }}
              >
                {labels.hostPosition}
              </Text>
              <Text
                variant="caption"
                style={{ color: matchTheme.colors.fgSecondary }}
              >
                {labels.confirmedCount}
              </Text>
              <Text
                variant="caption"
                style={{ color: matchTheme.colors.fgSecondary }}
              >
                {labels.openSlotsCount}
              </Text>
              <Text
                variant="caption"
                style={{ color: matchTheme.colors.fgSecondary }}
              >
                {labels.blockedSlotCount}
              </Text>
            </View>
          </View>
          <View className="w-[194px]">
            <SegmentedControl
              options={[
                { id: "futsal", label: labels.modalityFutsal },
                { id: "society", label: labels.modalitySociety },
                { id: "campo", label: labels.modalityCampo },
              ]}
              activeId={mode}
              onChange={(value) => onModeChange(value as PitchMode)}
              compact
            />
          </View>
        </View>

        <View
          className="items-center"
          style={{ marginTop: pitchOffsetTop, marginBottom: 4 }}
          pointerEvents="box-none"
        >
          <View pointerEvents="auto">
            <TacticalPitch
              mode={mode}
              selectedIndexes={selectedPositionIndexes}
              onToggleIndex={onTogglePosition}
              width={pitchWidth}
            />
          </View>
        </View>

        <View className="mt-3">
          <SectionTitle title={titles.descriptionOptional} />
        </View>
        <View className="mt-2">
          <Input
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={onDescriptionChange}
          />
          <Text
            variant="caption"
            className="text-right mt-1"
            style={{ color: matchTheme.colors.fgMuted }}
          >
            {description.length} / 280
          </Text>
        </View>
      </Card>
    </View>
  );
}
