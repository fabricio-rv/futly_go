export const enUSChat = {
  title: 'Conversations',
  tabs: {
    active: 'ACTIVE',
    unread: 'UNREAD',
    all: 'All',
    archived: 'Archived'
  },
  roles: {
    host: 'Host',
    player: 'Player',
    system: 'System'
  },
  filters: {
    asHost: 'As Host',
    asPlayer: 'As Player',
    all: 'All',
    active: 'Active',
    archived: 'Archived'
  },
  messages: {
    sendMessage: 'Send Message',
    typing: 'Typing...',
    failedSend: 'Failed to send',
    noPartida: 'This conversation has no associated match',
    archived: 'Conversation archived',
    unarchived: 'Conversation restored',
    marked: 'Marked as unread',
    you: 'You',
    noMessagesYet: 'No messages yet',
    privateTag: 'PRIVATE',
    readReceiptShort: 'READ',
    confirmedPresenceSnippet: 'confirmed attendance'
  },
  info: {
    description: 'Each conversation is linked to a scheduled match. Auto-archives 7 days after the game.',
    loading: 'Loading conversations...'
  },
  actions: {
    share: 'Share Location',
    sendPix: 'Send PIX',
    confirmPresence: 'Confirm Presence',
    archive: 'Archive',
    unarchive: 'Restore',
    report: 'Report',
    markUnread: 'Mark as unread',
    viewParticipants: 'View participants',
    unarchiveConversation: 'Restore conversation',
    archiveConversation: 'Archive conversation',
    openMatchDetails: 'Open match details'
  },
  list: {
    title: 'Conversations',
    linkedToMatchHint: 'Each conversation is linked to a ',
    scheduledMatch: 'scheduled match',
    autoArchiveHint: '. Auto-archives 7 days after the game.',
    loading: 'Loading conversations...',
    subtitle: '{{activeCount}} ACTIVE - {{unreadCount}} UNREAD',
    empty: 'No conversations found.'
  },
  errors: {
    sendFailedTitle: 'Failed to send',
    sendFailedMessage: 'Unable to send message right now.',
    noMatchLinkedTitle: 'No match linked',
    noMatchLinkedMessage: 'This conversation has no associated match.',
    archiveFailedTitle: 'Failed to archive',
    updateFailedTitle: 'Failed to update',
    conversationNotFound: 'Conversation not found.',
    loadConversationFailed: 'Error loading conversation.',
    markUnreadFailedMessage: 'Unable to mark as unread.',
    shareItemFailedMessage: 'Unable to share this item.'
  },
  status: {
    updatedTitle: 'Conversation updated',
    markedUnreadMessage: 'We marked this conversation as unread.'
  },
  common: {
    error: 'Error',
    loading: 'Loading...',
    today: 'Today'
  },
  detail: {
    title: 'Conversation',
    matchBannerTitle: 'Scheduled match',
    matchBannerSubtitle: 'Please wait while we load the details',
    loadingMessages: 'Loading messages...',
    messagePlaceholder: 'Message...',
    quickActions: 'Quick actions',
    chooseEmoji: 'Choose an emoji',
    participants: 'Participants',
    privateConversationTitle: 'Private conversation',
    privateConversationSubtitle: 'Direct chat between Futly Go players',
    matchFallbackTitle: 'Match',
    athleteFallback: 'Player',
    onlineLabel: 'online',
    athletesLabel: 'players',
    privateSubtitle: '{{name}} - {{online}}',
    groupSubtitle: '{{host}} + {{count}} {{athletes}} - {{online}}',
    autoArchiveShort: 'auto-archives 7 days after the game',
    quickAttachLocation: 'Sharing location now.',
    quickAttachPix: 'PIX sent in the match card. Please confirm.',
    quickAttachPresence: 'I confirmed attendance here in chat.'
  }
};
