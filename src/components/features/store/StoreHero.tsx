import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

export function StoreHero() {
  const theme = useAppColorScheme();
  const { t } = useTranslation('store');
  const isLight = theme === 'light';
  const { width } = useWindowDimensions();
  const isSmall = width < 520;

  const proStyle = useMemo(
    () => ({
      fontSize: isSmall ? 44 : 74,
      lineHeight: isSmall ? 44 : 74,
      right: isSmall ? 14 : 16,
      top: isSmall ? 12 : 8,
    }),
    [isSmall],
  );

  return (
    <View className={`mx-[18px] mb-[14px] rounded-[20px] border border-[#D4A13A47] overflow-hidden ${isLight ? 'bg-[#FFFBF0]' : 'bg-[#0A0703]'} px-[18px] py-[18px]`}>
      <Text variant="micro" className="uppercase tracking-[2.5px] font-extrabold text-goldA mb-1">
        {t('hero.kicker', 'Hub de Partidas - Pro')}
      </Text>
      <Text
        variant="heading"
        className={`font-extrabold tracking-[-0.5px] ${isLight ? 'text-[#111827]' : 'text-white'}`}
        style={{ paddingRight: isSmall ? 100 : 190 }}
      >
        {t('hero.title', 'Mais partidas. Mais visibilidade. Mais futebol.')}
      </Text>
      <Text
        variant="caption"
        className={`mt-2.5 leading-[18px] ${isLight ? 'text-[#4B5563]' : 'text-fg2'}`}
        style={{ maxWidth: isSmall ? 240 : 260 }}
      >
        {t('hero.description', 'Desbloqueie raio de busca ampliado, criacao ilimitada de partidas e prioridade nas vagas concorridas.')}
      </Text>
      <Text className="absolute font-bebas text-[#D4A13A2E]" style={proStyle}>
        PRO
      </Text>
    </View>
  );
}
