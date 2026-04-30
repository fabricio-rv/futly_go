import type { ReactNode } from 'react';
import { Bell, CalendarDays, Plus, Search, UserRound } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import {
  fetchUnreadNotificationsCount,
  subscribeNotifications,
} from '@/src/features/notifications/services/notificationsService';
import { selectionTick } from '@/src/lib/haptics';
import { TouchableScale } from '@/src/components/ui/TouchableScale';

type BottomNavProps = {
  active: 'buscar' | 'agenda' | 'new' | 'notifications' | 'profile' | 'none';
  compactBottomInset?: boolean;
};

function NavItem({
  active,
  icon,
  onPress,
}: {
  active?: boolean;
  icon: ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableScale
      className="flex-1 items-center justify-center"
      onPress={onPress}
      hitSlop={10}
      pressedScale={0.95}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          active ? 'bg-[#22B76C1F]' : 'bg-transparent'
        }`}
      >
        {icon}
      </View>
    </TouchableScale>
  );
}

export function MatchBottomNav({ active, compactBottomInset = false }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppColorScheme();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const iconMuted = theme === 'light' ? '#7A8597' : 'rgba(255,255,255,0.45)';
  const barBg = theme === 'light' ? 'rgba(245,248,252,0.96)' : 'rgba(10,14,24,0.95)';
  const barBorder = theme === 'light' ? '#D6DFEB' : 'rgba(255,255,255,0.10)';
  const plusBg = theme === 'light' ? '#E6EDF7' : '#1A2338';
  const plusBorder = theme === 'light' ? '#C3D0E0' : '#2A3650';

  useEffect(() => {
    let isMounted = true;

    const loadUnread = async () => {
      try {
        const count = await fetchUnreadNotificationsCount();
        if (isMounted) {
          setUnreadNotifications(count);
        }
      } catch {
        if (isMounted) {
          setUnreadNotifications(0);
        }
      }
    };

    void loadUnread();
    const unsubscribe = subscribeNotifications(() => {
      void loadUnread();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t px-2"
      style={{
        height: compactBottomInset ? 72 : 72 + insets.bottom,
        paddingBottom: compactBottomInset ? 8 : Math.max(insets.bottom, 8),
        paddingTop: 6,
        backgroundColor: barBg,
        borderTopColor: barBorder,
      }}
    >
      <View className="flex-row items-center">
        <NavItem
          active={active === 'buscar'}
          icon={<Search color={active === 'buscar' ? '#22B76C' : iconMuted} size={21} />}
          onPress={() => {
            void selectionTick();
            router.replace('/(app)');
          }}
        />
        <NavItem
          active={active === 'agenda'}
          icon={<CalendarDays color={active === 'agenda' ? '#22B76C' : iconMuted} size={21} />}
          onPress={() => {
            void selectionTick();
            router.replace('/(app)/agenda');
          }}
        />
        <TouchableScale
          className="flex-1 items-center justify-center"
          onPress={() => {
            void selectionTick();
            router.push('/(app)/create');
          }}
          hitSlop={10}
          pressedScale={0.95}
        >
          <View
            className={`h-14 w-14 items-center justify-center rounded-full border ${active === 'new' ? 'bg-ok border-[#9BF0C5]' : ''}`}
            style={{ borderWidth: 1, backgroundColor: active === 'new' ? '#22B76C' : plusBg, borderColor: active === 'new' ? '#9BF0C5' : plusBorder }}
          >
            <Plus size={30} color={active === 'new' ? '#05070B' : 'rgba(34,183,108,0.45)'} strokeWidth={2.6} />
          </View>
        </TouchableScale>
        <NavItem
          active={active === 'notifications'}
          icon={(
            <View className="relative">
              <Bell color={active === 'notifications' ? '#22B76C' : iconMuted} size={20} />
              {unreadNotifications > 0 ? (
                <View className="absolute -right-2 -top-2 min-w-[17px] h-[17px] rounded-full bg-[#22B76C] items-center justify-center px-1">
                  <Text className="text-[10px] font-bold text-[#05070B]">
                    {unreadNotifications > 99 ? '99+' : String(unreadNotifications)}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
          onPress={() => {
            void selectionTick();
            router.replace('/(app)/notifications');
          }}
        />
        <NavItem
          active={active === 'profile'}
          icon={<UserRound color={active === 'profile' ? '#22B76C' : iconMuted} size={21} />}
          onPress={() => {
            void selectionTick();
            router.replace('/(app)/profile');
          }}
        />
      </View>
    </View>
  );
}
