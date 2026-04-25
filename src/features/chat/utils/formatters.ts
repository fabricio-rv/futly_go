const PT_SHORT_WEEKDAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

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

export function formatWeekdayTime(matchDate: string | null, matchTime: string | null) {
  if (!matchDate || !matchTime) return '';

  const date = new Date(`${matchDate}T${matchTime}`);
  if (Number.isNaN(date.getTime())) return '';

  const dayName = PT_SHORT_WEEKDAY[date.getDay()] ?? '';
  return `${dayName} ${pad2(date.getHours())}h${pad2(date.getMinutes())}`;
}

export function formatRelativeChatTime(isoDate: string | null | undefined) {
  if (!isoDate) return '';

  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - target.getTime();

  if (diffMs < 60_000) return 'agora';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `ha ${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'ha 1 sem';

  return `ha ${weeks} sem`;
}
