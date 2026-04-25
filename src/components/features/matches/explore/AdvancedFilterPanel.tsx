import { useState } from 'react';
import { ScrollView, View, Pressable, Modal } from 'react-native';

import { useMatchTheme } from '../shared/theme';
import { Text, Input, SelectField, Button } from '@/src/components/ui';

export interface AdvancedFilters {
  state?: string;
  city?: string;
  date?: string;
  time?: string;
  shift?: 'manha' | 'tarde' | 'noite';
  maxPrice?: number;
}

type AdvancedFilterPanelProps = {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
};

const TURNO_OPTIONS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
];


export function AdvancedFilterPanel({ visible, onClose, filters, onFiltersChange }: AdvancedFilterPanelProps) {
  const matchTheme = useMatchTheme();
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [webDateCursor, setWebDateCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [webHour, setWebHour] = useState(6);
  const [webMinute, setWebMinute] = useState(0);


  const handleDateChange = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    onFiltersChange({ ...filters, date: dateString });
    setShowDateModal(false);
  };

  const handleTimeConfirm = () => {
    const timeString = `${String(webHour).padStart(2, '0')}:${String(webMinute).padStart(2, '0')}`;
    onFiltersChange({ ...filters, time: timeString });
    setShowTimeModal(false);
  };

  const handleShiftChange = (shift: string) => {
    onFiltersChange({ ...filters, shift: shift as 'manha' | 'tarde' | 'noite' });
  };

  const handlePriceChange = (price: string) => {
    const numPrice = price ? Number(price) : undefined;
    onFiltersChange({ ...filters, maxPrice: numPrice });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const monthYearLabel = webDateCursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const currentYear = webDateCursor.getFullYear();
  const currentMonth = webDateCursor.getMonth();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const leadingEmpty = Array.from({ length: firstWeekday });
  const dayNumbers = Array.from({ length: monthDays }, (_, idx) => idx + 1);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose}>
        <View className="flex-1 justify-center items-center px-4">
          <Pressable
            className="w-full max-w-[420px] rounded-[18px] border max-h-[85%]"
            style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="p-4 gap-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text variant="label" className="font-bold" style={{ color: matchTheme.colors.fgPrimary }}>
                    Filtros Avançados
                  </Text>
                  <Pressable onPress={onClose}>
                    <Text variant="label" style={{ color: matchTheme.colors.fgMuted }}>
                      ✕
                    </Text>
                  </Pressable>
                </View>

                <View className="gap-3">

                  {/* Date */}
                  <View>
                    <Pressable
                      onPress={() => setShowDateModal(true)}
                      className="h-10 rounded-[10px] border px-3 justify-center"
                      style={{ backgroundColor: matchTheme.colors.bgSurfaceB, borderColor: matchTheme.colors.lineStrong }}
                    >
                      <Text
                        variant="caption"
                        className="font-medium"
                        style={{ color: filters.date ? matchTheme.colors.fgPrimary : matchTheme.colors.fgMuted }}
                      >
                        Data: {filters.date ? new Date(filters.date).toLocaleDateString('pt-BR') : 'Selecione'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Time */}
                  <View>
                    <Pressable
                      onPress={() => setShowTimeModal(true)}
                      className="h-10 rounded-[10px] border px-3 justify-center"
                      style={{ backgroundColor: matchTheme.colors.bgSurfaceB, borderColor: matchTheme.colors.lineStrong }}
                    >
                      <Text
                        variant="caption"
                        className="font-medium"
                        style={{ color: filters.time ? matchTheme.colors.fgPrimary : matchTheme.colors.fgMuted }}
                      >
                        Horário: {filters.time || 'Selecione'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Shift */}
                  <View>
                    <SelectField
                      label="Turno"
                      value={filters.shift || ''}
                      options={TURNO_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                      placeholder="Selecione o turno"
                      onChange={handleShiftChange}
                    />
                  </View>

                  {/* Price */}
                  <View>
                    <Input
                      label="Preço Máximo (R$)"
                      value={filters.maxPrice?.toString() || ''}
                      onChangeText={handlePriceChange}
                      keyboardType="number-pad"
                      placeholder="Ex.: 50"
                    />
                  </View>
                </View>

                <View className="flex-row gap-2 mt-2">
                  <Button
                    label="Buscar"
                    onPress={onClose}
                    className="flex-1"
                  />
                  <Button
                    label="Limpar"
                    variant="ghost"
                    onPress={handleClearFilters}
                    className="flex-1"
                  />
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>

      {/* Date Modal */}
      <Modal transparent visible={showDateModal} onRequestClose={() => setShowDateModal(false)}>
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
                  <Text variant="micro" style={{ color: matchTheme.colors.fgMuted }}>
                    {weekDay}
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {leadingEmpty.map((_, idx) => (
                <View key={`empty-${idx}`} className="w-[14.28%] h-10" />
              ))}
              {dayNumbers.map((day) => {
                const selectedDate = filters.date ? new Date(filters.date) : null;
                const isSelected =
                  selectedDate &&
                  selectedDate.getFullYear() === currentYear &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getDate() === day;

                return (
                  <Pressable
                    key={`day-${day}`}
                    className="w-[14.28%] h-10 items-center justify-center"
                    onPress={() => {
                      const selected = new Date(currentYear, currentMonth, day);
                      handleDateChange(selected);
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

            <Button label="Fechar" variant="ghost" size="md" className="mt-3" onPress={() => setShowDateModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Time Modal */}
      <Modal transparent visible={showTimeModal} onRequestClose={() => setShowTimeModal(false)}>
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.62)' }}>
          <View className="w-full max-w-[420px] rounded-[18px] border p-4" style={{ backgroundColor: matchTheme.colors.bgSurfaceA, borderColor: matchTheme.colors.lineStrong }}>
            <Text variant="label" className="font-bold mb-3" style={{ color: matchTheme.colors.fgPrimary }}>
              Selecione o horário
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
              onPress={handleTimeConfirm}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
