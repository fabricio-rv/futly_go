import { router } from 'expo-router';
import { CalendarClock, ChevronRight, MapPin, Settings, ShieldCheck, Star, Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Text } from '@/src/components/ui';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { fetchUsersPositionStats, type UserPositionStat } from '@/src/features/profile/services/profileService';
import { MATCH_POSITIONS } from '@/src/features/matches/constants';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export default function ProfileScreen() {
  const { t } = useTranslation('profile');
  const matchT = useTranslation('matches').t;
  const theme = useAppColorScheme();
  const insets = useSafeAreaInsets();
  const { profile, loadProfile } = useProfile();
  const { agenda, getUserAgenda } = useMatches();
  const [positionStats, setPositionStats] = useState<UserPositionStat[]>([]);

  const translateDayAbbr = (dayAbbr: string) => {
    const days: Record<string, string> = {
      SEG: matchT('days.mon', 'SEG'),
      TER: matchT('days.tue', 'TER'),
      QUA: matchT('days.wed', 'QUA'),
      QUI: matchT('days.thu', 'QUI'),
      SEX: matchT('days.fri', 'SEX'),
      SAB: matchT('days.sat', 'SAB'),
      DOM: matchT('days.sun', 'DOM'),
    };
    return days[dayAbbr] || dayAbbr;
  };

  const translateShiftLabel = (shift: string) => {
    const shifts: Record<string, string> = {
      Manha: matchT('shifts.morning', 'Manha'),
      Tarde: matchT('shifts.afternoon', 'Tarde'),
      Noite: matchT('shifts.evening', 'Noite'),
    };
    return shifts[shift] || shift;
  };

  const translateDateLabel = (label: string) => {
    const parts = label.split(' - ');
    if (parts.length === 2) {
      return `${translateDayAbbr(parts[0])} - ${translateShiftLabel(parts[1])}`;
    }
    return label;
  };
  const formatModalityLabel = (modality: string) => {
    const normalized = (modality || '').toLowerCase();
    if (normalized === 'futsal') return 'Futsal';
    if (normalized === 'society') return 'Society';
    if (normalized === 'campo') return 'Campo';
    return modality;
  };
  const getRealPositionLabel = (stat: UserPositionStat) => {
    const modalityKey = (stat.modality || '').toLowerCase() as keyof typeof MATCH_POSITIONS;
    const options = MATCH_POSITIONS[modalityKey];
    if (!options) return stat.positionLabel;
    const byKey = options.find((item) => item.key === stat.positionKey);
    return byKey?.label || stat.positionLabel;
  };

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
      { id: 'created', label: t('summary.createdMatches', 'Partidas criadas'), value: String(agenda.criadas.length) },
      { id: 'booked', label: t('summary.bookedMatches', 'Partidas marcadas'), value: String(agenda.marcadas.length) },
      { id: 'history', label: t('summary.playedMatches', 'Partidas realizadas'), value: String(agenda.criadas.length + agenda.marcadas.length) },
    ],
    [agenda.criadas.length, agenda.marcadas.length, t],
  );

  const upcomingMatches = useMemo(() => {
    const now = Date.now();

    const hostMatches = agenda.criadas.map((match) => ({ match, role: 'host' as const }));
    const playerMatches = agenda.marcadas.map((match) => ({ match, role: 'player' as const }));

    return [...hostMatches, ...playerMatches]
      .filter(({ match }) => {
        const when =
          match.matchDate && match.matchTime
            ? new Date(`${match.matchDate}T${match.matchTime}`).getTime()
            : null;
        const isFuture = when !== null && !Number.isNaN(when) ? when > now : match.status !== 'done';
        return isFuture && match.status !== 'done';
      })
      .sort((a, b) => {
        const aWhen = a.match.matchDate && a.match.matchTime
          ? new Date(`${a.match.matchDate}T${a.match.matchTime}`).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bWhen = b.match.matchDate && b.match.matchTime
          ? new Date(`${b.match.matchDate}T${b.match.matchTime}`).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aWhen - bWhen;
      })
      .slice(0, 4);
  }, [agenda.criadas, agenda.marcadas]);

  const initials = (profile?.full_name ?? 'Atleta Futly')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const bgColor = theme === 'light' ? '#F4F6F9' : '#0A0E18';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor, paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav
          title={t('headers.myProfile', 'Perfil')}
          hideBack
          rightNode={
            <Pressable onPress={() => router.push('/(app)/settings')} hitSlop={12} className="w-10 h-10 items-center justify-center">
              <Settings size={20} color={theme === 'light' ? '#1F2937' : '#FFFFFF'} />
            </Pressable>
          }
        />

        <LinearGradient
          colors={theme === 'light' ? ['#E3F5EC', '#D6EEE3'] : ['#0F3A24', '#072314']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 18, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(34,183,108,0.30)', padding: 14 }}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-[52px] w-[52px] rounded-full border-2 border-goldB dark:bg-[#1B3A5F] bg-[#E3F5EC] items-center justify-center">
              <Text variant="label" className="font-bold text-white dark:text-white" style={{ color: theme === 'light' ? '#1A7A4A' : '#FFFFFF' }}>
                {initials || 'AF'}
              </Text>
            </View>
            <View className="flex-1">
              <Text variant="bodyLg" className="font-bold text-[#111827] dark:text-white">
                {profile?.full_name ?? 'Atleta Futly'}
              </Text>
              <Text variant="micro" className="mt-0.5 tracking-[0.4px]" style={{ color: theme === 'light' ? '#2F6C54' : '#86E5B4' }}>
                {profile?.email ?? 'sem-email'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <Trophy size={16} color="#D4A13A" strokeWidth={2} />
            <Text variant="label" className="font-bold text-[#111827] dark:text-white">
              {t('summary.appSummary', 'Resumo no app')}
            </Text>
          </View>

          <View className="mt-3 flex-row gap-2">
            {summary.map((item) => (
              <View key={item.id} className="flex-1 rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-2 py-2">
                <Text variant="title" className="font-bold text-[#111827] dark:text-white text-center">
                  {item.value}
                </Text>
                <Text variant="micro" className="text-[#4B5563] dark:text-fg3 text-center mt-1">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <CalendarClock size={16} color={theme === 'light' ? '#1A8F57' : '#86E5B4'} strokeWidth={2} />
            <Text variant="label" className="font-bold text-[#111827] dark:text-white">
              {t('summary.nextMatches', 'Proximas partidas')}
            </Text>
          </View>

          <View className="mt-3 gap-2">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map(({ match, role }) => (
                <View key={match.id} className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3">
                  <View className="flex-row items-center justify-between">
                    <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                      {match.title}
                    </Text>
                    <View
                      className="rounded-full px-2 py-1"
                      style={{ backgroundColor: role === 'host' ? 'rgba(34,183,108,0.16)' : 'rgba(59,130,246,0.16)' }}
                    >
                      <Text
                        variant="micro"
                        className="font-semibold"
                        style={{ color: role === 'host' ? '#1A8F57' : '#2563EB' }}
                      >
                        {role === 'host' ? 'Host' : 'Jogador'}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-1 flex-row items-center justify-between gap-2">
                    <MapPin size={13} color={theme === 'light' ? 'rgba(15,23,42,0.45)' : 'rgba(255,255,255,0.45)'} />
                    <Text variant="micro" className="text-[#4B5563] dark:text-fg3 flex-1">
                      {match.location} - {translateDateLabel(match.dateLabel)}
                    </Text>
                    <Text variant="micro" className="text-[#4B5563] dark:text-fg3">
                      {match.timeLabel}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-4">
                <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                  Voce ainda nao tem partidas proximas. Assim que confirmar uma, ela aparece aqui.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[14px]">
          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
            {t('history.byPositionAndModality', 'Historico por posicao e modalidade')}
          </Text>

          {positionStats.length === 0 ? (
            <View className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3">
              <Text variant="caption" className="text-[#4B5563] dark:text-fg3">
                {t('history.emptyPositionsHistory', 'Ainda nao ha historico de posicoes jogadas.')}
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {positionStats.map((stat) => (
                <View key={`${stat.modality}:${stat.positionKey}`} className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3">
                  <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                    {getRealPositionLabel(stat)} - {formatModalityLabel(stat.modality)}
                  </Text>
                  <Text variant="micro" className="mt-1 text-[#4B5563] dark:text-fg3">
                    {t('history.positionMatchesCount', '{{count}} jogos nessa posicao/modalidade', { count: stat.matchesCount })}
                  </Text>
                  {stat.ratingsCount > 0 && stat.avgRating !== null ? (
                    <View className="mt-1 flex-row items-center gap-1.5">
                      <Star size={13} color="#D4A13A" fill="#D4A13A" />
                      <Text variant="micro" className="font-semibold text-[#D4A13A]">
                        {stat.avgRating.toFixed(1)}
                      </Text>
                      <Text variant="micro" className="text-[#4B5563] dark:text-fg3">
                        ({stat.ratingsCount} avaliacoes)
                      </Text>
                    </View>
                  ) : (
                    <Text variant="micro" className="mt-1 text-[#4B5563] dark:text-fg3">
                      {t('history.noRatingsYet', 'Ainda sem avaliacoes recebidas nessa posicao/modalidade.')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2 mb-3">
            <ShieldCheck size={16} color={theme === 'light' ? '#5B6B80' : '#9DB0D1'} strokeWidth={2} />
            <Text variant="label" className="font-bold text-[#111827] dark:text-white">
              {t('actions.quickAccess', 'Acessos rapidos')}
            </Text>
          </View>

          <View className="gap-2">
            <Pressable
              className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3 flex-row items-center justify-between"
              onPress={() => router.push('/(app)/edit-profile')}
            >
              <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                {t('actions.editProfile', 'Editar meu perfil')}
              </Text>
              <ChevronRight size={16} color={theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.5)'} />
            </Pressable>
            <Pressable
              className="rounded-[12px] border border-[rgba(0,0,0,0.08)] dark:border-line bg-[#FAFBFC] dark:bg-[#0A0F1C] px-3 py-3 flex-row items-center justify-between"
              onPress={() => router.push('/(app)/settings')}
            >
              <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                {t('actions.openSettings', 'Configuracoes')}
              </Text>
              <ChevronRight size={16} color={theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.5)'} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="profile" />
    </View>
  );
}
