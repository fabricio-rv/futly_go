import { themeColors, type Theme } from './themeColors';

/** Brand palette — fixed across themes */
export const chatBrand = {
  green: {
    primary: '#22B76C',   // online dot, send active, ok badge
    dark: '#0A6E3D',      // own bubble bg
    darker: '#1A8F57',    // own-bubble label / online text (light)
    light: '#86E5B4',     // own-bubble label / online text (dark)
    faint: '#D8FFE8',     // own-bubble pin icon / reply arrow
    bg16: 'rgba(34,183,108,0.16)',
    bg18: 'rgba(34,183,108,0.18)',
    bg30: 'rgba(34,183,108,0.30)',
    bg38: 'rgba(34,183,108,0.38)',
  },
  gold: {
    primary: '#D4A13A',
    bg14: 'rgba(212,161,58,0.14)',
    bg16: 'rgba(212,161,58,0.16)',
    bg18: 'rgba(212,161,58,0.18)',
    border35: 'rgba(212,161,58,0.35)',
  },
  blue: '#5AB1FF',        // read receipt
  red: {
    primary: '#D66658',   // delete / error
    light: '#FF9A9A',
  },
  black: '#05070B',       // send-button icon
} as const;

/** Semantic chat tokens derived from theme + brand */
export function getChatTokens(theme: Theme) {
  const c = themeColors[theme];
  const isLight = theme === 'light';

  return {
    // Base scales from themeColors
    bg: c.bg,
    border: c.border,
    text: c.text,
    icon: c.icon,

    // Surface aliases
    surfaceScreen:   isLight ? '#F4F6F9' : '#05070B',
    surfaceHeader:   isLight ? 'rgba(243,246,251,0.96)' : 'rgba(5,7,11,0.96)',
    surfaceComposer: isLight ? 'rgba(245,248,252,0.97)' : 'rgba(10,14,24,0.96)',
    surfaceCard:     isLight ? '#FFFFFF' : '#08101E',
    surfaceSheet:    isLight ? '#FFFFFF' : '#0E1322',
    surfaceInput:    isLight ? '#EAF0F8' : '#0C111E',
    surfaceReply:    isLight ? '#EAF0F8' : '#0C111E',
    surfaceTag:      isLight ? chatBrand.gold.bg18 : chatBrand.gold.bg16,
    surfaceDayLabel: isLight ? '#E9EFF8' : 'rgba(255,255,255,0.05)',

    // Border aliases
    borderHeader:  isLight ? '#DCE6F2' : 'rgba(255,255,255,0.06)',
    borderInput:   isLight ? '#D1DCEB' : 'rgba(255,255,255,0.10)',
    borderSheet:   isLight ? '#D6DFEB' : 'rgba(255,255,255,0.08)',
    borderAvatar:  isLight ? '#C9D6E8' : 'rgba(255,255,255,0.10)',
    borderListRow: isLight ? '#D7E3F2' : 'rgba(255,255,255,0.06)',

    // Message bubbles
    bubbleOwnBg:     chatBrand.green.dark,
    bubbleOwnBorder: chatBrand.green.bg38,
    bubbleThemBg:    isLight ? '#FFFFFF' : '#141C2E',
    bubbleThemBorder: isLight ? '#D4DFEE' : 'rgba(255,255,255,0.06)',

    // Reply quote inside bubble
    replyOwnBorder: chatBrand.green.light,
    replyThemBorder: chatBrand.gold.primary,
    replyOwnBg:     'rgba(255,255,255,0.10)',
    replyThemBg:    isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)',
    replyArrowOwn:  chatBrand.green.faint,
    replyArrowThem: isLight ? '#64748B' : '#A8B3C2',
    replyTextOwn:   'rgba(255,255,255,0.70)',
    replyTextThem:  isLight ? '#64748B' : 'rgba(255,255,255,0.45)',

    // Reactions
    reactionActiveBorder: chatBrand.green.light,
    reactionActiveBg:     chatBrand.green.bg18,
    reactionInactiveBorder: isLight ? '#D4DFEE' : 'rgba(255,255,255,0.10)',
    reactionOwnInactiveBg:  'rgba(255,255,255,0.10)',
    reactionThemInactiveBg: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)',

    // Receipts
    receiptRead:      chatBrand.blue,
    receiptDelivered: isLight ? 'rgba(15,23,42,0.38)' : 'rgba(255,255,255,0.48)',
    receiptSent:      isLight ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.45)',
    receiptOwnDelivered: 'rgba(255,255,255,0.58)',
    receiptOwnSent:      'rgba(255,255,255,0.55)',

    // System messages
    systemBorder: chatBrand.gold.border35,
    systemBg:     chatBrand.gold.bg14,

    // Presence
    onlineDot:       chatBrand.green.primary,
    offlineDot:      isLight ? '#A8B3C2' : '#3F4656',
    onlineDotBorder: isLight ? '#F3F6FB' : '#05070B',
    onlineText:      isLight ? chatBrand.green.darker : chatBrand.green.light,

    // Composer misc
    placeholderColor: isLight ? '#7A8597' : 'rgba(255,255,255,0.45)',
    inputText:        isLight ? '#1F2937' : '#FFFFFF',
    sendActiveBg:     chatBrand.green.primary,
    sendInactiveBg:   isLight ? '#B7C7BF' : '#4B5B55',
    attachBtnBg:      isLight ? chatBrand.green.bg16 : undefined,
    attachBtnBorder:  isLight ? '#86DDB3' : undefined,
    attachColor:      isLight ? chatBrand.green.darker : chatBrand.green.light,

    // Typing indicator
    typingBubbleBg: isLight ? '#E9EFF8' : 'rgba(255,255,255,0.05)',
    typingDot:      isLight ? '#8FA1B9' : 'rgba(255,255,255,0.45)',

    // List row
    listRowBg: isLight ? '#FFFFFF' : '#08101E',

    // Close / muted icon
    closeIcon: isLight ? '#64748B' : '#A8B3C2',

    brand: chatBrand,
  };
}

export type ChatTokens = ReturnType<typeof getChatTokens>;
