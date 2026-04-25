import { Text, View } from 'react-native';

export function InteractivePitchPlaceholder({ compact }: { compact?: boolean }) {
  return (
    <View
      className={`items-center justify-center rounded-[18px] border border-dashed border-[#22B76C66] bg-[#0B2216] ${compact ? 'h-36' : 'h-52'}`}
    >
      <Text className="font-geistBold text-sm tracking-[0.8px] text-[#86E5B4]">CAMPINHO INTERATIVO</Text>
      <Text className="mt-1 px-5 text-center text-xs text-fg3">
        Placeholder pronto para conectar com o modulo do Futly Pro.
      </Text>
    </View>
  );
}

