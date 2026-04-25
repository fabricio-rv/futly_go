import { ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HubHeader,
  MatchBottomNav,
  PlayerRow,
  RatingCard,
  SectionTitle,
  StatBadge,
  StepIndicator,
  matchTheme,
} from '@/src/components/features/matches';
import { Text } from '@/src/components/ui';
import { ratePlayers, rateTags } from '@/src/features/matches/mockData';

function gradeLabel(stars: number) {
  if (stars >= 5) return 'EXCELENTE';
  if (stars >= 4) return 'MUITO BOM';
  if (stars >= 3) return 'BOM';
  if (stars >= 2) return 'REGULAR';
  return 'A MELHORAR';
}

export default function RateScreen() {
  const [hostStars, setHostStars] = useState(4);
  const [anonymous, setAnonymous] = useState(false);

  const selectedTags = useMemo(() => rateTags.filter((tag) => tag.active), []);

  return (
    <SafeAreaView className="flex-1 bg-ink-0">
      <HubHeader />
      <StepIndicator total={2} current={2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 140 }}>
        <View className="flex-row items-center justify-between mb-3">
          <SectionTitle title="Avalie o Organizador" />
          <StatBadge label="+25 XP" tone="warn" small />
        </View>

        <RatingCard
          initials="PK"
          name="Pedro K."
          context="Host da partida no Arena Central - Quinta 19h30"
          stars={hostStars}
          onChangeStars={setHostStars}
          gradeLabel={gradeLabel(hostStars)}
        />

        <View className="rounded-[20px] border p-4 mt-3 mb-3" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
          <Text variant="micro" className="mb-2" style={{ color: matchTheme.colors.fgMuted }}>SOBRE O ORGANIZADOR</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {rateTags.map((tag) => (
              <StatBadge key={tag.id} label={tag.label} tone={tag.active ? 'active' : 'neutral'} />
            ))}
          </View>

          <Text variant="micro" className="mb-2" style={{ color: matchTheme.colors.fgMuted }}>COMENTARIO (OPCIONAL)</Text>
          <TextInput
            multiline
            textAlignVertical="top"
            className="min-h-[110px] rounded-[14px] border px-3 py-3 text-sm"
            style={{
              color: matchTheme.colors.fgPrimary,
              backgroundColor: '#0C111E',
              borderColor: 'rgba(34,183,108,0.35)',
            }}
            defaultValue="Pontual, organizacao perfeita. Quadra um pouco apertada para o nivel, mas no geral foi top."
            placeholderTextColor={matchTheme.colors.fgMuted}
          />

          <View className="mt-3 rounded-[14px] border px-3 py-3 flex-row items-center justify-between" style={{ backgroundColor: '#0C111E', borderColor: matchTheme.colors.lineStrong }}>
            <View className="pr-3 flex-1">
              <Text variant="label" className="font-semibold">Avaliacao anonima</Text>
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>Seu nome nao aparece</Text>
            </View>
            <Switch onValueChange={setAnonymous} value={anonymous} />
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <SectionTitle title="Proximo: Avalie 4 Atletas" />
          <StatBadge label="HOST" tone="gold" small />
        </View>

        <View className="rounded-[20px] border overflow-hidden mb-3" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
          {ratePlayers.map((player, index) => (
            <PlayerRow key={player.id} player={{ id: player.id, name: player.name, initials: player.initials, ovr: player.ovr, position: player.position, gradient: [player.gradient[0], player.gradient[1]] }} showStars={index < 2 ? (index === 0 ? 5 : 4) : undefined} pendingLabel={index > 1 ? 'Pendente' : undefined} />
          ))}
        </View>

        <Pressable className="h-14 rounded-[14px] items-center justify-center flex-row" style={{ backgroundColor: matchTheme.colors.ok }}>
          <Text variant="label" style={{ color: '#05070B' }}>Continuar para Atletas</Text>
          <ChevronRight size={14} stroke="#05070B" />
        </Pressable>
      </ScrollView>

      {selectedTags.length > 0 ? (
        <View className="absolute bottom-24 left-4 right-4 rounded-[14px] border p-3 flex-row items-center" style={{ borderColor: 'rgba(34,183,108,0.35)', backgroundColor: matchTheme.colors.bgSurfaceA }}>
          <View className="h-9 w-9 rounded-[10px] items-center justify-center" style={{ backgroundColor: 'rgba(34,183,108,0.14)' }}>
            <Text variant="caption" style={{ color: matchTheme.colors.okSoft }}>OK</Text>
          </View>
          <View className="ml-3">
            <Text variant="label" className="font-semibold">Avaliacao salva</Text>
            <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>Pedro recebeu {hostStars} estrelas</Text>
          </View>
        </View>
      ) : null}

      <MatchBottomNav active="none" />
    </SafeAreaView>
  );
}
