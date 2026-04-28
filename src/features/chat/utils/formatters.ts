import type { Locale } from '@/src/i18n/types';

const SHORT_WEEKDAY_BY_LOCALE: Record<Locale, string[]> = {
  'pt-BR': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
  'pt-PT': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
  'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'es-ES': ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
};

function normalizeLocale(locale?: string): Locale {
  if (locale === 'pt-PT' || locale === 'en-US' || locale === 'es-ES') return locale;
  return 'pt-BR';
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

export function toInitials(value: string | null | undefined) {
  const text = (value ?? '').trim();
  if (!text) return '??';

  const parts = text.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '??';
}

export function formatWeekdayTime(matchDate: string | null, matchTime: string | null, locale?: string) {
  if (!matchDate || !matchTime) return '';

  const date = new Date(`${matchDate}T${matchTime}`);
  if (Number.isNaN(date.getTime())) return '';

  const normalizedLocale = normalizeLocale(locale);
  const dayName = SHORT_WEEKDAY_BY_LOCALE[normalizedLocale][date.getDay()] ?? '';
  return `${dayName} ${pad2(date.getHours())}h${pad2(date.getMinutes())}`;
}

export function formatRelativeChatTime(isoDate: string | null | undefined, locale?: string) {
  if (!isoDate) return '';

  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  const normalizedLocale = normalizeLocale(locale);

  const tokensByLocale: Record<Locale, {
    now: string;
    minute: string;
    hour: string;
    yesterday: string;
    dayAgo: (days: number) => string;
    oneWeekAgo: string;
    weekAgo: (weeks: number) => string;
  }> = {
    'pt-BR': {
      now: 'agora',
      minute: 'min',
      hour: 'h',
      yesterday: 'ontem',
      dayAgo: (days) => `ha ${days}d`,
      oneWeekAgo: 'ha 1 sem',
      weekAgo: (weeks) => `ha ${weeks} sem`,
    },
    'pt-PT': {
      now: 'agora',
      minute: 'min',
      hour: 'h',
      yesterday: 'ontem',
      dayAgo: (days) => `ha ${days}d`,
      oneWeekAgo: 'ha 1 sem',
      weekAgo: (weeks) => `ha ${weeks} sem`,
    },
    'en-US': {
      now: 'now',
      minute: 'min',
      hour: 'h',
      yesterday: 'yesterday',
      dayAgo: (days) => `${days}d ago`,
      oneWeekAgo: '1w ago',
      weekAgo: (weeks) => `${weeks}w ago`,
    },
    'es-ES': {
      now: 'ahora',
      minute: 'min',
      hour: 'h',
      yesterday: 'ayer',
      dayAgo: (days) => `hace ${days}d`,
      oneWeekAgo: 'hace 1 sem',
      weekAgo: (weeks) => `hace ${weeks} sem`,
    },
  };

  const tokens = tokensByLocale[normalizedLocale];

  if (diffMs < 60_000) return tokens.now;

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}${tokens.minute}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${tokens.hour}`;

  const days = Math.floor(hours / 24);
  if (days === 1) return tokens.yesterday;
  if (days < 7) return tokens.dayAgo(days);

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return tokens.oneWeekAgo;

  return tokens.weekAgo(weeks);
}

export function formatLastSeenBrazil(isoDate: string | null | undefined, now = new Date()) {
  if (!isoDate) return '';

  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return '';

  const zone = 'America/Sao_Paulo';
  const dateFmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: zone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeFmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const todayKey = dateFmt.format(now);
  const targetKey = dateFmt.format(target);
  if (todayKey === targetKey) {
    return `hoje às ${timeFmt.format(target)}`;
  }

  return `${targetKey} às ${timeFmt.format(target)}`;
}

export function isOnlineByLastSeen(isoDate: string | null | undefined, now = Date.now(), windowMs = 90_000) {
  if (!isoDate) return false;
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return false;
  return now - target.getTime() <= windowMs;
}
