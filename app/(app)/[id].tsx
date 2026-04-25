import { useLocalSearchParams } from 'expo-router';

import { MatchDetailScreen } from '@/src/features/matches/MatchDetailScreen';

export default function MatchDetailsRouteScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const matchId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!matchId) return null;

  return <MatchDetailScreen matchId={matchId} />;
}
