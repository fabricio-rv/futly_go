import { Search, SlidersHorizontal } from 'lucide-react-native';
import { TextInput, View, Pressable } from 'react-native';

import { useMatchTheme } from '../shared/theme';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filtersExpanded?: boolean;
};

export function SearchInput({ value, onChangeText, placeholder, onFilterPress, filtersExpanded = false }: SearchInputProps) {
  const matchTheme = useMatchTheme();

  return (
    <View className="px-[18px] mb-[10px]">
      <View className="flex-row items-center gap-2">
        <View
          className="h-[46px] rounded-[14px] border px-3 flex-row items-center flex-1"
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
        </View>

        <Pressable
          onPress={onFilterPress}
          className="h-[46px] w-[46px] rounded-[14px] border items-center justify-center"
          style={{
            backgroundColor: filtersExpanded ? 'rgba(34,183,108,0.18)' : matchTheme.colors.bgSurfaceB,
            borderColor: filtersExpanded ? 'rgba(34,183,108,0.42)' : matchTheme.colors.lineStrong,
          }}
        >
          <SlidersHorizontal size={18} stroke={filtersExpanded ? matchTheme.colors.okSoft : matchTheme.colors.ok} />
        </Pressable>
      </View>
    </View>
  );
}
