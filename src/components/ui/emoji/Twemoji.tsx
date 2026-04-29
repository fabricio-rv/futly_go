import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { getTwemojiUrl } from '@/src/lib/emoji/twemoji';

type TwemojiProps = {
  emoji: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Twemoji({ emoji, size = 22, style }: TwemojiProps) {
  return (
    <Image
      source={{ uri: getTwemojiUrl(emoji) }}
      accessibilityLabel={emoji}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
