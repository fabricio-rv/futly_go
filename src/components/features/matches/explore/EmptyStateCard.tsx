import { Search } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useWindowDimensions } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';
import { useMatchTheme } from '../shared/theme';

type EmptyStateCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyStateCard({ title, description, actionLabel, onAction }: EmptyStateCardProps) {
  const { width } = useWindowDimensions();
  const matchTheme = useMatchTheme();
  const theme = useAppColorScheme();
  const isSmall = width < 380;
  const buttonWidth = Math.min(Math.max(width * 0.62, 220), 320);

  return (
    <View
      className="mx-[18px] px-5 pt-7 pb-8 rounded-[20px] border border-dashed items-center"
      style={{
        backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(4,10,20,0.56)',
        borderColor: theme === 'light' ? '#D7E1EF' : 'rgba(255,255,255,0.12)',
      }}
    >
      <View className="w-[64px] h-[64px] rounded-[20px] border items-center justify-center mb-4" style={{ backgroundColor: 'rgba(0,154,84,0.14)', borderColor: 'rgba(34,183,108,0.30)' }}>
        <Search size={26} stroke={matchTheme.colors.okSoft} />
      </View>

      <Text variant="heading" className="font-semibold text-center text-[20px] leading-[26px]" style={{ color: matchTheme.colors.fgPrimary }}>{title}</Text>
      <Text variant="caption" className="text-center mt-2 text-[14px] leading-[21px]" style={{ color: matchTheme.colors.fgMuted }}>{description}</Text>

      {actionLabel ? (
        <Pressable
          onPress={onAction}
          className="mt-6 h-[52px] rounded-[18px] items-center justify-center px-5"
          style={{
            width: buttonWidth,
            backgroundColor: '#2BB673',
            shadowColor: '#0FAE69',
            shadowOpacity: 0.28,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 7,
          }}
        >
          <Text
            variant="label"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.9}
            className={`font-semibold ${isSmall ? 'text-[16px] leading-[20px]' : 'text-[18px] leading-[22px]'}`}
            style={{ color: '#03110A' }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
