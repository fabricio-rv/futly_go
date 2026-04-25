import { Text, View } from 'react-native';

type HubHeaderProps = {
  badgeLabel?: string;
};

export function HubHeader({ badgeLabel }: HubHeaderProps) {
  return (
    <View className="px-4 pb-2 pt-2">
      <View className="relative min-h-[44px] justify-center">
        <View className="absolute left-0 right-0 items-center">
          <Text className="font-geistBold text-[15px] text-white">Hub de Partidas</Text>
          <Text className="text-[10px] font-geistBold uppercase tracking-[2px] text-fg3">Quinta - Porto Alegre</Text>
        </View>
        {badgeLabel ? (
          <View className="ml-auto rounded-full border border-[#0D8C58] bg-[#0D8C5824] px-3 py-1.5">
            <Text className="font-geistBold text-[10px] tracking-[0.5px] text-[#86E5B4]">{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
