import type { ReactNode } from 'react';
import { CalendarDays, Plus, Search, Store, UserRound } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomNavProps = {
  active: 'buscar' | 'agenda' | 'new' | 'none';
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
    <Pressable
      className="flex-1 items-center justify-center"
      onPress={onPress}
      hitSlop={10}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          active ? 'bg-[#22B76C1F]' : 'bg-transparent'
        }`}
      >
        {icon}
      </View>
    </Pressable>
  );
}

export function MatchBottomNav({ active }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-line bg-surf1/95 px-2"
      style={{
        height: 72 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 6,
      }}
    >
      <View className="flex-row items-center">
        <NavItem
          active={active === 'buscar'}
          icon={<Search color={active === 'buscar' ? '#22B76C' : 'rgba(255,255,255,0.45)'} size={21} />}
          onPress={() => router.replace('/(app)')}
        />
        <NavItem
          active={active === 'agenda'}
          icon={<CalendarDays color={active === 'agenda' ? '#22B76C' : 'rgba(255,255,255,0.45)'} size={21} />}
          onPress={() => router.replace('/(app)/agenda')}
        />
        <Pressable
          className="-mt-1 flex-1 items-center justify-center"
          onPress={() => router.push('/(app)/create')}
          hitSlop={10}
        >
          <View
            className={`h-14 w-14 items-center justify-center rounded-full border ${
              active === 'new'
                ? 'bg-ok border-[#9BF0C5]'
                : 'bg-[#1A2338] border-[#2A3650]'
            }`}
            style={{ borderWidth: 1 }}
          >
            <Plus size={30} color="#05070B" strokeWidth={2.6} />
          </View>
        </Pressable>
        <NavItem icon={<Store color="rgba(255,255,255,0.45)" size={21} />} />
        <NavItem icon={<UserRound color="rgba(255,255,255,0.45)" size={21} />} />
      </View>
    </View>
  );
}

