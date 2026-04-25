import { Search, SlidersHorizontal } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import { matchTheme } from './theme';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChangeText, placeholder }: SearchInputProps) {
  return (
    <View className="px-[18px] mb-[10px]">
      <View
        className="h-[46px] rounded-[14px] border px-3 flex-row items-center"
        style={{ backgroundColor: '#0B1120', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Search size={16} stroke={'rgba(255,255,255,0.34)'} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? 'Buscar local, time, organizador...'}
          placeholderTextColor={'rgba(255,255,255,0.42)'}
          className="flex-1 text-[14px] ml-2"
          style={{ color: matchTheme.colors.fgPrimary }}
        />
        <SlidersHorizontal size={18} stroke={matchTheme.colors.ok} />
      </View>
    </View>
  );
}
