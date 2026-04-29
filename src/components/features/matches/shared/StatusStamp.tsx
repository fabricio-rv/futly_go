import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/src/components/ui';
import type { MatchUiStatus } from '@/src/features/matches/types';

type StatusStampProps = {
  status: MatchUiStatus;
  label: string;
};

const stampByStatus: Record<MatchUiStatus, { bg: string; border: string; text: string }> = {
  open: { bg: 'rgba(34,183,108,0.16)', border: 'rgba(34,183,108,0.35)', text: '#86E5B4' },
  confirmed: { bg: 'rgba(34,183,108,0.16)', border: 'rgba(34,183,108,0.35)', text: '#86E5B4' },
  live: { bg: 'rgba(232,76,55,0.18)', border: 'rgba(232,76,55,0.35)', text: '#FF8B7A' },
  done: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.70)' },
  host: { bg: 'rgba(212,161,58,1)', border: 'rgba(212,161,58,1)', text: '#2A1A05' },
};

export function StatusStamp({ status, label }: StatusStampProps) {
  if (status === 'host') {
    return (
      <LinearGradient
        colors={['#F6D27A', '#D4A13A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 28, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: '#D4A13A', flexDirection: 'row', alignItems: 'center' }}
      >
        <Text style={{ color: '#2A1A05', fontSize: 13, fontFamily: 'Geist_700Bold', fontWeight: '700' }}>
          {label}
        </Text>
      </LinearGradient>
    );
  }

  const token = stampByStatus[status];

  return (
    <View
      style={{ height: 32, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: token.bg, borderColor: token.border }}
    >
      {status === 'live' ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: token.text }} /> : null}
      <Text style={{ color: token.text, fontSize: 13, fontFamily: 'Geist_700Bold', fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}
