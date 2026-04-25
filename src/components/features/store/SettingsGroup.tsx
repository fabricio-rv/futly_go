import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type IconTone = 'default' | 'ok' | 'gold' | 'bad' | 'sky';

export type SettingsRow = {
  id: string;
  icon: ReactNode;
  iconTone?: IconTone;
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightNode?: ReactNode;
  showArrow?: boolean;
  danger?: boolean;
  onPress?: () => void;
};

type SettingsGroupProps = {
  title: string;
  rows: SettingsRow[];
};

export function SettingsGroup({ title, rows }: SettingsGroupProps) {
  const theme = useAppColorScheme();
  const cardBg = theme === 'light' ? '#F8FAFB' : '#0C111E';
  const cardBorder = theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.10)';
  const borderDivider = theme === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.06)';
  const iconToneStyle: Record<IconTone, { bg: string; color: string }> = {
    default: {
      bg: theme === 'light' ? '#E8EEF7' : 'rgba(255,255,255,0.05)',
      color: theme === 'light' ? '#64748B' : 'rgba(255,255,255,0.70)',
    },
    ok: {
      bg: theme === 'light' ? 'rgba(34,183,108,0.16)' : 'rgba(34,183,108,0.14)',
      color: theme === 'light' ? '#168B53' : '#86E5B4',
    },
    gold: {
      bg: theme === 'light' ? 'rgba(212,161,58,0.18)' : 'rgba(212,161,58,0.14)',
      color: theme === 'light' ? '#9A7125' : '#F6D27A',
    },
    bad: {
      bg: theme === 'light' ? 'rgba(232,76,55,0.16)' : 'rgba(232,76,55,0.14)',
      color: theme === 'light' ? '#CF5544' : '#FF8B7A',
    },
    sky: {
      bg: theme === 'light' ? 'rgba(90,177,255,0.16)' : 'rgba(90,177,255,0.14)',
      color: theme === 'light' ? '#3A88DA' : '#7AC0FF',
    },
  };

  return (
    <View>
      <Text
        variant="micro"
        className="px-[22px] pt-[18px] pb-[6px] uppercase tracking-[2.2px] font-extrabold"
        style={{ color: theme === 'light' ? '#9CA3AF' : 'rgba(255,255,255,0.28)' }}
      >
        {title}
      </Text>

      <View
        style={{
          marginHorizontal: 18,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: cardBorder,
          backgroundColor: cardBg,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, index) => {
          const tone = iconToneStyle[row.iconTone ?? 'default'];

          return (
            <Pressable
              key={row.id}
              onPress={row.onPress}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: index < rows.length - 1 ? 1 : 0,
                borderBottomColor: borderDivider,
              }}
            >
              <View className="h-[34px] w-[34px] rounded-[10px] items-center justify-center" style={{ backgroundColor: tone.bg }}>
                {isValidElement(row.icon)
                  ? cloneElement(row.icon as ReactElement<{ color?: string }>, { color: tone.color })
                  : row.icon}
              </View>

              <View className="flex-1">
                <Text
                  variant="label"
                  className="font-medium"
                  style={{
                    color: row.danger
                      ? '#FF8B7A'
                      : theme === 'light'
                        ? '#1F2937'
                        : '#FFFFFF',
                  }}
                >
                  {row.title}
                </Text>
                {row.subtitle ? (
                  <Text
                    variant="micro"
                    style={{
                      color: theme === 'light' ? '#6B7280' : 'rgba(255,255,255,0.45)',
                      marginTop: 1,
                    }}
                  >
                    {row.subtitle}
                  </Text>
                ) : null}
              </View>

              {row.rightLabel ? (
                <Text
                  variant="caption"
                  style={{
                    color:
                      theme === 'light'
                        ? 'rgba(0,0,0,0.5)'
                        : 'rgba(255,255,255,0.45)',
                    marginRight: 4,
                  }}
                >
                  {row.rightLabel}
                </Text>
              ) : null}

              {row.rightNode ? row.rightNode : null}

              {row.showArrow ? (
                <ChevronRight
                  size={14}
                  color={
                    theme === 'light'
                      ? 'rgba(0,0,0,0.3)'
                      : 'rgba(255,255,255,0.28)'
                  }
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
