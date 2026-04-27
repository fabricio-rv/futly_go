// Tradução PT-BR - Mensagens de Erro
// Tom: Claro, compassivo e útil

export const ptBRErrors = {
  // Erros gerais
  general: {
    error: 'Erro',
    unknownError: 'Ocorreu um erro inesperado',
    tryAgain: 'Tente novamente',
    checkConnection: 'Verifique sua conexão com a internet',
    noInternet: 'Sem conexão com a internet',
    serverError: 'Erro do servidor, tente novamente mais tarde',
    timeout: 'Requisição expirou, tente novamente',
    forbidden: 'Você não tem permissão para acessar isto',
    notFound: 'Não encontrado',
  },

  // Erros de autenticação
  auth: {
    invalidEmail: 'Email inválido',
    emailAlreadyExists: 'Email já cadastrado',
    emailNotFound: 'Email não encontrado',
    invalidPassword: 'Senha incorreta',
    passwordTooShort: 'A senha deve ter no mínimo 6 caracteres',
    passwordMismatch: 'As senhas não conferem',
    weakPassword: 'Senha fraca, use letras, números e símbolos',
    invalidToken: 'Token inválido ou expirado',
    expiredToken: 'Seu acesso expirou, faça login novamente',
    invalidCode: 'Código inválido',
    codeExpired: 'O código expirou, solicite um novo',
    tooManyAttempts: 'Muitas tentativas, tente novamente mais tarde',
    accountLocked: 'Sua conta foi bloqueada por segurança',
    emailNotVerified: 'Seu email ainda não foi verificado',
    phoneNotVerified: 'Seu telefone ainda não foi verificado',
    userAlreadyExists: 'Usuário já existe',
    userNotFound: 'Usuário não encontrado',
  },

  // Erros de validação
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
    selectOption: 'Selecione uma opção',
    agreedToTerms: 'Você deve concordar com os termos',
  },

  // Erros de perfil
  profile: {
    incompleteProfile: 'Seu perfil está incompleto',
    photoTooLarge: 'A foto é muito grande (máximo 5MB)',
    invalidPhotoFormat: 'Formato de foto inválido (use JPG ou PNG)',
    bioTooLong: 'Biografia muito longa (máximo 500 caracteres)',
    nameTooLong: 'Nome muito longo',
  },

  // Erros de partidas
  matches: {
    matchNotFound: 'Partida não encontrada',
    matchCancelled: 'A partida foi cancelada',
    matchFull: 'A partida está cheia',
    noSpotsAvailable: 'Sem vagas disponíveis',
    alreadyJoined: 'Você já está nesta partida',
    cannotJoinOwnMatch: 'Você não pode entrar em sua própria partida',
    cannotLeaveMatchStarted: 'Você não pode sair de uma partida já iniciada',
    hostCannotLeave: 'O organizador não pode sair da partida',
    invalidLocation: 'Local inválido',
    invalidTime: 'Horário inválido',
    pastDate: 'A data não pode ser no passado',
    minimumPlayers: 'Mínimo de {{count}} jogadores necessários',
    maximumPlayers: 'Máximo de {{count}} jogadores',
    durationTooShort: 'A duração deve ser no mínimo {{minutes}} minutos',
    durationTooLong: 'A duração deve ser no máximo {{minutes}} minutos',
  },

  // Erros de pagamento
  payment: {
    paymentFailed: 'Falha no pagamento',
    invalidCard: 'Cartão inválido',
    cardExpired: 'Cartão expirado',
    insufficientFunds: 'Saldo insuficiente',
    transactionFailed: 'Transação falhou',
    refundFailed: 'Falha ao processar reembolso',
    paymentRequired: 'Pagamento necessário',
  },

  // Erros de privacidade/segurança
  security: {
    accountBlocked: 'Sua conta foi bloqueada',
    userBlocked: 'Você foi bloqueado por este usuário',
    cannotMessage: 'Você não pode enviar mensagens para este usuário',
    suspiciousActivity: 'Atividade suspeita detectada',
    verifyIdentity: 'Verifique sua identidade para continuar',
  },

  // Erros de rede/servidor (Supabase)
  supabase: {
    databaseError: 'Erro ao conectar ao banco de dados',
    storageError: 'Erro ao salvar arquivo',
    realtimeError: 'Erro de conexão em tempo real',
    functionError: 'Erro ao executar função',
    rpcError: 'Erro ao chamar função do servidor',
  },

  // Erros de localização
  location: {
    locationNotPermitted: 'Permissão de localização negada',
    locationUnavailable: 'Localização não disponível',
    invalidAddress: 'Endereço inválido',
    cepNotFound: 'CEP não encontrado',
    cityNotFound: 'Cidade não encontrada',
    stateNotFound: 'Estado não encontrado',
  },

  // Erros de mensagens
  messages: {
    messageTooLong: 'Mensagem muito longa',
    cannotSendMessage: 'Não foi possível enviar a mensagem',
    conversationNotFound: 'Conversa não encontrada',
    messageNotFound: 'Mensagem não encontrada',
  },

  // Sugestões de ação
  suggestions: {
    checkInternet: 'Verifique sua conexão com a internet e tente novamente',
    clearCache: 'Limpe o cache do app e tente novamente',
    updateApp: 'Atualize o app para a versão mais recente',
    contactSupport: 'Contate nosso suporte: {{email}}',
    tryLater: 'Tente novamente mais tarde',
    reloadPage: 'Recarregue a página',
  },

  // Avisos
  warnings: {
    unsavedChanges: 'Você tem alterações não salvas',
    confirmDelete: 'Tem certeza? Esta ação não pode ser desfeita',
    sessionExpired: 'Sua sessão expirou, faça login novamente',
    maintenanceMode: 'Estamos em manutenção, tente novamente em poucos minutos',
  },
};
