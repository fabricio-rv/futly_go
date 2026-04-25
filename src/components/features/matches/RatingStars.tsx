import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type RatingStarsProps = {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
};

export function RatingStars({ value, size = 14, onChange }: RatingStarsProps) {
  return (
    <View className="flex-row items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        const icon = <Star size={size} stroke={active ? '#D4A13A' : 'rgba(255,255,255,0.10)'} fill={active ? '#D4A13A' : 'rgba(255,255,255,0.10)'} strokeWidth={0} />;
        if (!onChange) return <View key={star}>{icon}</View>;
        return <Pressable key={star} onPress={() => onChange(star)}>{icon}</Pressable>;
      })}
    </View>
  );
}
