import { Pressable, View } from 'react-native';

type ToggleSwitchProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function ToggleSwitch({ value, onValueChange, disabled, className }: ToggleSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      className={`h-7 w-[46px] rounded-full px-[2px] items-start justify-center ${
        value ? 'bg-ok' : 'bg-gray-300 dark:bg-[#1B2236]'
      } ${disabled ? 'opacity-45' : ''} ${className ?? ''}`.trim()}
    >
      <View
        className={`h-6 w-6 rounded-full bg-[#FAFBFC] dark:bg-[#FAFBFC] ${value ? 'translate-x-[18px]' : 'translate-x-0'}`}
      />
    </Pressable>
  );
}
