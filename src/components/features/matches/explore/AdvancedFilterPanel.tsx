import { useMemo, useState } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Button, Input, SelectField, Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

export interface AdvancedFilters {
  state?: string;
  city?: string;
  date?: string;
  time?: string;
  shift?: 'manha' | 'tarde' | 'noite';
  maxPrice?: number;
}

type AdvancedFilterPanelProps = {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
};

type FieldButtonProps = {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
};

type ShiftSelectValue = NonNullable<AdvancedFilters['shift']> | '__all__';

const TURNO_OPTIONS: Array<{ value: NonNullable<AdvancedFilters['shift']>; labelKey: string; fallback: string }> = [
  { value: 'manha', labelKey: 'filters.shiftMorning', fallback: 'Manha' },
  { value: 'tarde', labelKey: 'filters.shiftAfternoon', fallback: 'Tarde' },
  { value: 'noite', labelKey: 'filters.shiftNight', fallback: 'Noite' },
];

function formatDateField(value: Date) {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function parseIsoDate(value?: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function parseIsoTime(value?: string) {
  if (!value) return null;
  if (!/^\d{2}:\d{2}/.test(value)) return null;
  const [h, min] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return { hour: h, minute: min };
}

function FieldButton({ label, value, placeholder, onPress, disabled = false }: FieldButtonProps) {
  const theme = useAppColorScheme();

  const borderColor = theme === 'light' ? '#DDE2ED' : '#1F2A44';
  const backgroundColor = theme === 'light' ? '#FAFBFC' : '#101626';
  const labelColor = theme === 'light' ? '#475569' : 'rgba(255,255,255,0.70)';
  const valueColor = value ? (theme === 'light' ? '#18181B' : '#FAFAFA') : (theme === 'light' ? '#64748B' : '#7A8699');
  const iconColor = theme === 'light' ? 'rgba(31,41,55,0.60)' : 'rgba(255,255,255,0.60)';

  return (
    <Pressable onPress={onPress} disabled={disabled} className="w-full" style={{ opacity: disabled ? 0.6 : 1 }}>
      <Text variant="label" className="mb-2.5 font-semibold" style={{ color: labelColor }}>
        {label}
      </Text>
      <View
        className="h-12 rounded-[28px] border-[0.5px] px-4 flex-row items-center justify-between"
        style={{ backgroundColor, borderColor }}
      >
        <Text variant="body" numberOfLines={1} style={{ color: valueColor, flex: 1 }}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={iconColor} />
      </View>
    </Pressable>
  );
}

export function AdvancedFilterPanel({ filters, onFiltersChange }: AdvancedFilterPanelProps) {
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const { t, currentLanguage } = useTranslation('matches');
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const selectValue: ShiftSelectValue = filters.shift ?? '__all__';

  const selectedDate = parseIsoDate(filters.date) ?? new Date();
  const parsedTime = parseIsoTime(filters.time);

  const [showWebDateModal, setShowWebDateModal] = useState(false);
  const [showWebTimeModal, setShowWebTimeModal] = useState(false);
  const [webDateCursor, setWebDateCursor] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [webHour, setWebHour] = useState(parsedTime?.hour ?? 19);
  const [webMinute, setWebMinute] = useState(parsedTime?.minute ?? 0);

  const monthYearLabel = webDateCursor.toLocaleDateString(currentLanguage, { month: 'long', year: 'numeric' });
  const currentYear = webDateCursor.getFullYear();
  const currentMonth = webDateCursor.getMonth();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthDays = daysInMonth(currentYear, currentMonth);
  const leadingEmpty = Array.from({ length: firstWeekday });
  const dayNumbers = Array.from({ length: monthDays }, (_, idx) => idx + 1);

  const shiftOptions: Array<{ value: ShiftSelectValue; label: string }> = useMemo(
    () => [
      { value: '__all__', label: t('filters.allShifts', 'Todos os turnos') },
      ...TURNO_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey, option.fallback),
      })),
    ],
    [t],
  );

  const handlePriceChange = (price: string) => {
    const cleanValue = price.replace(/[^\d]/g, '');
    const numPrice = cleanValue ? Number(cleanValue) : undefined;
    onFiltersChange({ ...filters, maxPrice: Number.isFinite(numPrice) ? numPrice : undefined });
  };

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
            position: 'relative',
            zIndex: 100,
            elevation: 100,
          }}
        >
          <View className={isCompact ? 'gap-2' : 'flex-row gap-2'}>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <FieldButton
                label={t('filters.date', 'Data')}
                value={filters.date ? formatDateField(parseIsoDate(filters.date) ?? new Date()) : ''}
                placeholder={t('filters.selectDate', 'Selecione a data')}
                onPress={() => {
                  const base = parseIsoDate(filters.date) ?? new Date();
                  setWebDateCursor(new Date(base.getFullYear(), base.getMonth(), 1));
                  setShowWebDateModal(true);
                }}
              />
            </View>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <FieldButton
                label={t('filters.time', 'Horario')}
                value={filters.time ?? ''}
                placeholder={t('filters.selectTime', 'Selecione o horario')}
                onPress={() => {
                  const time = parseIsoTime(filters.time);
                  setWebHour(time?.hour ?? 19);
                  setWebMinute(time?.minute ?? 0);
                  setShowWebTimeModal(true);
                }}
              />
            </View>
          </View>

          <View className={isCompact ? 'gap-2 mt-1' : 'flex-row gap-2 mt-1'}>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <SelectField<ShiftSelectValue>
                label={t('filters.shift', 'Turno')}
                value={selectValue}
                options={shiftOptions}
                onChange={(nextValue) => onFiltersChange({ ...filters, shift: nextValue === '__all__' ? undefined : nextValue })}
              />
            </View>
            <View className={isCompact ? 'w-full' : 'flex-1'}>
              <Input
                label={t('filters.maxPrice', 'Preco maximo')}
                value={filters.maxPrice?.toString() ?? ''}
                onChangeText={handlePriceChange}
                placeholder="50"
                keyboardType="number-pad"
                leftIcon={<Text variant="body" style={{ color: theme === 'light' ? '#64748B' : '#7A8699' }}>{t("filters.currencySymbol", "R$")}</Text>}
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
                const currentSelectedDate = parseIsoDate(filters.date);
                const isSelected =
                  currentSelectedDate &&
                  currentSelectedDate.getFullYear() === currentYear &&
                  currentSelectedDate.getMonth() === currentMonth &&
                  currentSelectedDate.getDate() === day;

                return (
                  <Pressable
                    key={`day-${day}`}
                    className="w-[14.28%] h-10 items-center justify-center"
                    onPress={() => {
                      const selected = new Date(currentYear, currentMonth, day);
                      onFiltersChange({ ...filters, date: toIsoDate(selected) });
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
              {t('filters.selectTime', 'Selecione o horario')}
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
              <Button label={t("filters.decreaseMinutes", "- min")} variant="ghost" size="sm" fullWidth={false} onPress={() => setWebMinute((m) => (m + 55) % 60)} />
              <Button label={t("filters.increaseMinutes", "+ min")} variant="ghost" size="sm" fullWidth={false} onPress={() => setWebMinute((m) => (m + 5) % 60)} />
            </View>
            <Button
              label={t("common.confirm", "Confirmar")}
              size="md"
              className="mt-4"
              onPress={() => {
                const nextTime = `${String(webHour).padStart(2, '0')}:${String(webMinute).padStart(2, '0')}`;
                onFiltersChange({ ...filters, time: nextTime });
                setShowWebTimeModal(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
