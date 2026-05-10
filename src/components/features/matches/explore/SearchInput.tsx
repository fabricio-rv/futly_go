import { Search, SlidersHorizontal } from 'lucide-react-native';
import { View, Pressable } from 'react-native';

import { useMatchTheme } from '../shared/theme';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { Input } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filtersExpanded?: boolean;
};

export function SearchInput({ value, onChangeText, placeholder, onFilterPress, filtersExpanded = false }: SearchInputProps) {
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const { t } = useTranslation('matches');
  const isLight = theme === 'light';

  return (
    <View className="px-[18px] mb-[10px]">
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder ?? t('search.placeholder', 'Buscar local, time, organizador...')}
            leftIcon={<Search size={16} color={isLight ? '#64748B' : 'rgba(255,255,255,0.45)'} strokeWidth={2} />}
            size="md"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <Pressable
          onPress={onFilterPress}
          className="h-12 w-12 rounded-full border items-center justify-center"
          disabled={!onFilterPress}
          style={{
            borderWidth: 0.5,
            backgroundColor: filtersExpanded
              ? (isLight ? '#E8F6EE' : 'rgba(34,183,108,0.18)')
              : (isLight ? '#FAFBFC' : '#101626'),
            borderColor: filtersExpanded
              ? (isLight ? '#7BC59F' : 'rgba(34,183,108,0.42)')
              : (isLight ? '#DDE2ED' : '#1F2A44'),
          }}
        >
          <SlidersHorizontal size={18} stroke={filtersExpanded ? matchTheme.colors.okSoft : matchTheme.colors.ok} />
        </Pressable>
      </View>
    </View>
  );
}
