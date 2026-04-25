import { Activity, Bookmark, ChevronLeft, Search, User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';

export type SidebarTab = 'matches' | 'search' | 'favourites' | 'profile';

type Props = {
  visible: boolean;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onClose: () => void;
  onBack?: () => void;
  showBackItem?: boolean;
};

const ITEMS: { id: SidebarTab; label: string; Icon: React.ElementType }[] = [
  { id: 'matches', label: 'Partidas', Icon: Activity },
  { id: 'search', label: 'Pesquisar', Icon: Search },
  { id: 'favourites', label: 'Favoritos', Icon: Bookmark },
  { id: 'profile', label: 'Perfil', Icon: User },
];

export function Sidebar({
  visible,
  activeTab,
  onSelectTab,
  onClose,
  onBack,
  showBackItem = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-260)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 140, friction: 18 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -260, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.55)' }]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 12,
          bottom: insets.bottom + 12,
          width: 240,
          backgroundColor: '#0E1420',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.07)',
          paddingTop: 20,
          paddingBottom: 16,
          transform: [{ translateX }],
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 24,
          shadowOffset: { width: 4, height: 0 },
          elevation: 20,
        }}
      >
        <View style={{ paddingHorizontal: 18, marginBottom: 20 }}>
          <Text
            variant="eyebrow"
            tone="muted"
            style={{ letterSpacing: 2, marginBottom: 2 } as any}
          >
            FUTLY PRO
          </Text>
          <Text
            variant="title"
            tone="primary"
            style={{ fontWeight: '800' } as any}
          >
            Estatísticas
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 18, marginBottom: 10 }} />

        {ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <Pressable
              key={id}
              onPress={() => {
                onSelectTab(id);
                onClose();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 16,
                marginBottom: 2,
                backgroundColor: active ? 'rgba(34,197,78,0.09)' : 'transparent',
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  backgroundColor: active ? '#22C54D' : 'rgba(255,255,255,0.04)',
                }}
              >
                <Icon
                  color={active ? '#05070B' : '#5A6478'}
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </View>
              <Text
                variant="body"
                style={{
                  color: active ? '#F5F7FA' : '#7A8699',
                  fontWeight: active ? '700' : '400',
                  flex: 1,
                } as any}
              >
                {label}
              </Text>
              {active ? (
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22C54D' }} />
              ) : null}
            </Pressable>
          );
        })}

        {showBackItem ? (
          <Pressable
            onPress={() => {
              onClose();
              onBack?.();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10,
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 16,
              marginBottom: 2,
              backgroundColor: 'transparent',
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <ChevronLeft color="#5A6478" size={18} strokeWidth={1.8} />
            </View>
            <Text
              variant="body"
              style={{
                color: '#7A8699',
                fontWeight: '400',
                flex: 1,
              } as any}
            >
              Voltar
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </Modal>
  );
}
