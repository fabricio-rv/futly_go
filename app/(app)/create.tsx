import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, Pressable, View, Modal, Alert } from 'react-native';

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

const MIN_LEVEL_OPTIONS: Array<{ value: MinLevelValue; label: string }> = [
  { value: 'pereba', label: 'Pereba' },
  { value: 'resenha', label: 'Resenha' },
  { value: 'casual', label: 'Casual' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'competitivo', label: 'Competitivo' },
  { value: 'semi_amador', label: 'Semi-Amador' },
  { value: 'amador', label: 'Amador' },
  { value: 'ex_profissional', label: 'Ex-profissional' },
];

const TURNO_OPTIONS = [
  { value: 'manha', label: 'Manha' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
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
  const theme = useAppColorScheme();
  const matchTheme = useMatchTheme();
  const { createMatch, submitting } = useMatches();
  const creatingRef = useRef(false);

  const [mode, setMode] = useState<PitchMode>('futsal');
  const [restBreak, setRestBreak] = useState(true);
  const [referee, setReferee] = useState(false);
  const [externalReserves, setExternalReserves] = useState(true);
  const [description, setDescription] = useState(
    'Time fechado de Pivo e Goleiro - buscamos 2 alas e 1 fixo. Camiseta amarela. Encontro 19h15 no Bar do Carlos.',
  );
  const [selectedPositionIndexes, setSelectedPositionIndexes] = useState<number[]>([0, 1, 2, 3]);

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
        title: venueName.trim() || 'Partida sem título',
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
        allowExternalReserves: externalReserves,
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
          { label: 'Vestiario', selected: true },
          { label: 'Chuveiro', selected: true },
          { label: 'Estacionamento', selected: true },
          { label: 'Bar / Lanche', selected: false },
        ],
      });

      const successMessage =
        status === 'rascunho'
          ? 'Seu rascunho foi salvo e aparece na sua Agenda.'
          : 'Sua partida já está disponível em Encontrar Jogo e na Agenda.';

      Alert.alert('Partida criada', successMessage, [
        {
          text: 'OK',
          onPress: () => router.replace('/(app)'),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar a partida.';
      Alert.alert('Falha ao criar partida', message);
    } finally {
      creatingRef.current = false;
    }
  }

  const monthYearLabel = webDateCursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const currentYear = webDateCursor.getFullYear();
  const currentMonth = webDateCursor.getMonth();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthDays = daysInMonth(currentYear, currentMonth);
  const leadingEmpty = Array.from({ length: firstWeekday });
  const dayNumbers = Array.from({ length: monthDays }, (_, idx) => idx + 1);

  return (
    <Screen padded={false} showBackground={false}>
      <MatchBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 152 }}>
        <View className="px-[18px] pt-4 pb-1">
          <Text variant="heading" style={{ color: theme === 'light' ? '#111827' : '#FFFFFF' }}>Novo Jogo</Text>
        </View>

        <StepIndicator total={4} current={3} />

        <View className="px-[18px] flex-row items-center justify-between mb-3">
          <SectionTitle title="Configuracao da Partida" badge="2 / 4" />
          <StatBadge label="RASCUNHO" tone="gold" small />
        </View>

        <View className="px-[18px] gap-[14px]">
          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title="Detalhes da Partida" />
            <View className="gap-3 mt-2">
              <Input
                label="CEP"
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

              <Input label="Bairro" value={district} onChangeText={setDistrict} placeholder="Seu bairro" />

              <Input
                label="Nome do Campo / Quadra"
                value={venueName}
                onChangeText={setVenueName}
                placeholder="Ex.: Arena Central - Quadra B"
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <SelectField
                    label="Estado"
                    value={stateCode}
                    options={stateOptions}
                    searchable
                    placeholder="Selecione o estado"
                    onChange={setStateCode}
                  />
                </View>
                <View className="flex-1">
                  <Input label="Cidade" value={city} onChangeText={setCity} placeholder="Sua cidade" />
                </View>
              </View>

              <Input label="Endereco" value={address} onChangeText={setAddress} placeholder="Rua e numero" />
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title="Informacoes da Partida" />
            <View className="gap-3 mt-2">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <DateTimeField
                    label="Data"
                    value={formatDateField(matchDate)}
                    placeholder="Selecione a data"
                    onPress={() => {
                      setWebDateCursor(new Date(matchDate.getFullYear(), matchDate.getMonth(), 1));
                      setShowWebDateModal(true);
                    }}
                  />
                </View>
                <View className="flex-1">
                  <DateTimeField
                    label="Horario"
                    value={formatTimeField(matchTime)}
                    placeholder="Selecione o horario"
                    onPress={() => {
                      setWebHour(matchTime.getHours());
                      setWebMinute(matchTime.getMinutes());
                      setShowWebTimeModal(true);
                    }}
                  />
                </View>
                <View className="flex-1">
                  <SelectField
                    label="Turno"
                    value={turno}
                    options={TURNO_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                    placeholder="Selecione o turno"
                    onChange={(value) =>
                      setTurno(value as (typeof TURNO_OPTIONS)[number]['value'])
                    }
                  />
                </View>
              </View>

              <Input
                label="Telefone para contato"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
              />
            </View>

            <Text
              variant="micro"
              className="uppercase tracking-[2px] mt-4"
              style={{ color: matchTheme.colors.fgMuted }}
            >
              Facilidades
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              <View className="w-[48.5%]">
                <FacilityCheckCard label="Vestiario" selected />
              </View>
              <View className="w-[48.5%]">
                <FacilityCheckCard label="Chuveiro" selected />
              </View>
              <View className="w-[48.5%]">
                <FacilityCheckCard label="Estacionamento" selected />
              </View>
              <View className="w-[48.5%]">
                <FacilityCheckCard label="Bar / Lanche" selected={false} />
              </View>
            </View>
          </Card>

          <Card
            className="p-4 border"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: 'rgba(34,183,108,0.35)' }}
          >
            <SectionTitle title="Configuracoes da Partida" />

            <Text variant="micro" className="uppercase tracking-[2px] mt-2" style={{ color: matchTheme.colors.fgMuted }}>
              Nivel do Jogo
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {MIN_LEVEL_OPTIONS.map((level) => (
                <StatBadge
                  key={`game-level-${level.value}`}
                  label={level.label}
                  tone={acceptedLevels.includes(level.value) ? 'active' : 'neutral'}
                />
              ))}
            </View>

              <View className="flex-row gap-2 mt-4">
                <View className="flex-1">
                  <Input
                    label="Valor por pessoa"
                    value={pricePerPerson}
                    onChangeText={handlePricePerPersonChange}
                    keyboardType="number-pad"
                    placeholder="25"
                    leftAdornment={<Text variant="body" tone="muted">R$</Text>}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Duracao (min)"
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
                Restricoes de idade
              </Text>
              <RangeSelector min={16} max={80} minPercent={8} maxPercent={72} />
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                Apenas atletas entre 16 e 80 anos podem se inscrever
              </Text>
            </View>

            <View className="gap-2 mt-4">
              <ToggleRow
                title="Tem intervalo"
                subtitle="2x 5min entre tempos"
                value={restBreak}
                onToggle={() => setRestBreak((v) => !v)}
              />
              <ToggleRow
                title="Arbitro incluso"
                subtitle="+R$ 8/pessoa - Federacao RS"
                value={referee}
                onToggle={() => setReferee((v) => !v)}
              />
              <ToggleRow
                title="Aceitar reservas externas"
                subtitle="Outros usuarios podem se inscrever"
                value={externalReserves}
                onToggle={() => setExternalReserves((v) => !v)}
              />
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <View className="flex-row items-center justify-between">
              <SectionTitle title="Requisitos dos Jogadores" />
            </View>
            <Text variant="caption" className="mt-1" style={{ color: matchTheme.colors.fgMuted }}>
              Niveis Minimos Aceitos
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {MIN_LEVEL_OPTIONS.map((level) => (
                <MinLevelCheckbox
                  key={level.value}
                  label={level.label}
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
                <SectionTitle title="Posicoes Disponiveis" />
                <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                  Toque para abrir / bloquear vagas
                </Text>
                <View className="gap-1 mt-2">
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    Voce (Host) - Goleiro
                  </Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    2 confirmados
                  </Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    2 vagas abertas
                  </Text>
                  <Text variant="caption" style={{ color: matchTheme.colors.fgSecondary }}>
                    1 bloqueada (Pivo)
                  </Text>
                </View>
              </View>
              <View className="w-[194px]">
                <SegmentedControl
                  options={[
                    { id: 'futsal', label: 'Futsal' },
                    { id: 'society', label: 'Society' },
                    { id: 'campo', label: 'Campo' },
                  ]}
                  activeId={mode}
                  onChange={(value) => setMode(value as PitchMode)}
                  compact
                />
              </View>
            </View>

            <View className="items-center" style={{ marginTop: -130 }} pointerEvents="box-none">
              <View pointerEvents="auto">
                <TacticalPitch
                  mode={mode}
                  selectedIndexes={selectedPositionIndexes}
                  onToggleIndex={togglePosition}
                  width={300}
                />
              </View>
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title="Descricao" />
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
            label="Continuar para Revisao"
            loading={submitting}
            disabled={submitting}
            onPress={() => handleCreateMatch('publicada')}
          />
          <Button
            label="Salvar Rascunho"
            variant="ghost"
            disabled={submitting}
            onPress={() => handleCreateMatch('rascunho')}
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
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((weekDay, idx) => (
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

            <Button label="Fechar" variant="ghost" size="md" className="mt-3" onPress={() => setShowWebDateModal(false)} />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showWebTimeModal} onRequestClose={() => setShowWebTimeModal(false)}>
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <View className="w-full max-w-[420px] rounded-[18px] border p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}>
            <Text variant="label" className="font-bold mb-3" style={{ color: matchTheme.colors.fgPrimary }}>
              Selecione o horario
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
              label="Confirmar"
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





