import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type LoadingInlineProps = {
  label?: string | null;
  compact?: boolean;
};

export function LoadingInline({ label, compact = false }: LoadingInlineProps) {
  const { t } = useTranslation('common');
  return (
    <View
      className={`w-full items-center justify-center ${compact ? 'py-2' : 'py-5'}`}
      accessibilityRole="progressbar"
      accessibilityLabel={label || t('actions.loading', 'Carregando...')}
    >
      <ActivityIndicator size={compact ? 'small' : 'large'} color="#22B76C" />
      {label ? (
        <Text variant="micro" className="mt-2" style={{ color: 'rgba(226,232,240,0.88)' }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
