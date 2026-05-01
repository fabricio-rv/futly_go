import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { COURTS_DATA, type Court } from '@/src/data/quadras';
import { supabase } from '@/src/lib/supabase';

const STORAGE_KEY = 'futly:user_added_courts:v1';

let memoryCache: Court[] | null = null;
const listeners = new Set<(courts: Court[]) => void>();

const db = supabase as any;

type CourtRow = {
  id: string;
  legacy_id: string | null;
  name: string;
  location_preview: string;
  address: string;
  phone: string;
  state: string | null;
  city: string | null;
  cep: string | null;
  rating: number;
  review_count: number;
  amenities: string[] | null;
  working_hours: Record<string, string> | null;
};

function emit(courts: Court[]) {
  memoryCache = courts;
  listeners.forEach((listener) => listener(courts));
}

function normalizeCourt(court: Court): Court {
  return {
    ...court,
    amenities: Array.isArray(court.amenities) ? court.amenities : [],
    working_hours:
      court.working_hours && typeof court.working_hours === 'object'
        ? court.working_hours
        : {},
  };
}

function mapCourtRowToCourt(row: CourtRow): Court {
  return normalizeCourt({
    id: row.legacy_id || row.id,
    name: row.name,
    location_preview: row.location_preview,
    address: row.address,
    phone: row.phone,
    state: row.state ?? undefined,
    city: row.city ?? undefined,
    cep: row.cep ?? undefined,
    rating: Number(row.rating ?? 0),
    review_count: Number(row.review_count ?? 0),
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    working_hours:
      row.working_hours && typeof row.working_hours === 'object'
        ? row.working_hours
        : {},
  });
}

function mergeUniqueCourts(...lists: Court[][]): Court[] {
  const map = new Map<string, Court>();
  lists.flat().forEach((court) => {
    const normalized = normalizeCourt(court);
    if (!map.has(normalized.id)) {
      map.set(normalized.id, normalized);
    }
  });
  return Array.from(map.values());
}

function extractStateFromLocation(locationPreview: string): string {
  const parts = locationPreview.split(',').map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

function extractCityFromLocation(locationPreview: string): string {
  const parts = locationPreview.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[0];
  return parts[0] ?? '';
}

async function loadFromStorage(): Promise<Court[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Court[]).map(normalizeCourt);
  } catch {
    return [];
  }
}

async function persist(courts: Court[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courts));
  } catch {}
}

async function fetchCourtsFromDatabase(): Promise<Court[]> {
  try {
    const { data, error } = await db
      .from('courts')
      .select('id, legacy_id, name, location_preview, address, phone, state, city, cep, rating, review_count, amenities, working_hours')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return [];

    return data.map((row: CourtRow) => mapCourtRowToCourt(row));
  } catch {
    return [];
  }
}

export function useUserCourts() {
  const [courts, setCourts] = useState<Court[]>(memoryCache ?? []);
  const [loaded, setLoaded] = useState(memoryCache !== null);

  useEffect(() => {
    let mounted = true;

    if (memoryCache === null) {
      void (async () => {
        const [stored, dbCourts] = await Promise.all([
          loadFromStorage(),
          fetchCourtsFromDatabase(),
        ]);

        if (!mounted) return;

        const merged = mergeUniqueCourts(dbCourts, stored);
        memoryCache = merged;
        setCourts(merged);
        setLoaded(true);
      })();
    }

    const listener = (next: Court[]) => {
      if (mounted) setCourts(next);
    };
    listeners.add(listener);

    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, []);

  const addCourt = useCallback(async (court: Court) => {
    const normalizedCourt = normalizeCourt(court);
    const current = memoryCache ?? (await loadFromStorage());

    const existsInBase = COURTS_DATA.some((c) => c.id === normalizedCourt.id);
    const existsInUser = current.some((c) => c.id === normalizedCourt.id);

    let nextId = normalizedCourt.id;
    if (existsInBase || existsInUser) {
      nextId = `${normalizedCourt.id}-${Date.now()}`;
    }

    const withSafeId = { ...normalizedCourt, id: nextId };

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) throw new Error('Usuario nao autenticado');

      const payload = {
        created_by: userId,
        legacy_id: withSafeId.id,
        name: withSafeId.name,
        location_preview: withSafeId.location_preview,
        address: withSafeId.address,
        phone: withSafeId.phone,
        state: withSafeId.state?.trim() || extractStateFromLocation(withSafeId.location_preview) || 'NA',
        city: withSafeId.city?.trim() || extractCityFromLocation(withSafeId.location_preview) || 'Nao informado',
        cep: withSafeId.cep?.trim() || '00000-000',
        rating: withSafeId.rating ?? 0,
        review_count: withSafeId.review_count ?? 0,
        amenities: withSafeId.amenities,
        working_hours: withSafeId.working_hours,
      };

      const { data, error } = await db
        .from('courts')
        .insert(payload)
        .select('id, legacy_id, name, location_preview, address, phone, state, city, cep, rating, review_count, amenities, working_hours')
        .single();

      if (error) throw error;

      const insertedCourt = mapCourtRowToCourt(data as CourtRow);
      const next = mergeUniqueCourts([insertedCourt], current);
      emit(next);
      await persist(next);
      return insertedCourt.id;
    } catch {
      const fallback = withSafeId;
      const next = mergeUniqueCourts(current, [fallback]);
      emit(next);
      await persist(next);
      return fallback.id;
    }
  }, []);

  return { userCourts: courts, addCourt, loaded };
}

export function getAllCourts(userCourts: Court[]): Court[] {
  return [...userCourts, ...COURTS_DATA];
}
