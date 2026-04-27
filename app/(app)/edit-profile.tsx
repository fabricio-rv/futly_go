import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, IconButton, Input, Text } from '@/src/components/ui';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export default function EditProfileScreen() {
  const { t } = useTranslation('profile');
  const { profile, loadProfile, saveProfile, saving } = useProfile();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cep, setCep] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadProfile().catch(() => undefined);
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.full_name ?? '');
    setPhone(profile.phone ?? '');
    setCity(profile.city ?? '');
    setState(profile.state ?? '');
    setCep(profile.cep ?? '');
    setBio(profile.bio ?? '');
  }, [profile]);

  async function handleSaveProfile() {
    try {
      await saveProfile({
        fullName: fullName || undefined,
        phone: phone || null,
        city: city || null,
        state: state || null,
        cep: cep || null,
        bio: bio || null,
      });

      Alert.alert(t('success.profileUpdated', 'Perfil atualizado'), t('messages.profileSaved', 'Seus dados foram salvos com sucesso.'));
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.saveProfileFailed', 'Nao foi possivel salvar o perfil.');
      Alert.alert(t('errors.saveProfileTitle', 'Falha ao salvar'), message);
    }
  }

  const theme = useAppColorScheme();
  const bgColor = theme === 'light' ? '#F4F6F9' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav
          title={t('headers.editProfile', 'Editar perfil')}
          subtitle={t('sections.personalInfo', 'DADOS PESSOAIS')}
          rightNode={
            <IconButton
              icon={<Check size={16} color={saving ? '#CCCCCC' : '#86E5B4'} />}
              onPress={handleSaveProfile}
              disabled={saving}
            />
          }
        />

        <View className="mx-[18px] mt-4 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[14px]">
          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
            {t('sections.personalInfo', 'Informacoes pessoais')}
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
            <View className="flex-1">
              <Input
                label={t('personal.phone', 'Telefone')}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('placeholders.phone', 'Ex.: (11) 9999-9999')}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Input
                label={t('placeholders.stateLabel', 'Estado')}
                value={state}
                onChangeText={setState}
                placeholder={t('placeholders.state', 'Ex.: SP')}
              />
            </View>
            <View className="flex-1">
              <Input
                label={t('personal.location', 'Cidade')}
                value={city}
                onChangeText={setCity}
                placeholder={t('placeholders.city', 'Ex.: Sao Paulo')}
              />
            </View>
          </View>

          <View className="mb-3">
            <Input
              label={t('placeholders.cepLabel', 'CEP')}
              value={cep}
              onChangeText={setCep}
              placeholder={t('placeholders.cep', 'Ex.: 01310-100')}
              keyboardType="number-pad"
            />
          </View>

          <View>
            <Input
              label={t('personal.bio', 'Bio')}
              value={bio}
              onChangeText={setBio}
              placeholder={t('personal.bioPlaceholder', 'Conte um pouco sobre voce...')}
              multiline
              numberOfLines={4}
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
