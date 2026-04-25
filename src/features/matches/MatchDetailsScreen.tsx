import { Share2, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, View } from 'react-native';

import {
  InfraGrid,
  MatchBackground,
  MapPreviewCard,
  MatchTopNav,
  PlayerRow,
  SectionTitle,
  StatBadge,
  StatusStamp,
  matchTheme,
} from '@/src/components/features/matches';
import { TacticalPitch } from '@/src/components/fifa/TacticalPitch';
import { Button, Card, Screen, Text } from '@/src/components/ui';
import { hostMatch, infraItems, playersSeed } from './mockData';

export function MatchDetailsScreen() {
  const router = useRouter();

  return (
    <Screen padded={false} showBackground={false}>
      <MatchBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <MatchTopNav
          title="Detalhes"
          subtitle="PARTIDA #2148"
          rightSlot={
            <View className="w-10 h-10 rounded-[14px] border items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.10)' }}>
              <Share2 color={matchTheme.colors.fgPrimary} size={16} />
            </View>
          }
        />

        <View className="px-[18px]">
          <LinearGradient colors={['#0F3A24', '#072314', '#021109']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-[20px] p-[18px] mb-[14px]">
            <View className="absolute top-[14px] right-[14px]">
              <StatusStamp status="confirmed" label="Confirmado" />
            </View>
            <Text variant="micro" className="uppercase tracking-[2px] font-bold" style={{ color: matchTheme.colors.okSoft }}>
              FUTSAL - QUADRA B
            </Text>
            <Text variant="number" className="text-[64px] leading-[56px] mt-1">25 ABR</Text>
            <View className="flex-row items-end gap-2 mt-1">
              <Text variant="number" className="text-[30px]" style={{ color: matchTheme.colors.goldA }}>19h30</Text>
              <Text variant="micro" className="uppercase tracking-[2px] pb-1" style={{ color: matchTheme.colors.fgSecondary }}>
                - Noite - 60min
              </Text>
            </View>
            <View className="flex-row gap-2 mt-[14px] flex-wrap">
              <StatBadge label="NIVEL OURO 75+" tone="gold" small />
              <StatBadge label="R$ 25/pessoa" tone="neutral" small />
              <StatBadge label="5/7 vagas" tone="neutral" small />
            </View>
          </LinearGradient>

          <SectionTitle title="Localizacao" />
          <MapPreviewCard addressLine="R. dos Andradas, 1234" districtLine="Cidade Baixa - Porto Alegre - 90020-300" />

          <View className="mt-[14px]">
            <SectionTitle title="Organizador" />
            <Card className="p-[14px]" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <View className="flex-row items-center gap-3">
                <LinearGradient colors={['#C69745', '#3A2A0B']} className="w-12 h-12 rounded-full border-2 border-[#D4A13A] items-center justify-center">
                  <Text variant="label" className="font-bold">PK</Text>
                </LinearGradient>
                <View className="flex-1">
                  <Text variant="body" className="font-semibold">Pedro K.</Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>4.9 - 38 partidas</Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>(51) 99820-1144 - Resp. em ~5min</Text>
                </View>
                <View className="w-10 h-10 rounded-[12px] items-center justify-center border" style={{ borderColor: 'rgba(34,183,108,0.35)', backgroundColor: 'rgba(34,183,108,0.14)' }}>
                  <Phone size={18} color={matchTheme.colors.okSoft} />
                </View>
              </View>
            </Card>
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Infraestrutura" />
            <InfraGrid items={hostMatch.infra ?? infraItems} />
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Escalacao Confirmada" />
            <Card className="p-[14px]" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              <View className="items-center">
                <TacticalPitch mode="futsal" selectedIndexes={[0, 1, 2, 5]} width={200} />
              </View>
              <View className="mt-3 flex-row justify-center gap-4">
                <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>5 confirmados</Text>
                <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>2 vagas</Text>
              </View>
            </Card>
          </View>

          <View className="mt-[14px]">
            <SectionTitle title="Atletas Confirmados" badge="5" actionText="Convidar" />
            <Card className="p-0 overflow-hidden" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}>
              {playersSeed.map((player) => (
                <PlayerRow key={player.id} player={player} />
              ))}
            </Card>
          </View>

          <View className="mt-[14px] gap-2">
            <View className="flex-row gap-2">
              <View className="flex-1"><Button label="Chat" onPress={() => {}} /></View>
              <View className="flex-1">
                <Button
                  label="Avaliar"
                  onPress={() => router.push('/matches/rating' as never)}
                  fullWidth
                  style={{ backgroundColor: '#D4A13A' }}
                />
              </View>
            </View>
            <Button label="Desmarcar Presenca" variant="destructive" onPress={() => {}} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
