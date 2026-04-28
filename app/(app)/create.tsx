import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, Pressable, View, Modal, Alert, useWindowDimensions } from 'react-native';

import {
  DateTimeField,
  FacilityCheckCard,
  MatchBackground,
  MatchBottomNav,
  RangeSelector,
  SectionTitle,
  SegmentedControl,
  StatBadge,
  StepIndicator,
  ToggleRow,
  useMatchTheme,
} from '@/src/components/features/matches';
import { TacticalPitch, type PitchMode } from '@/src/components/fifa';
import { Button, Card, Input, Screen, SelectField, Text } from '@/src/components/ui';
import { BRAZIL_STATE_OPTIONS } from '@/src/features/auth/constants';
import { fetchAddressByCep, formatCep } from '@/src/features/location/cep';
import { useMatches } from '@/src/features/matches/hooks/useMatches';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type MinLevelValue =
  | 'pereba'
  | 'resenha'
  | 'casual'
  | 'intermediario'
  | 'avancado'
  | 'competitivo'
  | 'semi_amador'
  | 'amador'
  | 'ex_profissional';

const MIN_LEVEL_OPTIONS: Array<{ value: MinLevelValue }> = [
  { value: 'pereba' },
  { value: 'resenha' },
  { value: 'casual' },
  { value: 'intermediario' },
  { value: 'avancado' },
  { value: 'competitivo' },
  { value: 'semi_amador' },
  { value: 'amador' },
  { value: 'ex_profissional' },
];

const TURNO_OPTIONS = [
  { value: 'manha' },
  { value: 'tarde' },
  { value: 'noite' },
] as const;

