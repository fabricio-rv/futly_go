import { useLocalSearchParams } from 'expo-router';

import { CourtDetailsScreen } from '@/src/features/courts/CourtDetailsScreen';

export default function CourtDetailsRouteScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const courtId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!courtId) return null;

  return <CourtDetailsScreen courtId={courtId} />;
}
