import React from 'react';
import { View, Text, Linking } from 'react-native';

// Esta versão será usada apenas no navegador/PWA
export default function MapPreviewCard({ address }: { address: string }) {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <View className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 my-2">
      <Text className="text-zinc-400 mb-2">📍 Localização da Quadra</Text>
      <Text className="text-white font-bold mb-3">{address}</Text>
      <View
        className="h-32 bg-zinc-800 rounded-lg items-center justify-center border border-dashed border-zinc-700"
        onTouchEnd={openInGoogleMaps}
      >
        <Text className="text-zinc-500">Clique para ver no Google Maps</Text>
      </View>
    </View>
  );
}
