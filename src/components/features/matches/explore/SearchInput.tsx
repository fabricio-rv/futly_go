import { Search, SlidersHorizontal } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import { useMatchTheme } from '../shared/theme';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChangeText, placeholder }: SearchInputProps) {
  const matchTheme = useMatchTheme();

  return (
    <View className="px-[18px] mb-[10px]">
      <View
        className="h-[46px] rounded-[14px] border px-3 flex-row items-center"
        style={{ backgroundColor: matchTheme.colors.bgSurfaceB, borderColor: matchTheme.colors.lineStrong }}
      >
        <Search size={16} stroke={matchTheme.colors.fgMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? 'Buscar local, time, organizador...'}
          placeholderTextColor={matchTheme.colors.fgMuted}
          className="flex-1 text-[14px] ml-2"
          style={{ color: matchTheme.colors.fgPrimary }}
        />
        <SlidersHorizontal size={18} stroke={matchTheme.colors.ok} />
      </View>
    </View>
  );
}
