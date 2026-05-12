import * as Location from "expo-location";

import { formatCep } from "@/src/features/location/cep";

export type DeviceLocationAddress = {
  state: string | null;
  city: string | null;
  district: string | null;
  cep: string | null;
};

export async function requestAndResolveDeviceLocation(): Promise<DeviceLocationAddress | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const [address] = await Location.reverseGeocodeAsync({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  if (!address) return null;

  return {
    state: address.region ?? null,
    city: address.city ?? address.subregion ?? null,
    district: address.district ?? null,
    cep: address.postalCode ? formatCep(address.postalCode) : null,
  };
}
