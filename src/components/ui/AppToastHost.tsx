import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react-native';

import { Text } from '@/src/components/ui/Text';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export type AppToastTone = 'success' | 'error' | 'warning' | 'info';

export type AppToastAction = {
  label: string;
  onPress: () => void;
};

export type AppToastItem = {
  id: string;
  tone: AppToastTone;
  title: string;
  description?: string;
  action?: AppToastAction;
  durationMs: number;
};

type AppToastHostProps = {
  toast: AppToastItem | null;
  onDismiss: (id: string) => void;
};

const toneStyles: Record<AppToastTone, { border: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  success: { border: '#22B76C99', bg: '#062217', text: '#86E5B4', icon: CheckCircle2 },
  error: { border: '#FF5D7D88', bg: '#2A0E17', text: '#FF8AA2', icon: AlertCircle },
  warning: { border: '#EAB30888', bg: '#2A2207', text: '#FCD34D', icon: TriangleAlert },
  info: { border: '#60A5FA88', bg: '#0B1D36', text: '#93C5FD', icon: Info },
};

export function AppToastHost({ toast, onDismiss }: AppToastHostProps) {
  const { t } = useTranslation('common');
  const translateX = useRef(new Animated.Value(240)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toastStyle = useMemo(() => {
    if (!toast) return null;
    return toneStyles[toast.tone];
  }, [toast]);

  useEffect(() => {
    if (!toast) return undefined;

    translateX.setValue(240);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 85,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onDismiss, opacity, toast, translateX]);

  if (!toast || !toastStyle) return null;
  const Icon = toastStyle.icon;

  return (
    <View pointerEvents="box-none" className="absolute right-4 top-14 z-[1000] w-[92%] max-w-[360px]">
      <Animated.View
        style={{
          opacity,
          transform: [{ translateX }],
        }}
      >
        <View
          className="rounded-2xl border px-3 py-3"
          style={{
            borderColor: toastStyle.border,
            backgroundColor: toastStyle.bg,
          }}
        >
          <View className="flex-row items-start gap-2">
            <Icon size={18} color={toastStyle.text} />
            <View className="flex-1">
              <Text variant="caption" className="font-semibold" style={{ color: '#F8FAFC' }}>
                {toast.title}
              </Text>
              {toast.description ? (
                <Text variant="micro" className="mt-0.5" style={{ color: '#CBD5E1' }}>
                  {toast.description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => onDismiss(toast.id)}
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              accessibilityRole="button"
              accessibilityLabel={t('actions.close', 'Fechar')}
            >
              <X size={14} color="#E2E8F0" />
            </Pressable>
          </View>

          {toast.action ? (
            <Pressable
              onPress={() => {
                toast.action?.onPress();
                onDismiss(toast.id);
              }}
              className="mt-2 self-start rounded-lg px-2.5 py-1.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
            >
              <Text variant="micro" className="font-semibold" style={{ color: '#F8FAFC' }}>
                {toast.action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}
