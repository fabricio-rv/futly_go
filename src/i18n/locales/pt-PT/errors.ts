// Tradução PT-PT - Mensagens de Erro

export const ptPTErrors = {
  general: {
    error: 'Erro',
    unknownError: 'Ocorreu um erro inesperado',
    tryAgain: 'Tente novamente',
    checkConnection: 'Verifique a sua ligação à internet',
    noInternet: 'Sem ligação à internet',
    serverError: 'Erro do servidor, tente novamente mais tarde',
    timeout: 'Requisição expirada, tente novamente',
    forbidden: 'Não tem permissão para aceder a isto',
    notFound: 'Não encontrado',
  },

  auth: {
    invalidEmail: 'Email inválido',
    emailAlreadyExists: 'Email já registado',
    emailNotFound: 'Email não encontrado',
    invalidPassword: 'Palavra-passe incorreta',
    passwordTooShort: 'A palavra-passe deve ter no mínimo 6 caracteres',
    passwordMismatch: 'As palavras-passe não conferem',
    weakPassword: 'Palavra-passe fraca, utilize letras, números e símbolos',
    invalidToken: 'Token inválido ou expirado',
    expiredToken: 'O seu acesso expirou, faça login novamente',
    invalidCode: 'Código inválido',
    codeExpired: 'O código expirou, solicite um novo',
    tooManyAttempts: 'Muitas tentativas, tente novamente mais tarde',
    accountLocked: 'A sua conta foi bloqueada por segurança',
    emailNotVerified: 'O seu email ainda não foi verificado',
    phoneNotVerified: 'O seu telefone ainda não foi verificado',
    userAlreadyExists: 'Utilizador já existe',
    userNotFound: 'Utilizador não encontrado',
  },

  validation: {
    fieldRequired: 'Este campo é obrigatório',
    fieldsRequired: '{{count}} campos obrigatórios',
    invalidFormat: 'Formato inválido',
    invalidEmail: 'Email inválido',
    invalidPhone: 'Telefone inválido',
    invalidDate: 'Data inválida',
    invalidAge: 'Idade inválida',
    tooLong: 'Este campo é muito longo',
    tooShort: 'Este campo é muito curto',
    numbersOnly: 'Apenas números',
    lettersOnly: 'Apenas letras',
    selectOption: 'Seleccione uma opção',
    agreedToTerms: 'Deve concordar com os termos',
  },

  profile: {
    incompleteProfile: 'O seu perfil está incompleto',
    photoTooLarge: 'A foto é muito grande (máximo 5MB)',
    invalidPhotoFormat: 'Formato de foto inválido (utilize JPG ou PNG)',
    bioTooLong: 'Biografia muito longa (máximo 500 caracteres)',
    nameTooLong: 'Nome muito longo',
  },

  matches: {
    matchNotFound: 'Jogo não encontrado',
    matchCancelled: 'O jogo foi cancelado',
    matchFull: 'O jogo está completo',
    noSpotsAvailable: 'Sem vagas disponíveis',
    alreadyJoined: 'Já está neste jogo',
    cannotJoinOwnMatch: 'Não pode entrar no seu próprio jogo',
    cannotLeaveMatchStarted: 'Não pode sair de um jogo já iniciado',
    hostCannotLeave: 'O organizador não pode sair do jogo',
    invalidLocation: 'Local inválido',
    invalidTime: 'Hora inválida',
    pastDate: 'A data não pode ser no passado',
    minimumPlayers: 'Mínimo de {{count}} jogadores necessários',
    maximumPlayers: 'Máximo de {{count}} jogadores',
    durationTooShort: 'A duração deve ser no mínimo {{minutes}} minutos',
    durationTooLong: 'A duração deve ser no máximo {{minutes}} minutos',
  },

  payment: {
    paymentFailed: 'Falha no pagamento',
    invalidCard: 'Cartão inválido',
    cardExpired: 'Cartão expirado',
    insufficientFunds: 'Saldo insuficiente',
    transactionFailed: 'Transação falhou',
    refundFailed: 'Falha ao processar reembolso',
    paymentRequired: 'Pagamento necessário',
  },

  security: {
    accountBlocked: 'A sua conta foi bloqueada',
    userBlocked: 'Foi bloqueado por este utilizador',
    cannotMessage: 'Não pode enviar mensagens para este utilizador',
    suspiciousActivity: 'Actividade suspeita detectada',
    verifyIdentity: 'Verifique a sua identidade para continuar',
  },

  supabase: {
    databaseError: 'Erro ao ligar à base de dados',
    storageError: 'Erro ao guardar ficheiro',
    realtimeError: 'Erro de ligação em tempo real',
    functionError: 'Erro ao executar função',
    rpcError: 'Erro ao chamar função do servidor',
  },

  location: {
    locationNotPermitted: 'Permissão de localização negada',
    locationUnavailable: 'Localização não disponível',
    invalidAddress: 'Endereço inválido',
    cepNotFound: 'CEP não encontrado',
    cityNotFound: 'Cidade não encontrada',
    stateNotFound: 'Estado não encontrado',
  },

  messages: {
    messageTooLong: 'Mensagem muito longa',
    cannotSendMessage: 'Não foi possível enviar a mensagem',
    conversationNotFound: 'Conversa não encontrada',
    messageNotFound: 'Mensagem não encontrada',
  },

  suggestions: {
    checkInternet: 'Verifique a sua ligação à internet e tente novamente',
    clearCache: 'Limpe a cache da aplicação e tente novamente',
    updateApp: 'Actualize a aplicação para a versão mais recente',
    contactSupport: 'Contacte o nosso suporte: {{email}}',
    tryLater: 'Tente novamente mais tarde',
    reloadPage: 'Recarregue a página',
  },

  warnings: {
    unsavedChanges: 'Tem alterações não guardadas',
    confirmDelete: 'Tem a certeza? Esta acção não pode ser desfeita',
    sessionExpired: 'A sua sessão expirou, faça login novamente',
    maintenanceMode: 'Estamos em manutenção, tente novamente em poucos minutos',
  },
};
