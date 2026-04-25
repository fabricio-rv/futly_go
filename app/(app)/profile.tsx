import { router } from 'expo-router';
import { CalendarClock, ChevronRight, MapPin, Settings, ShieldCheck, Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { IconButton, Text } from '@/src/components/ui';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { fetchUsersPositionStats, type UserPositionStat } from '@/src/features/profile/services/profileService';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export default function ProfileScreen() {
  const theme = useAppColorScheme();
  const { profile, loadProfile } = useProfile();
  const { agenda, getUserAgenda } = useMatches();
  const [positionStats, setPositionStats] = useState<UserPositionStat[]>([]);

  useEffect(() => {
    loadProfile().catch(() => undefined);
    getUserAgenda().catch(() => undefined);
  }, [getUserAgenda, loadProfile]);

  useEffect(() => {
    if (!profile?.id) return;

    fetchUsersPositionStats([profile.id])
      .then(setPositionStats)
      .catch(() => setPositionStats([]));
  }, [profile]);

  const summary = useMemo(
    () => [
      { id: 'created', label: 'Partidas criadas', value: String(agenda.criadas.length) },
      { id: 'booked', label: 'Partidas marcadas', value: String(agenda.marcadas.length) },
      { id: 'history', label: 'Partidas realizadas', value: String(agenda.criadas.length + agenda.marcadas.length) },
    ],
    [agenda.criadas.length, agenda.marcadas.length],
  );

  const recentMatches = useMemo(() => [...agenda.criadas, ...agenda.marcadas].slice(0, 2), [agenda]);

  const initials = (profile?.full_name ?? 'Atleta Futly')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const bgColor = theme === 'light' ? '#F3F6FB' : '#0A0E18';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav
          title="Perfil"
          subtitle="ATLETA"
          rightNode={<IconButton icon={<Settings size={16} color={theme === 'light' ? '#1F2937' : '#FFFFFF'} />} onPress={() => router.push('/(app)/settings')} />}
        />

        <LinearGradient
          colors={theme === 'light' ? ['#E3F5EC', '#D6EEE3'] : ['#0F3A24', '#072314']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-[18px] rounded-[18px] border border-[#22B76C4D] p-[14px]"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-[52px] w-[52px] rounded-full border-2 border-goldB bg-[#1B3A5F] items-center justify-center">
              <Text variant="label" className="font-bold text-white">
                {initials || 'AF'}
              </Text>
            </View>
            <View className="flex-1">
              <Text variant="bodyLg" className="font-bold text-gray-900 dark:text-white">
                {profile?.full_name ?? 'Atleta Futly'}
              </Text>
              <Text variant="micro" className="mt-0.5 tracking-[0.4px]" style={{ color: theme === 'light' ? '#2F6C54' : '#86E5B4' }}>
                {profile?.email ?? 'sem-email'}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-2">
            <View className="flex-1 rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0C111E] px-3 py-2">
              <Text variant="micro" className="uppercase tracking-[1.4px] text-gray-600 dark:text-fg4">
                Cidade
              </Text>
              <Text variant="label" className="mt-1 font-semibold text-gray-900 dark:text-white">
                {profile?.city ?? 'Nao definida'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <Trophy size={16} color="#D4A13A" strokeWidth={2} />
            <Text variant="label" className="font-bold text-gray-900 dark:text-white">
              Resumo no app
            </Text>
          </View>

          <View className="mt-3 flex-row gap-2">
            {summary.map((item) => (
              <View key={item.id} className="flex-1 rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0A0F1C] px-2 py-2">
                <Text variant="title" className="font-bold text-gray-900 dark:text-white text-center">
                  {item.value}
                </Text>
                <Text variant="micro" className="text-gray-600 dark:text-fg3 text-center mt-1">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <CalendarClock size={16} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} strokeWidth={2} />
            <Text variant="label" className="font-bold text-gray-900 dark:text-white">
              Proximas partidas
            </Text>
          </View>

          <View className="mt-3 gap-2">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <View key={match.id} className="rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0A0F1C] px-3 py-3">
                  <View className="flex-row items-center justify-between">
                    <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                      {match.title}
                    </Text>
                    <Text variant="micro" className="text-gray-600 dark:text-fg3">
                      {match.timeLabel}
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center gap-2">
                    <MapPin size={13} color={theme === 'light' ? 'rgba(15,23,42,0.45)' : 'rgba(255,255,255,0.45)'} />
                    <Text variant="micro" className="text-gray-600 dark:text-fg3">
                      {match.location} - {match.dateLabel}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text variant="caption" className="text-gray-600 dark:text-fg3">Nenhuma partida na agenda.</Text>
            )}
          </View>
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[14px]">
          <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-3">
            Historico por posicao e modalidade
          </Text>

          {positionStats.length === 0 ? (
            <View className="rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0A0F1C] px-3 py-3">
              <Text variant="caption" className="text-gray-600 dark:text-fg3">
                Ainda nao ha historico de posicoes jogadas.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {positionStats.map((stat) => (
                <View key={`${stat.modality}:${stat.positionKey}`} className="rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0A0F1C] px-3 py-3">
                  <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                    {stat.modality.toUpperCase()} - {stat.positionLabel}
                  </Text>
                  <Text variant="micro" className="mt-1 text-gray-600 dark:text-fg3">
                    {stat.matchesCount} jogos nessa posicao/modalidade
                  </Text>
                  <Text variant="micro" className="mt-1 text-gray-600 dark:text-fg3">
                    {stat.ratingsCount > 0 && stat.avgRating !== null
                      ? `Media de avaliacoes: ${stat.avgRating.toFixed(1)} (${stat.ratingsCount} avaliacoes)`
                      : 'Ainda sem avaliacoes recebidas nessa posicao/modalidade.'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2 mb-3">
            <ShieldCheck size={16} color={theme === 'light' ? '#5B6B80' : '#9DB0D1'} strokeWidth={2} />
            <Text variant="label" className="font-bold text-gray-900 dark:text-white">
              Acessos rapidos
            </Text>
          </View>

          <View className="gap-2">
            <Pressable
              className="rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0A0F1C] px-3 py-3 flex-row items-center justify-between"
              onPress={() => router.push('/(app)/edit-profile')}
            >
              <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                Editar meu perfil
              </Text>
              <ChevronRight size={16} color={theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.5)'} />
            </Pressable>
            <Pressable
              className="rounded-[12px] border border-gray-200 dark:border-line bg-white dark:bg-[#0A0F1C] px-3 py-3 flex-row items-center justify-between"
              onPress={() => router.push('/(app)/settings')}
            >
              <Text variant="label" className="font-semibold text-gray-900 dark:text-white">
                Configuracoes
              </Text>
              <ChevronRight size={16} color={theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.5)'} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="profile" />
    </SafeAreaView>
  );
}
