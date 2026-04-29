export const ptBRChat = {
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
    noPartida: 'Está conversa não possui partida vinculada',
    archived: 'Conversa arquivada',
    unarchived: 'Conversa restaurada',
    marked: 'Marcado como não lido',
    you: 'Você',
    noMessagesYet: 'Sem mensagens ainda',
    privateTag: 'PRIVADO',
    readReceiptShort: 'OK',
    confirmedPresenceSnippet: 'confirmou presença'
  },
  info: {
    description: 'Cada conversa é vinculada a uma partida marcada. Auto-arquiva 7 dias após o jogo.',
    loading: 'Carregando conversas...'
  },
  actions: {
    share: 'Compartilhar localiza\u00e7\u00e3o',
    sendPix: 'Enviar PIX',
    confirmPresence: 'Confirmar presen\u00e7a',
    archive: 'Arquivar',
    unarchive: 'Restaurar',
    report: 'Denunciar',
    markUnread: 'Marcar como n\u00e3o lida',
    viewParticipants: 'Ver participantes',
    unarchiveConversation: 'Restaurar conversa',
    archiveConversation: 'Arquivar conversa',
    openMatchDetails: 'Abrir detalhes da partida',
    reply: 'Responder',
    copy: 'Copiar',
    forward: 'Encaminhar',
    pin: 'Fixar mensagem',
    unpin: 'Desfixar mensagem',
    saveMessage: 'Salvar mensagem',
    unsaveMessage: 'Remover dos salvos',
    deleteMessage: 'Apagar mensagem'
  },
  list: {
    title: 'Conversas',
    linkedToMatchHint: 'Cada conversa é vinculada a uma ',
    scheduledMatch: 'partida marcada',
    autoArchiveHint: '. Arquiva automaticamente 7 dias após o jogo.',
    loading: 'Carregando conversas...',
    subtitle: '{{activeCount}} ATIVAS - {{unreadCount}} NÃO LIDAS',
    empty: 'Nenhuma conversa encontrada.'
  },
  errors: {
    sendFailedTitle: 'Falha ao enviar',
    sendFailedMessage: 'N\u00e3o foi poss\u00edvel enviar a mensagem agora.',
    noMatchLinkedTitle: 'Sem partida vinculada',
    noMatchLinkedMessage: 'Est\u00e1 conversa n\u00e3o possui partida vinculada.',
    archiveFailedTitle: 'Falha ao arquivar',
    updateFailedTitle: 'Falha ao atualizar',
    conversationNotFound: 'Conversa n\u00e3o encontrada.',
    loadConversationFailed: 'Erro ao carregar conversa.',
    markUnreadFailedMessage: 'N\u00e3o foi poss\u00edvel marcar como n\u00e3o lida.',
    shareItemFailedMessage: 'N\u00e3o foi poss\u00edvel compartilhar o item.',
    selectFileError: 'N\u00e3o foi poss\u00edvel selecionar o arquivo.',
    micPermissionTitle: 'Permiss\u00e3o necess\u00e1ria',
    micPermissionMessage: 'Precisamos de acesso ao microfone para gravar \u00e1udios.',
    galleryPermissionMessage: 'Precisamos de acesso \u00e0 sua galeria para enviar fotos e v\u00eddeos.',
    cameraPermissionMessage: 'Precisamos de acesso \u00e0 c\u00e2mera.',
    startRecordingError: 'N\u00e3o foi poss\u00edvel iniciar a grava\u00e7\u00e3o.',
    audioProcessError: 'N\u00e3o foi poss\u00edvel processar o \u00e1udio gravado.',
    sendAttachmentFailed: 'Falha ao enviar',
    sendAttachmentMessage: 'Falha ao enviar anexo.'
  },
  status: {
    updatedTitle: 'Conversa atualizada',
    markedUnreadMessage: 'Marcamos está conversa como não lida.'
  },
  common: {
    error: 'Erro',
    loading: 'Carregando...',
    today: 'Hoje'
  },
  detail: {
    title: 'Conversa',
    matchBannerTitle: 'Partida marcada',
    matchBannerSubtitle: 'Por favor aguarde enquanto carregamos os detalhes',
    loadingMessages: 'Carregando mensagens...',
    messagePlaceholder: 'Mensagem...',
    quickActions: 'Ações rápidas',
    chooseEmoji: 'Escolha um emoji',
    participants: 'Participantes',
    privateConversationTitle: 'Conversa privada',
    privateConversationSubtitle: 'Troca direta entre atletas do Futly Go',
    matchFallbackTitle: 'Partida',
    athleteFallback: 'Atleta',
    onlineLabel: 'online',
    offlineLabel: 'offline',
    offlineLastSeen: 'offline \u2022 visto por \u00faltimo {{lastSeen}}',
    athletesLabel: 'atletas',
    privateSubtitle: '{{name}} - {{online}}',
    groupSubtitle: '{{host}} + {{count}} {{athletes}} - {{online}}',
    autoArchiveShort: 'auto-arquiva 7 dias ap\u00f3s o jogo',
    gallery: 'Galeria de Fotos e V\u00eddeos',
    camera: 'C\u00e2mera',
    documentFile: 'Documento / Arquivo',
    quickAttachLocation: 'Compartilhando localização agora.',
    quickAttachPix: 'Pix enviado no card da partida. Confirmem por favor.',
    quickAttachPresence: 'Confirmei presença aqui no chat.'
  }
};
