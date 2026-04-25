import { useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ScrollView, Pressable, View, Platform } from 'react-native';

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
  matchTheme,
} from '@/src/components/features/matches';
import { TacticalPitch } from '@/src/components/fifa';
import { Button, Card, Input, Screen, SelectField, Text } from '@/src/components/ui';
import { BRAZIL_STATE_OPTIONS } from '@/src/features/auth/constants';
import { fetchAddressByCep, formatCep } from '@/src/features/location/cep';

type MinLevelValue =
  | 'resenha'
  | 'iniciante'
  | 'intermediario'
  | 'avancado'
  | 'semi_amador'
  | 'amador';

const MIN_LEVEL_OPTIONS: Array<{ value: MinLevelValue; label: string }> = [
  { value: 'resenha', label: 'Resenha' },
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediario' },
  { value: 'avancado', label: 'Avancado' },
  { value: 'semi_amador', label: 'Semi-Amador' },
  { value: 'amador', label: 'Amador' },
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

function MinLevelCheckbox({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[48.5%] rounded-[14px] border px-[12px] py-[10px] flex-row items-center gap-2"
      style={{
        backgroundColor: '#0C111E',
        borderColor: selected ? matchTheme.colors.ok : matchTheme.colors.lineStrong,
      }}
    >
      <View
        className="w-4 h-4 rounded-[4px] border"
        style={{
          backgroundColor: selected ? matchTheme.colors.ok : 'transparent',
          borderColor: selected ? matchTheme.colors.ok : matchTheme.colors.lineStrong,
        }}
      />
      <Text variant="label" style={{ color: matchTheme.colors.fgPrimary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CreateMatchScreen() {
  const [mode, setMode] = useState('futsal');
  const [restBreak, setRestBreak] = useState(true);
  const [referee, setReferee] = useState(false);
  const [externalReserves, setExternalReserves] = useState(true);

  const [stateCode, setStateCode] = useState('RS');
  const [city, setCity] = useState('Porto Alegre');
  const [address, setAddress] = useState('R. dos Andradas, 1234');
  const [district, setDistrict] = useState('Cidade Baixa');
  const [cep, setCep] = useState('90020-300');

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [turno, setTurno] = useState<(typeof TURNO_OPTIONS)[number]['value']>('noite');

  const [acceptedLevels, setAcceptedLevels] = useState<MinLevelValue[]>([
    'resenha',
    'intermediario',
    'amador',
  ]);
  const [confirmedPlayers] = useState(15);
  const [totalPlayers] = useState(26);

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

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      setMatchDate(selectedDate);
    }

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    if (selectedTime) {
      setMatchTime(selectedTime);
    }

    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
  };

  return (
    <Screen padded={false} showBackground={false}>
      <MatchBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 152 }}>
        <View className="px-[18px] pt-4 pb-1">
          <Text variant="heading">Novo Jogo</Text>
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
            <SectionTitle title="Informacoes Basicas" />
            <View className="gap-3 mt-2">
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
                  <Input label="Cidade" value={city} onChangeText={setCity} />
                </View>
              </View>

              <Input label="Endereco" value={address} onChangeText={setAddress} />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <DateTimeField
                    label="Data"
                    value={formatDateField(matchDate)}
                    placeholder="Selecione a data"
                    onPress={() => setShowDatePicker(true)}
                  />
                </View>
                <View className="flex-1">
                  <DateTimeField
                    label="Horario"
                    value={formatTimeField(matchTime)}
                    placeholder="Selecione o horario"
                    onPress={() => setShowTimePicker(true)}
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

              {showDatePicker ? (
                <DateTimePicker
                  value={matchDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                />
              ) : null}

              {showTimePicker ? (
                <DateTimePicker
                  value={matchTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              ) : null}
            </View>
          </Card>

          <Card
            className="p-4"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.line }}
          >
            <SectionTitle title="Detalhes do Local" />
            <View className="gap-3 mt-2">
              <Input label="Nome do Campo / Quadra" value="Arena Central - Quadra B" onChangeText={() => {}} />
              <View className="flex-row gap-2">
                <View className="flex-1">
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
                  />
                </View>
                <View className="flex-1">
                  <Input label="Bairro" value={district} onChangeText={setDistrict} />
                </View>
              </View>
              <Input label="Telefone do Local" value="(51) 3221-0455" onChangeText={() => {}} />
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
              <StatBadge label="Iniciante" tone="neutral" />
              <StatBadge label="Casual" tone="neutral" />
              <StatBadge label="Intermediario" tone="active" />
              <StatBadge label="Ouro" tone="gold" />
              <StatBadge label="Avancado" tone="neutral" />
            </View>

            <View className="flex-row gap-2 mt-4">
              <View className="flex-1">
                <Text variant="micro" className="uppercase tracking-[2px]" style={{ color: matchTheme.colors.fgMuted }}>
                  Valor por pessoa
                </Text>
                <View
                  className="mt-2 h-12 rounded-[14px] border px-2 flex-row items-center justify-between"
                  style={{ backgroundColor: '#0C111E', borderColor: matchTheme.colors.lineStrong }}
                >
                  <Button label="-" size="sm" variant="ghost" fullWidth={false} onPress={() => {}} />
                  <Text variant="number" className="text-[22px]">
                    R$ 25
                  </Text>
                  <Button label="+" size="sm" variant="ghost" fullWidth={false} onPress={() => {}} />
                </View>
              </View>
              <View className="flex-1">
                <Text variant="micro" className="uppercase tracking-[2px]" style={{ color: matchTheme.colors.fgMuted }}>
                  Duracao
                </Text>
                <View
                  className="mt-2 h-12 rounded-[14px] border px-2 flex-row items-center justify-between"
                  style={{ backgroundColor: '#0C111E', borderColor: matchTheme.colors.lineStrong }}
                >
                  <Button label="-" size="sm" variant="ghost" fullWidth={false} onPress={() => {}} />
                  <Text variant="number" className="text-[22px]">
                    60
                  </Text>
                  <Button label="+" size="sm" variant="ghost" fullWidth={false} onPress={() => {}} />
                </View>
              </View>
            </View>

            <View className="mt-4">
              <Text variant="micro" className="uppercase tracking-[2px]" style={{ color: matchTheme.colors.fgMuted }}>
                Restricoes de idade
              </Text>
              <RangeSelector min={16} max={45} minPercent={8} maxPercent={72} />
              <Text variant="caption" style={{ color: matchTheme.colors.fgMuted }}>
                Apenas atletas entre 16 e 45 anos podem se inscrever
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
              <View
                className="px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: '#060B16', borderColor: matchTheme.colors.lineStrong }}
              >
                <Text variant="label" className="text-[16px]" style={{ color: matchTheme.colors.fgPrimary }}>
                  {confirmedPlayers}/{totalPlayers}
                </Text>
              </View>
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
              </View>
              <View className="w-[130px]">
                <SegmentedControl
                  options={[
                    { id: 'futsal', label: 'Futsal' },
                    { id: 'society', label: 'Society' },
                  ]}
                  activeId={mode}
                  onChange={setMode}
                  compact
                />
              </View>
            </View>

            <View className="flex-row gap-3 items-start">
              <TacticalPitch
                mode={mode === 'society' ? 'society' : 'futsal'}
                selectedIndexes={[0, 1, 2, 3]}
                width={170}
              />
              <View className="flex-1 gap-2">
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
                value="Time fechado de Pivo e Goleiro - buscamos 2 alas e 1 fixo. Camiseta amarela. Encontro 19h15 no Bar do Carlos."
                onChangeText={() => {}}
              />
              <Text variant="caption" className="text-right mt-1" style={{ color: matchTheme.colors.fgMuted }}>
                98 / 280
              </Text>
            </View>
          </Card>

          <Button label="Continuar para Revisao" onPress={() => {}} />
          <Button label="Salvar Rascunho" variant="ghost" onPress={() => {}} />
          <View className="h-2" />
        </View>
      </ScrollView>
      <MatchBottomNav active="new" />
    </Screen>
  );
}
