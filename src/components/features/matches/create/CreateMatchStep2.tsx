import { Pressable, View } from "react-native";

import { RangeSelector } from "@/src/components/features/matches/create/RangeSelector";
import { ToggleRow } from "@/src/components/features/matches/create/ToggleRow";
import { SectionTitle } from "@/src/components/features/matches/shared/SectionTitle";
import { useMatchTheme } from "@/src/components/features/matches/shared/theme";
import { Card, Input, Text } from "@/src/components/ui";

type MinLevelValue =
  | "resenha"
  | "casual"
  | "intermediario"
  | "avancado"
  | "competitivo"
  | "semi_amador"
  | "amador"
  | "ex_profissional";

type CreateMatchStep2Props = {
  matchTheme: ReturnType<typeof useMatchTheme>;
  titles: {
    gameLevel: string;
  };
  labels: {
    pricePerPerson: string;
    durationMinutes: string;
    ageRestrictions: string;
    ageRestrictionsHint: string;
    minimumLevelsAccepted: string;
    restBreakTitle: string;
    restBreakSubtitle: string;
    refereeTitle: string;
    refereeSubtitle: string;
    levelOptionLabel: (value: MinLevelValue) => string;
  };
  pricePerPerson: string;
  durationMinutes: string;
  minAge: number;
  maxAge: number;
  restBreak: boolean;
  referee: boolean;
  acceptedLevels: MinLevelValue[];
  minLevelOptions: Array<{ value: MinLevelValue }>;
  onPricePerPersonChange: (value: string) => void;
  onDurationMinutesChange: (value: string) => void;
  onAgeRangeChange: (nextMin: number, nextMax: number) => void;
  onToggleRestBreak: () => void;
  onToggleReferee: () => void;
  onToggleLevel: (value: MinLevelValue) => void;
};

function MinLevelCheckbox({
  label,
  selected,
  onPress,
  matchTheme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  matchTheme: ReturnType<typeof useMatchTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48.5%] rounded-[14px] border px-[12px] py-[10px] flex-row items-center gap-2"
      style={{
        backgroundColor: matchTheme.colors.bgSurfaceB,
        borderColor: selected
          ? matchTheme.colors.ok
          : matchTheme.colors.lineStrong,
      }}
    >
      <View
        className="w-4 h-4 rounded-[4px] border"
        style={{
          backgroundColor: selected ? matchTheme.colors.ok : "transparent",
          borderColor: selected
            ? matchTheme.colors.ok
            : matchTheme.colors.lineStrong,
        }}
      >
        {selected ? (
          <Text
            variant="micro"
            style={{ color: "#05070B", lineHeight: 14, textAlign: "center" }}
          >
            ✓
          </Text>
        ) : null}
      </View>
      <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function CreateMatchStep2({
  matchTheme,
  titles,
  labels,
  pricePerPerson,
  durationMinutes,
  minAge,
  maxAge,
  restBreak,
  referee,
  acceptedLevels,
  minLevelOptions,
  onPricePerPersonChange,
  onDurationMinutesChange,
  onAgeRangeChange,
  onToggleRestBreak,
  onToggleReferee,
  onToggleLevel,
}: CreateMatchStep2Props) {
  return (
    <View className="gap-[14px]">
      <Card
        className="p-4 border"
        style={{
          backgroundColor: matchTheme.colors.bgSurfaceA,
          borderColor: "rgba(34,183,108,0.35)",
        }}
      >
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Input
              label={labels.pricePerPerson}
              value={pricePerPerson}
              onChangeText={onPricePerPersonChange}
              keyboardType="number-pad"
              placeholder="25"
              leftIcon={
                <Text variant="body" tone="muted">
                  R$
                </Text>
              }
            />
          </View>
          <View className="flex-1">
            <Input
              label={labels.durationMinutes}
              value={durationMinutes}
              onChangeText={onDurationMinutesChange}
              keyboardType="number-pad"
              placeholder="60"
              rightIcon={
                <Text variant="body" tone="muted">
                  min
                </Text>
              }
            />
          </View>
        </View>

        <View className="mt-4">
          <Text
            variant="micro"
            className="uppercase tracking-[2px]"
            style={{ color: matchTheme.colors.fgMuted }}
          >
            {labels.ageRestrictions}
          </Text>
          <View style={{ marginTop: 4 }}>
            <RangeSelector
              minLimit={16}
              maxLimit={80}
              min={minAge}
              max={maxAge}
              onChange={onAgeRangeChange}
            />
          </View>
          <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
            {labels.ageRestrictionsHint}
          </Text>
        </View>

        <View className="gap-2 mt-4">
          <ToggleRow
            title={labels.restBreakTitle}
            subtitle={labels.restBreakSubtitle}
            value={restBreak}
            onToggle={onToggleRestBreak}
          />
          <ToggleRow
            title={labels.refereeTitle}
            subtitle={labels.refereeSubtitle}
            value={referee}
            onToggle={onToggleReferee}
          />
        </View>

        <View
          className="mt-4 mb-3 h-px w-[38%] self-center rounded-full"
          style={{ backgroundColor: matchTheme.colors.lineStrong }}
        />

        <View className="mt-1">
          <View className="items-center">
            <SectionTitle title={titles.gameLevel} />
          </View>
          <View className="flex-row flex-wrap gap-2 mt-3">
            {minLevelOptions.map((level) => (
              <MinLevelCheckbox
                key={level.value}
                label={labels.levelOptionLabel(level.value)}
                selected={acceptedLevels.includes(level.value)}
                onPress={() => onToggleLevel(level.value)}
                matchTheme={matchTheme}
              />
            ))}
          </View>
        </View>
      </Card>
    </View>
  );
}
