import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

type StepIndicatorProps = {
  total: number;
  current: number;
  solidCurrent?: boolean;
};

export function StepIndicator({ total, current, solidCurrent = false }: StepIndicatorProps) {
  return (
    <View className="px-[18px] pb-3 flex-row items-center gap-[6px]">
      {Array.from({ length: total }).map((_, index) => {
        const step = index + 1;
        if (step < current) {
          return <View key={step} className="flex-1 h-[3px] rounded-full bg-[#22B76C]" />;
        }

        if (step === current) {
          if (solidCurrent) {
            return <View key={step} className="flex-1 h-[3px] rounded-full bg-[#22B76C]" />;
          }

          return (
            <LinearGradient
              key={step}
              colors={['#22B76C', '#F6D27A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-1 h-[3px] rounded-full"
            />
          );
        }

        return <View key={step} className="flex-1 h-[3px] rounded-full bg-[#FAFBFC]/10" />;
      })}
    </View>
  );
}
