import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cities as getBrazilianCities, states as getBrazilianStates } from 'estados-cidades';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, IconButton, Input, SelectField, Text } from '@/src/components/ui';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { BRAZIL_STATE_OPTIONS } from '@/src/features/auth/constants';
import { formatCep } from '@/src/features/location/cep';

function formatDdd(value: string) {
  return value.replace(/\D/g, '').slice(0, 2);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function EditProfileScreen() {
  const { t } = useTranslation('profile');
  const { profile, loadProfile, saveProfile, saving } = useProfile();

  const [fullName, setFullName] = useState('');
  const [ddd, setDdd] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cep, setCep] = useState('');

  const availableStateCodes = useMemo(() => getBrazilianStates(), []);
  const stateOptions = useMemo(
    () =>
      BRAZIL_STATE_OPTIONS.filter((state) => availableStateCodes.includes(state.value)).map((state) => ({
        value: state.value,
        label: state.label,
        description: state.value,
      })),
    [availableStateCodes],
  );

  const cityOptions = useMemo(() => {
    if (!selectedState) return [];

    try {
      return getBrazilianCities(selectedState).map((city) => ({
        value: city,
        label: city,
      }));
    } catch {
      return [];
    }
  }, [selectedState]);

  useEffect(() => {
    loadProfile().catch(() => undefined);
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.full_name ?? '');
    const phoneDigits = (profile.phone ?? '').replace(/\D/g, '');
    setDdd(phoneDigits.slice(0, 2));
    setPhone(formatPhone(phoneDigits.slice(2)));
    setSelectedState(profile.state ?? null);
    setSelectedCity(profile.city ?? null);
    setCep(profile.cep ?? '');
  }, [profile]);

  useEffect(() => {
    if (!selectedState) {
      setSelectedCity(null);
      return;
    }

    setSelectedCity((previous) =>
      previous && cityOptions.some((item) => item.value === previous)
        ? previous
        : cityOptions[0]?.value ?? null,
    );
  }, [selectedState, cityOptions]);

  async function handleSaveProfile() {
    try {
      const normalizedPhone = `${ddd}${phone}`.replace(/\D/g, '');

      await saveProfile({
        fullName: fullName || undefined,
        phone: normalizedPhone || null,
        city: selectedCity || null,
        state: selectedState || null,
        cep: cep.replace(/\D/g, '') || null,
      });

      Alert.alert(t('success.profileUpdated', 'Perfil atualizado'), t('messages.profileSaved', 'Seus dados foram salvos com sucesso.'));
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.saveProfileFailed', 'Não foi possível salvar o perfil.');
      Alert.alert(t('errors.saveProfileTitle', 'Falha ao salvar'), message);
    }
  }

  const theme = useAppColorScheme();
  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav
          plainBack
          title={t('headers.editProfile', 'Editar perfil')}
          subtitle={t('sections.personalInfo', 'DADOS PESSOAIS')}
          rightNode={
            <IconButton
              icon={<Check size={16} color={saving ? '#CCCCCC' : '#86E5B4'} />}
              onPress={handleSaveProfile}
              disabled={saving}
              variant="flat"
            />
          }
        />

        <View className="mx-[18px] mt-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[14px]">
          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
            {t('sections.personalInfo', 'Informações pessoais')}
          </Text>

          <View className="mb-3">
            <Input
              label={t('personal.fullName', 'Nome completo')}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('placeholders.fullName', 'Ex.: Joao Silva')}
            />
          </View>

          <View className="flex-row gap-2 mb-3">
            <View style={{ width: 86 }}>
              <Input
                label={t('placeholders.dddLabel', 'DDD')}
                value={ddd}
                onChangeText={(value) => setDdd(formatDdd(value))}
                placeholder={t('placeholders.ddd', '11')}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View className="flex-1">
              <Input
                label={t('personal.phone', 'Telefone')}
                value={phone}
                onChangeText={(value) => setPhone(formatPhone(value))}
                placeholder={t('placeholders.phone', 'Ex.: 99999-9999')}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <SelectField
                label={t('placeholders.stateLabel', 'Estado')}
                value={selectedState}
                onChange={setSelectedState}
                options={stateOptions}
                placeholder={t('placeholders.selectState', 'Selecione o estado')}
                searchable
              />
            </View>
            <View className="flex-1">
              <SelectField
                label={t('personal.location', 'Cidade')}
                value={selectedCity}
                onChange={setSelectedCity}
                options={cityOptions}
                placeholder={t('placeholders.selectCity', 'Selecione a cidade')}
                searchable
                disabled={!selectedState}
              />
            </View>
          </View>

          <View className="mb-3">
            <Input
              label={t('placeholders.cepLabel', 'CEP')}
              value={cep}
              onChangeText={(value) => setCep(formatCep(value))}
              placeholder={t('placeholders.cep', 'Ex.: 01310-100')}
              keyboardType="number-pad"
              maxLength={9}
            />
          </View>
        </View>

        <View className="mx-[18px] mt-4 mb-4">
          <Button
            label={saving ? t('common.saving', 'Salvando...') : t('actions.saveProfile', 'Salvar alteracoes')}
            loading={saving}
            disabled={saving}
            onPress={handleSaveProfile}
          />
        </View>
      </ScrollView>

      <MatchBottomNav active="profile" />
    </SafeAreaView>
  );
}
