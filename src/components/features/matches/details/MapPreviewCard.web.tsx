import React from 'react';
import { View, Text, Linking, Pressable } from 'react-native';
import { MapPin } from 'lucide-react-native';

type MapPreviewCardProps = {
  addressLine: string;
  districtLine: string;
  onRoutePress?: () => void;
  showAddressFooter?: boolean;
};

export default function MapPreviewCard({
  addressLine,
  districtLine,
  onRoutePress,
  showAddressFooter = true,
}: MapPreviewCardProps) {
  
  const openInGoogleMaps = () => {
    // Abre o Google Maps com o endereço formatado
    const fullAddress = `${addressLine}, ${districtLine}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url);
  };

  return (
    <View className="my-2">
      {/* Área do "Mapa" (Simulação visual na Web) */}
      <Pressable 
        onPress={openInGoogleMaps}
        className="h-56 bg-zinc-900 rounded-[18px] border border-zinc-800 items-center justify-center overflow-hidden"
      >
        <View className="items-center">
           <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center mb-2">
              <MapPin size={24} color="#22B76C" />
           </View>
           <Text className="text-zinc-400 font-medium">Ver localização no Google Maps</Text>
        </View>
      </Pressable>

      {/* Rodapé de Endereço (Igual ao Nativo) */}
      {showAddressFooter && (
        <View className="bg-zinc-900/50 border border-zinc-800 rounded-[16px] p-3 mt-3 flex-row items-center">
          <View className="w-9 h-9 bg-green-500/10 rounded-[10px] items-center justify-center">
            <MapPin size={14} color="#22B76C" />
          </View>
          
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold text-[14px]">{addressLine}</Text>
            <Text className="text-zinc-500 text-[12px]">{districtLine}</Text>
          </View>

          <Pressable
            onPress={onRoutePress || openInGoogleMaps}
            className="h-10 border border-zinc-700 px-4 rounded-[10px] items-center justify-center"
          >
            <Text className="text-white font-bold">Rota</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}