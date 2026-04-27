export const esESChat = {
  title: 'Conversaciones',
  tabs: {
    active: 'ACTIVAS',
    unread: 'NO LEÍDAS',
    all: 'Todas',
    archived: 'Archivadas'
  },
  roles: {
    host: 'Anfitrión',
    player: 'Jugador',
    system: 'Sistema'
  },
  filters: {
    asHost: 'Como Anfitrión',
    asPlayer: 'Como Jugador',
    all: 'Todas',
    active: 'Ativas',
    archived: 'Arquivadas'
  },
  messages: {
    sendMessage: 'Enviar Mensaje',
    typing: 'Escribiendo...',
    failedSend: 'Error al enviar',
    noPartida: 'Esta conversación no tiene partido asociado',
    archived: 'Conversación archivada',
    unarchived: 'Conversación restaurada',
    marked: 'Marcado como no leído'
  },
  info: {
    description: 'Cada conversación está vinculada a un partido programado. Se archiva automáticamente 7 días después del juego.',
    loading: 'Cargando conversaciones...'
  },
  actions: {
    share: 'Compartir Ubicación',
    sendPix: 'Enviar PIX',
    confirmPresence: 'Confirmar Presencia',
    archive: 'Archivar',
    unarchive: 'Restaurar',
    report: 'Denunciar',
    markUnread: 'Marcar como nao lida',
    viewParticipants: 'Ver participantes',
    unarchiveConversation: 'Desarquivar conversa',
    archiveConversation: 'Arquivar conversa',
    openMatchDetails: 'Abrir detalhes da partida'
  },
  list: {
    title: 'Conversas',
    linkedToMatchHint: 'Cada conversa e vinculada a uma ',
    scheduledMatch: 'partida marcada',
    autoArchiveHint: '. Auto-arquiva 7 dias apos o jogo.',
    loading: 'Carregando conversas...',
    subtitle: '${summary.activeCount} ATIVAS - ${summary.unreadCount} NAO LIDAS'
  },
  errors: {
    sendFailedTitle: 'Error al enviar',
    sendFailedMessage: 'No se pudo enviar el mensaje ahora.',
    noMatchLinkedTitle: 'Sin partido vinculado',
    noMatchLinkedMessage: 'Esta conversación no tiene partido vinculado.',
    archiveFailedTitle: 'Falha ao arquivar',
    updateFailedTitle: 'Falha ao atualizar'
  },
  status: {
    updatedTitle: 'Conversa atualizada',
    markedUnreadMessage: 'Marcamos esta conversa como nao lida.'
  },
  common: {
    error: 'Falha',
    loading: 'Carregando...',
    today: 'Hoje'
  },
  detail: {
    title: 'Conversa',
    matchBannerTitle: 'Partida marcada',
    matchBannerSubtitle: 'Aguarde enquanto carregamos os detalhes',
    loadingMessages: 'Carregando mensagens...',
    messagePlaceholder: 'Mensagem...',
    quickActions: 'Acoes rapidas',
    chooseEmoji: 'Escolha um emoji',
    participants: 'Participantes'
  }
};
