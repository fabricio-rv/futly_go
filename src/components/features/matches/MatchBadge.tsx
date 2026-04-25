import type { MatchLevel, MatchStatus } from '../../../features/matches/types';
import { Text, View } from 'react-native';

type MatchStatusBadgeProps = {
  status: MatchStatus;
};

type MatchLevelBadgeProps = {
  level: MatchLevel;
};

const statusStyles: Record<MatchStatus, string> = {
  open: 'bg-[#22B76C29] border-[#22B76C59] text-[#86E5B4]',
  confirmed: 'bg-[#22B76C29] border-[#22B76C59] text-[#86E5B4]',
  full: 'bg-white/10 border-white/15 text-fg2',
  host: 'bg-[#F6D27A] border-[#D4A13A] text-[#2A1A05]',
};

const statusLabel: Record<MatchStatus, string> = {
  open: 'VAGAS ABERTAS',
  confirmed: 'CONFIRMADO',
  full: 'LOTADA',
  host: 'HOST',
};

const levelStyles: Record<MatchLevel, string> = {
  'NIVEL OURO': 'bg-[#F6D27A] border-[#D4A13A] text-[#2A1A05]',
  'INTERMED.': 'bg-[#5AB1FF24] border-[#5AB1FF59] text-[#7AC0FF]',
  'PRATA 70+': 'bg-white/10 border-white/15 text-fg2',
  'ELITE 85+': 'bg-[#F6D27A] border-[#D4A13A] text-[#2A1A05]',
};

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  return (
    <View className={`rounded-lg border px-2.5 py-1 ${statusStyles[status]}`}>
      <Text className="text-[10px] font-geistBold tracking-[1px]">{statusLabel[status]}</Text>
    </View>
  );
}

export function MatchLevelBadge({ level }: MatchLevelBadgeProps) {
  return (
    <View className={`rounded-lg border px-2.5 py-1 ${levelStyles[level]}`}>
      <Text className="text-[10px] font-geistBold tracking-[1px]">{level}</Text>
    </View>
  );
}

export function Pill({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View
      className={`h-8 flex-row items-center rounded-full border px-3 ${
        active
          ? 'border-[#22B76C59] bg-[#22B76C24]'
          : 'border-line2 bg-input'
      }`}
    >
      <Text className={`text-xs font-geist ${active ? 'text-[#86E5B4]' : 'text-fg2'}`}>{label}</Text>
    </View>
  );
}

