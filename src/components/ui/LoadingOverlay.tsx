import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string | null;
};

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { t } = useTranslation('common');
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1350,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    return () => {
      loop.stop();
      spin.setValue(0);
    };
  }, [spin, visible]);

  if (!visible) return null;

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message || t('actions.loading', 'Carregando...')}
      className="absolute inset-0 z-[999]"
      style={{
        backgroundColor: 'rgba(2,6,23,0.72)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: 92,
          height: 92,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(5,11,24,0.92)',
          borderWidth: 1,
          borderColor: 'rgba(34,183,108,0.35)',
          transform: [{ rotate }],
        }}
      >
        <Image
          source={require('../../../assets/icons/Icon-192.png')}
          style={{ width: 54, height: 54, borderRadius: 12 }}
          resizeMode="contain"
        />
      </Animated.View>

      {message ? (
        <Text
          variant="caption"
          className="mt-4 font-semibold"
          style={{ color: '#E2E8F0' }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
