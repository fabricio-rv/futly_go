import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { cities as getBrazilianCities, states as getBrazilianStates } from 'estados-cidades';

import { BRAZIL_STATE_OPTIONS } from '@/src/features/auth/constants';
import { formatCep } from '@/src/features/location/cep';
import { Button, Input, SelectField, Text } from '@/src/components/ui';
import { useMatchTheme } from '../matches/shared/theme';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import type { Court } from '@/src/data/quadras';

const AMENITY_OPTIONS = [
  'Churrasqueira',
  'Vestiario',
  'Lanchonete',
  'Estacionamento',
  'Bar',
];

const DAYS_ORDER = [
  'Segunda-feira',
  'Terca-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sabado',
  'Domingo',
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

type AddCourtModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (court: Court) => Promise<string | void> | string | void;
};

type FieldRowProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

function FieldRow({ label, required, error, children }: FieldRowProps) {
  const matchTheme = useMatchTheme();
  return (
    <View className="gap-2">
      <Text
        variant="label"
        className="font-semibold"
        style={{ color: matchTheme.colors.fgSecondary }}
      >
        {label}
        {required ? <Text style={{ color: matchTheme.colors.bad }}> *</Text> : null}
      </Text>
      {children}
      {error ? (
        <Text variant="micro" style={{ color: matchTheme.colors.bad }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function AddCourtModal({ visible, onClose, onSubmit }: AddCourtModalProps) {
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const { t } = useTranslation('quadras');
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const verticalMargin = Math.max(insets.top, 12) + Math.max(insets.bottom, 12);
  const maxModalHeight = Math.max(windowHeight - verticalMargin, 340);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cep, setCep] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<Record<string, string>>(
    () =>
      DAYS_ORDER.reduce<Record<string, string>>((acc, day) => {
        acc[day] = '';
        return acc;
      }, {}),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
    if (!selectedState || stateOptions.some((item) => item.value === selectedState)) return;
    setSelectedState(stateOptions[0]?.value ?? null);
  }, [selectedState, stateOptions]);

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

  const reset = () => {
    setName('');
    setAddress('');
    setPhone('');
    setSelectedState(null);
    setSelectedCity(null);
    setCep('');
    setAmenities([]);
    setWorkingHours(
      DAYS_ORDER.reduce<Record<string, string>>((acc, day) => {
        acc[day] = '';
        return acc;
      }, {}),
    );
    setErrors({});
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    );
  };

  const handleSave = async () => {
    const next: Record<string, string> = {};

    if (!name.trim()) next.name = t('add.requiredField', 'Campo obrigatorio');
    if (!address.trim()) next.address = t('add.requiredField', 'Campo obrigatorio');
    if (!phone.trim()) next.phone = t('add.requiredField', 'Campo obrigatorio');
    if (!selectedState) next.state = t('add.requiredField', 'Campo obrigatorio');
    if (!selectedCity) next.city = t('add.requiredField', 'Campo obrigatorio');
    if (!cep.trim()) next.cep = t('add.requiredField', 'Campo obrigatorio');

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);

    const filledHours: Record<string, string> = {};
    DAYS_ORDER.forEach((day) => {
      filledHours[day] = workingHours[day]?.trim() || t('details.notInformed', 'Nao informado');
    });

    const court: Court = {
      id: slugify(name) || `court-${Date.now()}`,
      name: name.trim(),
      location_preview: `${selectedCity}, ${selectedState}`,
      address: address.trim(),
      phone: phone.trim(),
      state: selectedState ?? undefined,
      city: selectedCity ?? undefined,
      cep: cep.trim() || undefined,
      rating: 0,
      review_count: 0,
      amenities,
      working_hours: filledHours,
    };

    try {
      await onSubmit(court);
      Alert.alert(
        t('add.successTitle', 'Quadra adicionada!'),
        t('add.successMessage', 'Sua quadra agora aparece na lista.'),
      );
      reset();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Erro', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View
          className="flex-1 px-4 justify-center"
          style={{
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
            }}
            onPress={handleClose}
          />
          <Pressable
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: matchTheme.colors.lineStrong,
              backgroundColor: theme === 'light' ? '#FFFFFF' : matchTheme.colors.bgSurfaceA,
              height: Math.min(maxModalHeight, windowHeight * 0.88),
              maxHeight: maxModalHeight,
              flexShrink: 1,
              width: '100%',
              alignSelf: 'center',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              className="px-4 py-3 border-b flex-row items-center justify-between"
              style={{ borderColor: matchTheme.colors.line }}
            >
              <View className="flex-1 pr-2">
                <Text
                  variant="title"
                  style={{ color: matchTheme.colors.fgPrimary, fontWeight: '700' }}
                >
                  {t('add.title', 'Adicionar Quadra')}
                </Text>
                <Text variant="micro" style={{ color: matchTheme.colors.fgMuted, marginTop: 2 }}>
                  {t('add.subtitle', 'Cadastre uma nova quadra para ajudar a comunidade')}
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <X size={16} color={matchTheme.colors.fgMuted} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled
              removeClippedSubviews={Platform.OS === 'android'}
              scrollEventThrottle={16}
              contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 18 }}
              showsVerticalScrollIndicator
            >
              <FieldRow label={t('add.name', 'Nome da Quadra')} required error={errors.name}>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder={t('add.namePlaceholder', 'Ex: Arena Sports')}
                />
              </FieldRow>

              <FieldRow
                label={t('add.address', 'Endereco completo')}
                required
                error={errors.address}
              >
                <Input
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Rua, Numero e Bairro"
                  multiline
                  numberOfLines={3}
                />
              </FieldRow>

              <FieldRow label="CEP" required error={errors.cep}>
                <Input
                  value={cep}
                  onChangeText={(value) => setCep(formatCep(value))}
                  placeholder="00000-000"
                  keyboardType="number-pad"
                  maxLength={9}
                />
              </FieldRow>

              <View className="flex-row gap-2 items-start">
                <View className="flex-1">
                  <SelectField
                    label={`${t('filters.state', 'Estado')} *`}
                    value={selectedState}
                    onChange={(value) => setSelectedState(value)}
                    options={stateOptions}
                    placeholder={t('filters.selectState', 'Selecione o estado')}
                    searchable
                    error={errors.state}
                  />
                </View>
                <View className="flex-1">
                  <SelectField
                    label={`${t('filters.city', 'Cidade')} *`}
                    value={selectedCity}
                    onChange={(value) => setSelectedCity(value)}
                    options={cityOptions}
                    placeholder={t('filters.selectCity', 'Selecione a cidade')}
                    searchable
                    error={errors.city}
                  />
                </View>
              </View>

              <FieldRow label={t('add.phone', 'Telefone')} required error={errors.phone}>
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('add.phonePlaceholder', '(00) 00000-0000')}
                  keyboardType="phone-pad"
                />
              </FieldRow>

              <View className="gap-2 mt-1">
                <Text
                  variant="label"
                  className="font-semibold"
                  style={{ color: matchTheme.colors.fgSecondary }}
                >
                  {t('add.amenities', 'Comodidades')}
                </Text>
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted, fontSize: 13 }}>
                  {t('add.amenitiesHint', 'Toque para selecionar uma ou mais')}
                </Text>
                <View className="flex-row gap-2 flex-wrap mt-1">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const active = amenities.includes(amenity);
                    return (
                      <Pressable
                        key={amenity}
                        onPress={() => toggleAmenity(amenity)}
                        className="rounded-full px-3 py-2"
                        style={{
                          backgroundColor: active ? 'rgba(34,183,108,0.18)' : theme === 'light' ? '#FAFBFC' : '#101626',
                          borderWidth: 1,
                          borderColor: active ? 'rgba(34,183,108,0.45)' : theme === 'light' ? 'rgba(0,0,0,0.12)' : '#1F2A44',
                        }}
                      >
                        <Text
                          variant="caption"
                          style={{
                            color: active ? matchTheme.colors.okSoft : matchTheme.colors.fgPrimary,
                            fontWeight: active ? '700' : '500',
                            fontSize: 12,
                          }}
                        >
                          {amenity}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="gap-2">
                <Text
                  variant="label"
                  className="font-semibold"
                  style={{ color: matchTheme.colors.fgSecondary }}
                >
                  {t('add.workingHours', 'Horario de Funcionamento')}
                </Text>
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted, fontSize: 13 }}>
                  {t('add.workingHoursHint', 'Use o formato 00:00 - 00:00 ou "Fechado"')}
                </Text>
                <View className="gap-2 mt-1">
                  {DAYS_ORDER.map((day) => (
                    <View key={day} className="flex-row items-center gap-2">
                      <Text
                        variant="caption"
                        style={{ color: matchTheme.colors.fgPrimary, width: 100, fontSize: 12 }}
                      >
                        {t(`days.${day}`, day)}
                      </Text>
                      <View className="flex-1">
                        <Input
                          value={workingHours[day]}
                          onChangeText={(value) =>
                            setWorkingHours((prev) => ({ ...prev, [day]: value }))
                          }
                          placeholder={t('add.workingHoursPlaceholder', '08:00 - 23:00')}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View
              className="px-4 py-3 border-t flex-row gap-2"
              style={{ borderColor: matchTheme.colors.line }}
            >
              <View className="flex-1">
                <Button
                  label={t('add.cancel', 'Cancelar')}
                  variant="ghost"
                  onPress={handleClose}
                  disabled={submitting}
                />
              </View>
              <View className="flex-1">
                <Button
                  label={t('add.save', 'Salvar')}
                  onPress={() => void handleSave()}
                  loading={submitting}
                  disabled={submitting}
                />
              </View>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

