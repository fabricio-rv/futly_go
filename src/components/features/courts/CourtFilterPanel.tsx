import { ChevronDown } from 'lucide-react-native';
import { Modal, Pressable, TextInput, useWindowDimensions, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../matches/shared/theme';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { useState } from 'react';

export interface CourtFilters {
  state?: string;
  city?: string;
  location?: string;
}

type Props = {
  filters: CourtFilters;
  onFiltersChange: (filters: CourtFilters) => void;
  states: string[];
  cities: string[];
};

type FieldButtonProps = {
  label: string;
  value?: string;
  placeholder: string;
  onPress?: () => void;
  disabled?: boolean;
};

function FieldButton({ label, value, placeholder, onPress, disabled }: FieldButtonProps) {
  const matchTheme = useMatchTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="gap-2"
      style={{ opacity: disabled ? 0.55 : 1 }}
    >
      <Text variant="caption" className="font-semibold" style={{ color: matchTheme.colors.fgSecondary }}>
        {label}
      </Text>
      <View
        className="h-12 rounded-[12px] border px-3 flex-row items-center justify-between"
        style={{ backgroundColor: matchTheme.colors.bgSurfaceB, borderColor: matchTheme.colors.lineStrong }}
      >
        <Text
          variant="body"
          numberOfLines={1}
          style={{ color: value ? matchTheme.colors.fgPrimary : matchTheme.colors.fgMuted, flex: 1 }}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={18} color={matchTheme.colors.fgMuted} />
      </View>
    </Pressable>
  );
}

function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  allLabel,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (value?: string) => void;
  onClose: () => void;
  allLabel: string;
}) {
  const matchTheme = useMatchTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-center px-6" onPress={onClose}>
        <Pressable
          className="rounded-[18px] border p-4 max-h-[70%]"
          style={{
            borderColor: matchTheme.colors.lineStrong,
            backgroundColor: matchTheme.colors.bgSurfaceA,
          }}
        >
          <Text variant="label" className="font-bold mb-3" style={{ color: matchTheme.colors.fgPrimary }}>
            {title}
          </Text>
          <View className="gap-2">
            <Pressable
              className="rounded-[10px] border px-3 py-3"
              style={{
                borderColor: matchTheme.colors.line,
                backgroundColor: !selected ? matchTheme.colors.ok : matchTheme.colors.bgSurfaceB,
              }}
              onPress={() => {
                onSelect(undefined);
                onClose();
              }}
            >
              <Text variant="body" style={{ color: !selected ? '#05070B' : matchTheme.colors.fgPrimary }}>
                {allLabel}
              </Text>
            </Pressable>
            {options.map((option) => {
              const active = selected === option;
              return (
                <Pressable
                  key={option}
                  className="rounded-[10px] border px-3 py-3"
                  style={{
                    borderColor: matchTheme.colors.line,
                    backgroundColor: active ? matchTheme.colors.ok : matchTheme.colors.bgSurfaceB,
                  }}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text variant="body" style={{ color: active ? '#05070B' : matchTheme.colors.fgPrimary }}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function CourtFilterPanel({ filters, onFiltersChange, states, cities }: Props) {
  const matchTheme = useMatchTheme();
  const { t } = useTranslation('quadras');
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <>
      <View className="px-[18px] mb-3">
        <View
          className="rounded-[20px] border p-3 gap-2"
          style={{
            backgroundColor: matchTheme.colors.bgSurfaceA,
            borderColor: matchTheme.colors.line,
          }}
        >
          <View className={isCompact ? 'gap-2' : 'flex-row gap-2'}>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <FieldButton
                label={t('filters.state', 'Estado')}
                value={filters.state}
                placeholder={t('filters.selectState', 'Selecione o estado')}
                onPress={() => setStatePickerVisible(true)}
              />
            </View>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <FieldButton
                label={t('filters.city', 'Cidade')}
                value={filters.city}
                placeholder={t('filters.selectCity', 'Selecione a cidade')}
                onPress={() => setCityPickerVisible(true)}
              />
            </View>
          </View>

          <View className={isCompact ? 'gap-2 mt-1' : 'flex-row gap-2 mt-1'}>
            <View className={isCompact ? 'w-full gap-2' : 'flex-1 gap-2'}>
              <Text variant="caption" className="font-semibold" style={{ color: matchTheme.colors.fgSecondary }}>
                {t('filters.location', 'Localização')}
              </Text>
              <View
                className="h-12 rounded-[12px] border px-3 flex-row items-center"
                style={{ backgroundColor: matchTheme.colors.bgSurfaceB, borderColor: matchTheme.colors.lineStrong }}
              >
                <TextInput
                  value={filters.location ?? ''}
                  onChangeText={(value) => onFiltersChange({ ...filters, location: value })}
                  placeholder={t('filters.locationPlaceholder', 'Buscar por local')}
                  placeholderTextColor={matchTheme.colors.fgMuted}
                  style={{ color: matchTheme.colors.fgPrimary, fontSize: 14, flex: 1 }}
                />
              </View>
            </View>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <FieldButton
                label={t('filters.floor', 'Piso')}
                placeholder={t('filters.floorPlaceholder', 'Em breve')}
                disabled
              />
            </View>
          </View>

          <View className="items-end mt-[2px]">
            <Pressable onPress={handleClearFilters} className="px-1 py-[2px]">
              <Text variant="caption" className="font-semibold" style={{ color: matchTheme.colors.fgMuted }}>
                {t('filters.clear', 'Limpar')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <PickerModal
        visible={statePickerVisible}
        title={t('filters.state', 'Estado')}
        options={states}
        selected={filters.state}
        onSelect={(value) => onFiltersChange({ ...filters, state: value, city: undefined })}
        onClose={() => setStatePickerVisible(false)}
        allLabel={t('filters.allStates', 'Todos os estados')}
      />

      <PickerModal
        visible={cityPickerVisible}
        title={t('filters.city', 'Cidade')}
        options={cities}
        selected={filters.city}
        onSelect={(value) => onFiltersChange({ ...filters, city: value })}
        onClose={() => setCityPickerVisible(false)}
        allLabel={t('filters.allCities', 'Todas as cidades')}
      />
    </>
  );
}
