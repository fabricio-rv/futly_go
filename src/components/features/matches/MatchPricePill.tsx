import { Text, View } from 'react-native';

type MatchPricePillProps = {
  price: number;
};

export function MatchPricePill({ price }: MatchPricePillProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
        backgroundColor: 'rgba(5,7,11,0.50)',
        marginBottom: 2,
      }}
    >
      <Text
        style={{
          fontFamily: 'Geist_400Regular',
          fontSize: 12,
          lineHeight: 12,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'none',
          letterSpacing: 0,
        }}
      >
        R$
      </Text>

      <Text
        style={{
          fontFamily: 'BebasNeue_400Regular',
          fontSize: 34,
          lineHeight: 29,
          color: '#F5F7FA',
          textTransform: 'none',
          letterSpacing: 0,
        }}
      >
        {price}
      </Text>

      <Text
        style={{
          fontFamily: 'Geist_400Regular',
          fontSize: 11,
          lineHeight: 11,
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'none',
          letterSpacing: 0,
        }}
      >
        /pessoa
      </Text>
    </View>
  );
}