function formatDateField(value: Date) {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeField(value: Date) {
  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoTime(value: Date) {
  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}:00`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function MinLevelCheckbox({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useMatchTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48.5%] rounded-[14px] border px-[12px] py-[10px] flex-row items-center gap-2"
      style={{
        backgroundColor: theme.colors.bgSurfaceB,
        borderColor: selected ? theme.colors.ok : theme.colors.lineStrong,
      }}
    >
      <View
        className="w-4 h-4 rounded-[4px] border"
        style={{
          backgroundColor: selected ? theme.colors.ok : 'transparent',
          borderColor: selected ? theme.colors.ok : theme.colors.lineStrong,
        }}
      />
      <Text variant="label" style={{ color: theme.colors.fgPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CreateMatchScreen() {
  const { t, currentLanguage } = useTranslation('create');
  const theme = useAppColorScheme();
  const matchTheme = useMatchTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { createMatch, submitting } = useMatches();
  const creatingRef = useRef(false);

  const [mode, setMode] = useState<PitchMode>('futsal');
  const [restBreak, setRestBreak] = useState(true);
  const [referee, setReferee] = useState(false);
  const [description, setDescription] = useState(() =>
    t('form.descriptionDefault'),
  );
  const [selectedPositionIndexes, setSelectedPositionIndexes] = useState<number[]>([]);

  const [stateCode, setStateCode] = useState('RS');
  const [city, setCity] = useState('Porto Alegre');
  const [address, setAddress] = useState('R. dos Andradas, 1234');
  const [district, setDistrict] = useState('Cidade Baixa');
  const [cep, setCep] = useState('90020-300');
  const [venueName, setVenueName] = useState('Arena Central - Quadra B');
  const [contactPhone, setContactPhone] = useState('(51) 3221-0455');

  const [matchDate, setMatchDate] = useState(() => {
    const initialDate = new Date();
    initialDate.setDate(initialDate.getDate() + 1);
    initialDate.setHours(0, 0, 0, 0);
    return initialDate;
  });
  const [matchTime, setMatchTime] = useState(() => {
    const initialTime = new Date();
    initialTime.setHours(19, 30, 0, 0);
    return initialTime;
  });
  const [showWebDateModal, setShowWebDateModal] = useState(false);
  const [showWebTimeModal, setShowWebTimeModal] = useState(false);
  const [webDateCursor, setWebDateCursor] = useState(() => new Date(matchDate.getFullYear(), matchDate.getMonth(), 1));
  const [webHour, setWebHour] = useState(matchTime.getHours());
  const [webMinute, setWebMinute] = useState(matchTime.getMinutes());
  const [turno, setTurno] = useState<(typeof TURNO_OPTIONS)[number]['value']>('noite');
  const [pricePerPerson, setPricePerPerson] = useState('25');
  const [durationMinutes, setDurationMinutes] = useState('60');

  const [acceptedLevels, setAcceptedLevels] = useState<MinLevelValue[]>([
    'resenha',
    'intermediario',
    'amador',
  ]);

  const stateOptions = BRAZIL_STATE_OPTIONS.map((state) => ({
    value: state.value,
    label: state.label,
    description: state.value,
  }));

  const toggleLevel = (value: MinLevelValue) => {
    setAcceptedLevels((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const togglePosition = (index: number) => {
    setSelectedPositionIndexes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index].sort((a, b) => a - b),
    );
  };

  const handlePricePerPersonChange = (value: string) => {
    setPricePerPerson(value.replace(/[^\d]/g, ''));
  };

  const handleDurationMinutesChange = (value: string) => {
    setDurationMinutes(value.replace(/[^\d]/g, ''));
  };

  async function handleCreateMatch(status: 'publicada' | 'rascunho') {
    if (creatingRef.current) return;
    creatingRef.current = true;

    try {
      await createMatch({
        title: venueName.trim() || t('form.untitledMatch'),
        description: description.trim(),
        modality: mode,
        matchDate: toIsoDate(matchDate),
        matchTime: toIsoTime(matchTime),
        turno,
        durationMinutes: Number(durationMinutes) || 60,
        pricePerPerson: Number(pricePerPerson) || 0,
        minAge: 16,
        maxAge: 80,
        acceptedLevels,
        allowExternalReserves: true,
        restBreak,
        refereeIncluded: referee,
        contactPhone: contactPhone.trim() || null,
        venueName: venueName.trim() || null,
        cep: cep.trim() || null,
        district: district.trim() || null,
        city: city.trim() || null,
        state: stateCode.trim() || null,
        address: address.trim() || null,
        selectedPositionIndexes,
        status,
        facilities: [
          { label: t('form.facilityLockerRoom'), selected: true },
          { label: t('form.facilityShower'), selected: true },
          { label: t('form.facilityParking'), selected: true },
          { label: t('form.facilitySnackBar'), selected: false },
        ],
      });

      const successMessage =
        status === 'rascunho'
          ? t('form.draftSavedMessage')
          : t('form.matchPublishedMessage');

      Alert.alert(t('form.matchCreatedTitle'), successMessage, [
        {
          text: t('common.confirm', 'Confirm'),
          onPress: () => router.replace('/(app)'),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('form.createFailedMessage');
      Alert.alert(t('form.createFailedTitle'), message);
    } finally {
      creatingRef.current = false;
    }
  }

  const monthYearLabel = webDateCursor.toLocaleDateString(currentLanguage, { month: 'long', year: 'numeric' });
  const currentYear = webDateCursor.getFullYear();
  const currentMonth = webDateCursor.getMonth();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthDays = daysInMonth(currentYear, currentMonth);
  const leadingEmpty = Array.from({ length: firstWeekday });
  const dayNumbers = Array.from({ length: monthDays }, (_, idx) => idx + 1);
  const pitchWidth = Math.min(300, Math.max(248, screenWidth - 120));
  const pitchOffsetTop = 0;

  return (
    <Screen padded={false} showBackground={false}>
      <MatchBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 152 }}>
        <View className="px-[18px] pt-4 pb-1">
          <SectionTitle title={t('title')} badge="2 / 4" />
        </View>

        <StepIndicator total={4} current={3} />

        <View className="px-[18px] gap-[14px]">
          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title={t('title')} />
            <View className="gap-3 mt-2">
              <Input
                label={t('form.cep')}
                value={cep}
                onChangeText={async (value) => {
                  const formatted = formatCep(value);
                  setCep(formatted);

                  const cleanCep = formatted.replace(/\D/g, '');
                  if (cleanCep.length !== 8) return;

                  const addressData = await fetchAddressByCep(cleanCep);
                  if (!addressData) return;

                  setAddress(addressData.street || address);
                  setCity(addressData.city);
                  setDistrict(addressData.district || district);
                  setStateCode(addressData.state);
                }}
                keyboardType="number-pad"
                placeholder="00000-000"
              />

              <Input
                label={t('form.district')}
                value={district}
                onChangeText={setDistrict}
                placeholder={t('form.districtPlaceholder')}
              />

              <Input
                label={t('form.venueName')}
                value={venueName}
                onChangeText={setVenueName}
                placeholder={t('form.venueNamePlaceholder')}
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <SelectField
                    label={t('form.state')}
                    value={stateCode}
                    options={stateOptions}
                    searchable
                    placeholder={t('form.selectState')}
                    onChange={setStateCode}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={t('form.city')}
                    value={city}
                    onChangeText={setCity}
                    placeholder={t('form.cityPlaceholder')}
                  />
                </View>
              </View>

              <Input
                label={t('form.address')}
                value={address}
                onChangeText={setAddress}
                placeholder={t('form.addressPlaceholder')}
              />
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title={t('title')} />
            <View className="gap-3 mt-2">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <DateTimeField
                    label={t('filters.date', 'Data')}
                    value={formatDateField(matchDate)}
                    placeholder={t('filters.selectDate', 'Selecione a data')}
                    onPress={() => {
                      setWebDateCursor(new Date(matchDate.getFullYear(), matchDate.getMonth(), 1));
                      setShowWebDateModal(true);
                    }}
                  />
                </View>
                <View className="flex-1">
                  <DateTimeField
                    label={t('filters.time', 'Horário')}
                    value={formatTimeField(matchTime)}
                    placeholder={t('filters.selectTime', 'Selecione o horário')}
                    onPress={() => {
                      setWebHour(matchTime.getHours());
                      setWebMinute(matchTime.getMinutes());
                      setShowWebTimeModal(true);
                    }}
                  />
                </View>
                <View className="flex-1">
                  <SelectField
                    label={t('filters.shift', 'Turno')}
                    value={turno}
                    options={TURNO_OPTIONS.map((item) => ({
                      value: item.value,
                      label:
                        item.value === 'manha'
                          ? t('filters.shiftMorning', 'Manha')
                          : item.value === 'tarde'
                            ? t('filters.shiftAfternoon', 'Tarde')
                            : t('filters.shiftNight', 'Noite'),
                    }))}
                    placeholder={t('filters.shift', 'Turno')}
                    onChange={(value) =>
                      setTurno(value as (typeof TURNO_OPTIONS)[number]['value'])
                    }
                  />
                </View>
              </View>

              <Input
                label={t('form.contactPhone')}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
              />
            </View>
          </Card>

          <Card
            className="p-4 border"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: 'rgba(34,183,108,0.35)' }}
          >
            <SectionTitle title={t('title')} />

            <Text variant="micro" className="uppercase tracking-[2px] mt-2" style={{ color: matchTheme.colors.fgMuted }}>
              {t('form.gameLevel')}
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {MIN_LEVEL_OPTIONS.map((level) => (
                <StatBadge
                  key={`game-level-${level.value}`}
                  label={t(`form.levelOptions.${level.value}`)}
                  tone={acceptedLevels.includes(level.value) ? 'active' : 'neutral'}
                />
              ))}
            </View>

              <View className="flex-row gap-2 mt-4">
                <View className="flex-1">
                  <Input
                    label={t('form.pricePerPerson')}
                    value={pricePerPerson}
                    onChangeText={handlePricePerPersonChange}
                    keyboardType="number-pad"
                    placeholder="25"
                    leftAdornment={<Text variant="body" tone="muted">R$</Text>}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label={t('form.durationMinutes')}
                    value={durationMinutes}
                    onChangeText={handleDurationMinutesChange}
                    keyboardType="number-pad"
                    placeholder="60"
                    rightAdornment={<Text variant="body" tone="muted">min</Text>}
                  />
                </View>
              </View>

            <View className="mt-4">
              <Text variant="micro" className="uppercase tracking-[2px]" style={{ color: matchTheme.colors.fgMuted }}>
                {t('form.ageRestrictions')}
              </Text>
              <RangeSelector min={16} max={80} minPercent={8} maxPercent={72} />
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                {t('form.ageRestrictionsHint')}
              </Text>
            </View>

            <View className="gap-2 mt-4">
              <ToggleRow
                title={t('form.restBreakTitle')}
                subtitle={t('form.restBreakSubtitle')}
                value={restBreak}
                onToggle={() => setRestBreak((v) => !v)}
              />
              <ToggleRow
                title={t('form.refereeTitle')}
                subtitle={t('form.refereeSubtitle')}
                value={referee}
                onToggle={() => setReferee((v) => !v)}
              />
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <View className="flex-row items-center justify-between">
              <SectionTitle title={t('title')} />
            </View>
            <Text variant="caption" className="mt-1" style={{ color: matchTheme.colors.fgMuted }}>
              {t('form.minimumLevelsAccepted')}
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {MIN_LEVEL_OPTIONS.map((level) => (
                <MinLevelCheckbox
                  key={level.value}
                  label={t(`form.levelOptions.${level.value}`)}
                  selected={acceptedLevels.includes(level.value)}
                  onPress={() => toggleLevel(level.value)}
                  theme={matchTheme}
                />
              ))}
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View>
                <SectionTitle title={t('title')} />
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                  {t('form.positionsHint')}
                </Text>
                <View className="gap-1 mt-2">
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    {t('form.hostPosition')}
                  </Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    {t('form.confirmedCount')}
                  </Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    {t('form.openSlotsCount')}
                  </Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    {t('form.blockedSlotCount')}
                  </Text>
                </View>
              </View>
              <View className="w-[194px]">
                <SegmentedControl
                  options={[
                    { id: 'futsal', label: t('form.modalityFutsal') },
                    { id: 'society', label: t('form.modalitySociety') },
                    { id: 'campo', label: t('form.modalityCampo') },
                  ]}
                  activeId={mode}
                  onChange={(value) => setMode(value as PitchMode)}
                  compact
                />
              </View>
            </View>

            <View className="items-center" style={{ marginTop: pitchOffsetTop, marginBottom: 4 }} pointerEvents="box-none">
              <View pointerEvents="auto">
                <TacticalPitch
                  mode={mode}
                  selectedIndexes={selectedPositionIndexes}
                  onToggleIndex={togglePosition}
                  width={pitchWidth}
                />
              </View>
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title={t('title')} />
            <View className="mt-2">
              <Input
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={setDescription}
              />
              <Text variant="caption" className="text-right mt-1" style={{ color: matchTheme.colors.fgMuted }}>
                {description.length} / 280
              </Text>
            </View>
          </Card>

          <Button
            label={t('form.createMatchButton')}
            fullWidth
            loading={submitting}
            disabled={submitting}
            onPress={() => handleCreateMatch('publicada')}
          />
          <View className="h-2" />
        </View>
      </ScrollView>
      <MatchBottomNav active="new" />

      <Modal transparent visible={showWebDateModal} onRequestClose={() => setShowWebDateModal(false)}>
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <View className="w-full max-w-[420px] rounded-[18px] border p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}>
            <View className="flex-row items-center justify-between mb-3">
              <Button
                label="<"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setWebDateCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              />
              <Text variant="label" className="font-bold capitalize" style={{ color: matchTheme.colors.fgPrimary }}>
                {monthYearLabel}
              </Text>
              <Button
                label=">"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setWebDateCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              />
            </View>

            <View className="flex-row mb-2">
              {[
                t('filters.weekdaySun', 'D'),
                t('filters.weekdayMon', 'S'),
                t('filters.weekdayTue', 'T'),
                t('filters.weekdayWed', 'Q'),
                t('filters.weekdayThu', 'Q'),
                t('filters.weekdayFri', 'S'),
                t('filters.weekdaySat', 'S'),
              ].map((weekDay, idx) => (
                <View key={`weekday-${weekDay}-${idx}`} className="flex-1 items-center">
                  <Text variant="micro" style={{ color: matchTheme.colors.fgMuted }}>{weekDay}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {leadingEmpty.map((_, idx) => (
                <View key={`empty-${idx}`} className="w-[14.28%] h-10" />
              ))}
              {dayNumbers.map((day) => {
                const isSelected =
                  matchDate.getFullYear() === currentYear &&
                  matchDate.getMonth() === currentMonth &&
                  matchDate.getDate() === day;

                return (
                  <Pressable
                    key={`day-${day}`}
                    className="w-[14.28%] h-10 items-center justify-center"
                    onPress={() => {
                      const selected = new Date(currentYear, currentMonth, day);
                      setMatchDate(selected);
                      setShowWebDateModal(false);
                    }}
                  >
                    <View
                      className="h-8 w-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: isSelected ? matchTheme.colors.ok : 'transparent' }}
                    >
                      <Text variant="caption" style={{ color: isSelected ? '#05070B' : matchTheme.colors.fgPrimary }}>
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Button label={t('common.close', 'Fechar')} variant="ghost" size="md" className="mt-3" onPress={() => setShowWebDateModal(false)} />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showWebTimeModal} onRequestClose={() => setShowWebTimeModal(false)}>
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <View className="w-full max-w-[420px] rounded-[18px] border p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}>
            <Text variant="label" className="font-bold mb-3" style={{ color: matchTheme.colors.fgPrimary }}>
              {t('filters.selectTime', 'Selecione o horário')}
            </Text>
            <View className="flex-row items-center justify-center gap-4">
              <Button label="-" variant="ghost" size="sm" fullWidth={false} onPress={() => setWebHour((h) => (h + 23) % 24)} />
              <Text variant="number" className="text-[34px]" style={{ color: matchTheme.colors.fgPrimary }}>
                {String(webHour).padStart(2, '0')}
              </Text>
              <Text variant="number" className="text-[34px]" style={{ color: matchTheme.colors.fgMuted }}>
                :
              </Text>
              <Text variant="number" className="text-[34px]" style={{ color: matchTheme.colors.fgPrimary }}>
                {String(webMinute).padStart(2, '0')}
              </Text>
              <Button label="+" variant="ghost" size="sm" fullWidth={false} onPress={() => setWebHour((h) => (h + 1) % 24)} />
            </View>
            <View className="flex-row items-center justify-center gap-2 mt-3">
              <Button label="- min" variant="ghost" size="sm" fullWidth={false} onPress={() => setWebMinute((m) => (m + 55) % 60)} />
              <Button label="+ min" variant="ghost" size="sm" fullWidth={false} onPress={() => setWebMinute((m) => (m + 5) % 60)} />
            </View>
            <Button
              label={t('common.confirm', 'Confirmar')}
              size="md"
              className="mt-4"
              onPress={() => {
                const selected = new Date(matchTime);
                selected.setHours(webHour, webMinute, 0, 0);
                setMatchTime(selected);
                setShowWebTimeModal(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}










