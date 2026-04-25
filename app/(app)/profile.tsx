import { router } from 'expo-router';
import { CalendarClock, ChevronRight, MapPin, ShieldCheck, Trophy } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Input, MultiChipSelector, SelectField, Text } from '@/src/components/ui';
import { ATHLETE_POSITION_OPTIONS } from '@/src/features/matches/constants';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useProfile } from '@/src/features/profile/hooks/useProfile';

const positionOptions = ATHLETE_POSITION_OPTIONS.map((value) => ({ value, label: value }));

export default function ProfileScreen() {
  const { profile, loadProfile, saveProfile, saving } = useProfile();
  const { agenda, getUserAgenda } = useMatches();

  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [primaryPosition, setPrimaryPosition] = useState<string | null>(null);
  const [secondaryPositions, setSecondaryPositions] = useState<string[]>([]);

  useEffect(() => {
    loadProfile().catch(() => undefined);
    getUserAgenda().catch(() => undefined);
  }, [getUserAgenda, loadProfile]);

  useEffect(() => {
    if (!profile) return;

    setHeightCm(profile.height_cm ? String(profile.height_cm) : '');
    setWeightKg(profile.weight_kg ? String(profile.weight_kg) : '');
    setPrimaryPosition(profile.primary_position ?? null);
    setSecondaryPositions(profile.secondary_positions ?? []);
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

  async function handleSaveAthleteData() {
    try {
      await saveProfile({
        heightCm: heightCm ? Number(heightCm.replace(',', '.')) : null,
        weightKg: weightKg ? Number(weightKg.replace(',', '.')) : null,
        primaryPosition,
        secondaryPositions,
      });

      Alert.alert('Perfil atualizado', 'Seus dados de atleta foram salvos com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o perfil.';
      Alert.alert('Falha ao salvar', message);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ink-0">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title="Perfil" subtitle="ATLETA" />

        <LinearGradient
          colors={['#0F3A24', '#072314']}
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
              <Text variant="bodyLg" className="font-bold text-white">
                {profile?.full_name ?? 'Atleta Futly'}
              </Text>
              <Text variant="micro" className="mt-0.5 text-[#86E5B4] tracking-[0.4px]">
                {profile?.email ?? 'sem-email'}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-2">
            <View className="flex-1 rounded-[12px] border border-line bg-[#0C111E] px-3 py-2">
              <Text variant="micro" className="uppercase tracking-[1.4px] text-fg4">
                Posição
              </Text>
              <Text variant="label" className="mt-1 font-semibold text-white">
                {profile?.primary_position ?? 'Não definida'}
              </Text>
            </View>
            <View className="flex-1 rounded-[12px] border border-line bg-[#0C111E] px-3 py-2">
              <Text variant="micro" className="uppercase tracking-[1.4px] text-fg4">
                Cidade
              </Text>
              <Text variant="label" className="mt-1 font-semibold text-white">
                {profile?.city ?? 'Não definida'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-line2 bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <Trophy size={16} color="#D4A13A" strokeWidth={2} />
            <Text variant="label" className="font-bold text-white">
              Resumo no app
            </Text>
          </View>

          <View className="mt-3 flex-row gap-2">
            {summary.map((item) => (
              <View key={item.id} className="flex-1 rounded-[12px] border border-line bg-[#0A0F1C] px-2 py-2">
                <Text variant="title" className="font-bold text-white text-center">
                  {item.value}
                </Text>
                <Text variant="micro" className="text-fg3 text-center mt-1">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-line2 bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <CalendarClock size={16} color="#86E5B4" strokeWidth={2} />
            <Text variant="label" className="font-bold text-white">
              Próximas partidas
            </Text>
          </View>

          <View className="mt-3 gap-2">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <View key={match.id} className="rounded-[12px] border border-line bg-[#0A0F1C] px-3 py-3">
                  <View className="flex-row items-center justify-between">
                    <Text variant="label" className="font-semibold text-white">
                      {match.title}
                    </Text>
                    <Text variant="micro" className="text-fg3">
                      {match.timeLabel}
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center gap-2">
                    <MapPin size={13} color="rgba(255,255,255,0.45)" />
                    <Text variant="micro" className="text-fg3">
                      {match.location} - {match.dateLabel}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text variant="caption" className="text-fg3">Nenhuma partida na agenda.</Text>
            )}
          </View>
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-line2 bg-[#0C111E] p-[14px]">
          <Text variant="label" className="font-bold text-white mb-3">
            Dados do atleta
          </Text>

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Input
                label="Altura (cm)"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                placeholder="Ex.: 178"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Peso (kg)"
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                placeholder="Ex.: 74"
              />
            </View>
          </View>

          <SelectField
            label="Posição principal"
            value={primaryPosition}
            options={positionOptions}
            searchable
            placeholder="Selecione a posição"
            onChange={setPrimaryPosition}
          />

          <View className="mt-3">
            <MultiChipSelector
              label="Posições secundárias"
              options={positionOptions}
              values={secondaryPositions}
              max={4}
              onChange={setSecondaryPositions}
              hint="Selecione até 4 posições"
            />
          </View>

          <Button label="Salvar dados do atleta" loading={saving} disabled={saving} className="mt-4" onPress={handleSaveAthleteData} />
        </View>

        <View className="mx-[18px] mt-4 rounded-[18px] border border-line2 bg-[#0C111E] p-[14px]">
          <View className="flex-row items-center gap-2">
            <ShieldCheck size={16} color="#9DB0D1" strokeWidth={2} />
            <Text variant="label" className="font-bold text-white">
              Acessos rapidos
            </Text>
          </View>

          <View className="mt-3 gap-2">
            <Pressable
              className="rounded-[12px] border border-line bg-[#0A0F1C] px-3 py-3 flex-row items-center justify-between"
              onPress={() => router.push('/(app)/settings')}
            >
              <Text variant="label" className="font-semibold text-white">
                Ir para Configuracoes
              </Text>
              <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
            <Pressable
              className="rounded-[12px] border border-line bg-[#0A0F1C] px-3 py-3 flex-row items-center justify-between"
              onPress={() => router.push('/(app)/store')}
            >
              <Text variant="label" className="font-semibold text-white">
                Ir para Loja e Planos
              </Text>
              <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <MatchBottomNav active="profile" />
    </SafeAreaView>
  );
}
