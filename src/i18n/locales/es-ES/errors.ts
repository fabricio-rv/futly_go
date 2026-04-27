// Traducción ES-ES - Mensajes de Error

export const esESErrors = {
  general: {
    error: 'Error',
    unknownError: 'Ocurrió un error inesperado',
    tryAgain: 'Intente de nuevo',
    checkConnection: 'Verifique su conexión a internet',
    noInternet: 'Sin conexión a internet',
    serverError: 'Error del servidor, intente más tarde',
    timeout: 'Tiempo de espera agotado, intente de nuevo',
    forbidden: 'No tiene permiso para acceder a esto',
    notFound: 'No encontrado',
  },

  auth: {
    invalidEmail: 'Email inválido',
    emailAlreadyExists: 'Email ya registrado',
    emailNotFound: 'Email no encontrado',
    invalidPassword: 'Contraseña incorrecta',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    passwordMismatch: 'Las contraseñas no coinciden',
    weakPassword: 'Contraseña débil, use letras, números y símbolos',
    invalidToken: 'Token inválido o expirado',
    expiredToken: 'Su sesión ha expirado, inicie sesión nuevamente',
    invalidCode: 'Código inválido',
    codeExpired: 'El código expiró, solicite uno nuevo',
    tooManyAttempts: 'Demasiados intentos, intente más tarde',
    accountLocked: 'Su cuenta fue bloqueada por seguridad',
    emailNotVerified: 'Su email aún no ha sido verificado',
    phoneNotVerified: 'Su teléfono aún no ha sido verificado',
    userAlreadyExists: 'El usuario ya existe',
    userNotFound: 'Usuario no encontrado',
  },

  validation: {
    fieldRequired: 'Este campo es obligatorio',
    fieldsRequired: '{{count}} campos obligatorios',
    invalidFormat: 'Formato inválido',
    invalidEmail: 'Email inválido',
    invalidPhone: 'Teléfono inválido',
    invalidDate: 'Fecha inválida',
    invalidAge: 'Edad inválida',
    tooLong: 'Este campo es muy largo',
    tooShort: 'Este campo es muy corto',
    numbersOnly: 'Solo números',
    lettersOnly: 'Solo letras',
    selectOption: 'Seleccione una opción',
    agreedToTerms: 'Debe aceptar los términos',
  },

  profile: {
    incompleteProfile: 'Su perfil está incompleto',
    photoTooLarge: 'La foto es muy grande (máximo 5MB)',
    invalidPhotoFormat: 'Formato de foto inválido (use JPG o PNG)',
    bioTooLong: 'Biografía muy larga (máximo 500 caracteres)',
    nameTooLong: 'Nombre muy largo',
  },

  matches: {
    matchNotFound: 'Partido no encontrado',
    matchCancelled: 'El partido fue cancelado',
    matchFull: 'El partido está completo',
    noSpotsAvailable: 'Sin plazas disponibles',
    alreadyJoined: 'Ya estás en este partido',
    cannotJoinOwnMatch: 'No puede unirse a su propio partido',
    cannotLeaveMatchStarted: 'No puede salir de un partido ya iniciado',
    hostCannotLeave: 'El organizador no puede salir del partido',
    invalidLocation: 'Ubicación inválida',
    invalidTime: 'Hora inválida',
    pastDate: 'La fecha no puede ser en el pasado',
    minimumPlayers: 'Mínimo {{count}} jugadores requeridos',
    maximumPlayers: 'Máximo {{count}} jugadores',
    durationTooShort: 'La duración debe ser al menos {{minutes}} minutos',
    durationTooLong: 'La duración debe ser como máximo {{minutes}} minutos',
  },

  payment: {
    paymentFailed: 'Error de pago',
    invalidCard: 'Tarjeta inválida',
    cardExpired: 'Tarjeta expirada',
    insufficientFunds: 'Fondos insuficientes',
    transactionFailed: 'Transacción fallida',
    refundFailed: 'Error al procesar el reembolso',
    paymentRequired: 'Se requiere pago',
  },

  security: {
    accountBlocked: 'Su cuenta fue bloqueada',
    userBlocked: 'Fue bloqueado por este usuario',
    cannotMessage: 'No puede enviar mensajes a este usuario',
    suspiciousActivity: 'Se detectó actividad sospechosa',
    verifyIdentity: 'Verifique su identidad para continuar',
  },

  supabase: {
    databaseError: 'Error de conexión a la base de datos',
    storageError: 'Error al guardar archivo',
    realtimeError: 'Error de conexión en tiempo real',
    functionError: 'Error al ejecutar función',
    rpcError: 'Error al llamar función del servidor',
  },

  location: {
    locationNotPermitted: 'Permiso de ubicación denegado',
    locationUnavailable: 'Ubicación no disponible',
    invalidAddress: 'Dirección inválida',
    cepNotFound: 'CEP no encontrado',
    cityNotFound: 'Ciudad no encontrada',
    stateNotFound: 'Provincia no encontrada',
  },

  messages: {
    messageTooLong: 'Mensaje muy largo',
    cannotSendMessage: 'No se pudo enviar el mensaje',
    conversationNotFound: 'Conversación no encontrada',
    messageNotFound: 'Mensaje no encontrado',
  },

  suggestions: {
    checkInternet: 'Verifique su conexión a internet e intente de nuevo',
    clearCache: 'Borre la caché de la aplicación e intente de nuevo',
    updateApp: 'Actualice la aplicación a la última versión',
    contactSupport: 'Contacte a nuestro soporte: {{email}}',
    tryLater: 'Intente más tarde',
    reloadPage: 'Recargue la página',
  },

  warnings: {
    unsavedChanges: 'Tiene cambios sin guardar',
    confirmDelete: '¿Está seguro? Esta acción no se puede deshacer',
    sessionExpired: 'Su sesión ha expirado, inicie sesión nuevamente',
    maintenanceMode: 'Estamos en mantenimiento, intente en unos minutos',
  },
};
