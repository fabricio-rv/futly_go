import emojiData from '@emoji-mart/data/sets/15/twitter.json';
import twemoji from 'twemoji';

import type { EmojiMartData } from '@emoji-mart/data';

export type TwemojiCategory = {
  id: string;
  label: string;
  emojis: string[];
};

const data = emojiData as EmojiMartData;
const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

const CATEGORY_LABELS: Record<string, string> = {
  people: 'Smileys',
  nature: 'Animais',
  foods: 'Comidas',
  activity: 'Esportes',
  places: 'Lugares',
  objects: 'Objetos',
  symbols: 'Símbolos',
  flags: 'Bandeiras',
};

function stripEmojiVariation(value: string) {
  return value.replace(/\uFE0F/g, '');
}

const allNativeEmojis = Object.values(data.emojis)
  .flatMap((emoji) => emoji.skins.map((skin) => skin.native))
  .filter(Boolean);

export const TWEMOJI_EMOJI_SET = new Set(allNativeEmojis);
export const TWEMOJI_MATCH_LIST = Array.from(TWEMOJI_EMOJI_SET).sort((a, b) => b.length - a.length);
const TWEMOJI_MATCHES_BY_FIRST_CHAR = TWEMOJI_MATCH_LIST.reduce<Record<string, string[]>>((acc, emoji) => {
  const firstChar = emoji[0];
  acc[firstChar] ??= [];
  acc[firstChar].push(emoji);
  return acc;
}, {});

export const TWEMOJI_CATEGORIES: TwemojiCategory[] = data.categories
  .map((category) => ({
    id: category.id,
    label: CATEGORY_LABELS[category.id] ?? category.id,
    emojis: category.emojis
      .flatMap((emojiId) => data.emojis[emojiId]?.skins.map((skin) => skin.native) ?? [])
      .filter(Boolean),
  }))
  .filter((category) => category.emojis.length > 0);

export const DEFAULT_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function getTwemojiUrl(emoji: string) {
  const codePoint = twemoji.convert.toCodePoint(stripEmojiVariation(emoji));
  return `${TWEMOJI_BASE}/${codePoint}.png`;
}

export function isTwemojiEmoji(value: string) {
  return TWEMOJI_EMOJI_SET.has(value) || TWEMOJI_EMOJI_SET.has(stripEmojiVariation(value));
}

export type TwemojiToken =
  | { type: 'emoji'; value: string }
  | { type: 'text'; value: string };

export function tokenizeTwemojiText(text: string): TwemojiToken[] {
  const tokens: TwemojiToken[] = [];
  let index = 0;

  while (index < text.length) {
    const emoji = TWEMOJI_MATCHES_BY_FIRST_CHAR[text[index]]?.find((candidate) => text.startsWith(candidate, index));

    if (emoji) {
      tokens.push({ type: 'emoji', value: emoji });
      index += emoji.length;
      continue;
    }

    const last = tokens[tokens.length - 1];
    const char = text[index];
    if (last?.type === 'text') {
      last.value += char;
    } else {
      tokens.push({ type: 'text', value: char });
    }
    index += char.length;
  }

  return tokens;
}
