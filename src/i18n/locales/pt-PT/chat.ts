export const ptPTChat = {
  title: 'Conversas',
  tabs: {
    active: 'ATIVAS',
    unread: 'NÃO LIDAS',
    all: 'Todas',
    archived: 'Arquivadas'
  },
  roles: {
    host: 'Host',
    player: 'Jogador',
    system: 'Sistema'
  },
  filters: {
    asHost: 'Como Host',
    asPlayer: 'Como Jogador',
    all: 'Todas',
    active: 'Ativas',
    archived: 'Arquivadas'
  },
  messages: {
    sendMessage: 'Enviar mensagem',
    typing: 'Digitando...',
    failedSend: 'Falha ao enviar',
    noPartida: 'Esta conversa não possui partida vinculada',
    archived: 'Conversa arquivada',
    unarchived: 'Conversa restaurada',
    marked: 'Marcado como não lido',
    you: 'Voce',
    noMessagesYet: 'Sem mensagens ainda',
    privateTag: 'PRIVADO',
    readReceiptShort: 'LIDO',
    confirmedPresenceSnippet: 'confirmou presença'
  },
  info: {
    description: 'Cada conversa é vinculada a uma partida marcada. Auto-arquiva 7 dias após o jogo.',
    loading: 'Carregando conversas...'
  },
  actions: {
    share: 'Partilhar localização',
    sendPix: 'Enviar PIX',
    confirmPresence: 'Confirmar presença',
    archive: 'Arquivar',
    unarchive: 'Restaurar',
    report: 'Denunciar',
    markUnread: 'Marcar como não lido',
    viewParticipants: 'Ver participantes',
    unarchiveConversation: 'Restaurar conversa',
    archiveConversation: 'Arquivar conversa',
    openMatchDetails: 'Abrir detalhes do jogo'
  },
  list: {
    title: 'Conversas',
    linkedToMatchHint: 'Cada conversa é vinculada a um ',
    scheduledMatch: 'jogo marcado',
    autoArchiveHint: '. Arquiva automaticamente 7 dias após o jogo.',
    loading: 'Carregando conversas...',
    subtitle: '{{activeCount}} ATIVAS - {{unreadCount}} NÃO LIDAS',
    empty: 'Nenhuma conversa encontrada.'
  },
  errors: {
    sendFailedTitle: 'Falha ao enviar',
    sendFailedMessage: 'Não foi possível enviar a mensagem agora.',
    noMatchLinkedTitle: 'Sem jogo vinculado',
    noMatchLinkedMessage: 'Esta conversa não possui jogo vinculado.',
    archiveFailedTitle: 'Falha ao arquivar',
    updateFailedTitle: 'Falha ao atualizar',
    conversationNotFound: 'Conversa não encontrada.',
    loadConversationFailed: 'Erro ao carregar conversa.',
    markUnreadFailedMessage: 'Não foi possível marcar como não lida.',
    shareItemFailedMessage: 'Não foi possível partilhar o item.'
  },
  status: {
    updatedTitle: 'Conversa atualizada',
    markedUnreadMessage: 'Marcámos esta conversa como não lida.'
  },
  common: {
    error: 'Erro',
    loading: 'Carregando...',
    today: 'Hoje'
  },
  detail: {
    title: 'Conversa',
    matchBannerTitle: 'Jogo marcado',
    matchBannerSubtitle: 'Por favor aguarde enquanto carregamos os detalhes',
    loadingMessages: 'Carregando mensagens...',
    messagePlaceholder: 'Mensagem...',
    quickActions: 'Ações rápidas',
    chooseEmoji: 'Escolha um emoji',
    participants: 'Participantes',
    privateConversationTitle: 'Conversa privada',
    privateConversationSubtitle: 'Troca direta entre atletas do Futly Go',
    matchFallbackTitle: 'Jogo',
    athleteFallback: 'Atleta',
    onlineLabel: 'online',
    athletesLabel: 'atletas',
    privateSubtitle: '{{name}} - {{online}}',
    groupSubtitle: '{{host}} + {{count}} {{athletes}} - {{online}}',
    autoArchiveShort: 'auto-arquiva 7 dias após o jogo',
    quickAttachLocation: 'A partilhar localização agora.',
    quickAttachPix: 'PIX enviado no cartão do jogo. Confirmem, por favor.',
    quickAttachPresence: 'Confirmei presença aqui no chat.'
  }
};
