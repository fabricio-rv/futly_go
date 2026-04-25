import { View } from 'react-native';

import { Text } from '@/src/components/ui';

type HubMatchesSwitchProps = {
  active: 'find' | 'new' | 'agenda';
};

export function HubMatchesSwitch({ active }: HubMatchesSwitchProps) {
  const label = active === 'find' ? 'Achar Jogo' : active === 'new' ? 'Novo Jogo' : 'Agenda';
  return (
    <View className="items-center mb-3">
      <View className="px-4 py-2 rounded-pill border border-ink-hairline bg-ink-2">
        <Text variant="caption">{label}</Text>
      </View>
    </View>
  );
}
