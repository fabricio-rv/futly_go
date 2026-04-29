import { memo, useMemo } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Text } from '@/src/components/ui';
import { tokenizeTwemojiText } from '@/src/lib/emoji/twemoji';
import { Twemoji } from './Twemoji';

type TwemojiRichTextProps = {
  text: string;
  color: string;
  fontSize?: number;
  lineHeight?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function TwemojiRichTextComponent({
  text,
  color,
  fontSize = 14,
  lineHeight = 18,
  style,
  textStyle,
}: TwemojiRichTextProps) {
  const tokens = useMemo(() => tokenizeTwemojiText(text), [text]);
  const emojiSize = Math.max(18, Math.round(fontSize * 1.35));

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }, style]}>
      {tokens.map((token, index) => (
        token.type === 'emoji' ? (
          <Twemoji
            key={`${token.value}-${index}`}
            emoji={token.value}
            size={emojiSize}
            style={{ marginHorizontal: 1, marginVertical: 1 }}
          />
        ) : (
          <Text
            key={`text-${index}`}
            variant="caption"
            style={[{ color, fontSize, lineHeight }, textStyle]}
          >
            {token.value}
          </Text>
        )
      ))}
    </View>
  );
}

export const TwemojiRichText = memo(TwemojiRichTextComponent);
