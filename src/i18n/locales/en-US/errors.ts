// English (US) Translation - Error Messages

export const enUSErrors = {
  // General errors
  general: {
    error: 'Error',
    unknownError: 'An unexpected error occurred',
    tryAgain: 'Try again',
    checkConnection: 'Check your internet connection',
    noInternet: 'No internet connection',
    serverError: 'Server error, please try again later',
    timeout: 'Request timed out, try again',
    forbidden: 'You don\'t have permission to access this',
    notFound: 'Not found',
  },

  // Authentication errors
  auth: {
    invalidEmail: 'Invalid email',
    emailAlreadyExists: 'Email already registered',
    emailNotFound: 'Email not found',
    invalidPassword: 'Incorrect password',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    weakPassword: 'Weak password, use letters, numbers and symbols',
    invalidToken: 'Invalid or expired token',
    expiredToken: 'Your session has expired, please login again',
    invalidCode: 'Invalid code',
    codeExpired: 'Code expired, request a new one',
    tooManyAttempts: 'Too many attempts, try again later',
    accountLocked: 'Your account has been locked for security',
    emailNotVerified: 'Your email has not been verified yet',
    phoneNotVerified: 'Your phone has not been verified yet',
    userAlreadyExists: 'User already exists',
    userNotFound: 'User not found',
  },

  // Validation errors
  validation: {
    fieldRequired: 'This field is required',
    fieldsRequired: '{{count}} required fields',
    invalidFormat: 'Invalid format',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone',
    invalidDate: 'Invalid date',
    invalidAge: 'Invalid age',
    tooLong: 'This field is too long',
    tooShort: 'This field is too short',
    numbersOnly: 'Numbers only',
    lettersOnly: 'Letters only',
    selectOption: 'Select an option',
    agreedToTerms: 'You must agree to the terms',
  },

  // Profile errors
  profile: {
    incompleteProfile: 'Your profile is incomplete',
    photoTooLarge: 'Photo is too large (max 5MB)',
    invalidPhotoFormat: 'Invalid photo format (use JPG or PNG)',
    bioTooLong: 'Bio is too long (max 500 characters)',
    nameTooLong: 'Name is too long',
  },

  // Match errors
  matches: {
    matchNotFound: 'Match not found',
    matchCancelled: 'The match has been cancelled',
    matchFull: 'The match is full',
    noSpotsAvailable: 'No spots available',
    alreadyJoined: 'You\'re already in this match',
    cannotJoinOwnMatch: 'You cannot join your own match',
    cannotLeaveMatchStarted: 'You cannot leave a match that has started',
    hostCannotLeave: 'The host cannot leave the match',
    invalidLocation: 'Invalid location',
    invalidTime: 'Invalid time',
    pastDate: 'The date cannot be in the past',
    minimumPlayers: 'Minimum {{count}} players required',
    maximumPlayers: 'Maximum {{count}} players',
    durationTooShort: 'Duration must be at least {{minutes}} minutes',
    durationTooLong: 'Duration must be no more than {{minutes}} minutes',
  },

  // Payment errors
  payment: {
    paymentFailed: 'Payment failed',
    invalidCard: 'Invalid card',
    cardExpired: 'Card expired',
    insufficientFunds: 'Insufficient funds',
    transactionFailed: 'Transaction failed',
    refundFailed: 'Refund processing failed',
    paymentRequired: 'Payment required',
  },

  // Security/Privacy errors
  security: {
    accountBlocked: 'Your account has been blocked',
    userBlocked: 'You have been blocked by this user',
    cannotMessage: 'You cannot message this user',
    suspiciousActivity: 'Suspicious activity detected',
    verifyIdentity: 'Verify your identity to continue',
  },

  // Network/Server errors (Supabase)
  supabase: {
    databaseError: 'Database connection error',
    storageError: 'File storage error',
    realtimeError: 'Real-time connection error',
    functionError: 'Function execution error',
    rpcError: 'Server function call error',
  },

  // Location errors
  location: {
    locationNotPermitted: 'Location permission denied',
    locationUnavailable: 'Location unavailable',
    invalidAddress: 'Invalid address',
    cepNotFound: 'CEP not found',
    cityNotFound: 'City not found',
    stateNotFound: 'State not found',
  },

  // Message errors
  messages: {
    messageTooLong: 'Message is too long',
    cannotSendMessage: 'Could not send message',
    conversationNotFound: 'Conversation not found',
    messageNotFound: 'Message not found',
  },

  // Action suggestions
  suggestions: {
    checkInternet: 'Check your internet connection and try again',
    clearCache: 'Clear app cache and try again',
    updateApp: 'Update the app to the latest version',
    contactSupport: 'Contact our support: {{email}}',
    tryLater: 'Try again later',
    reloadPage: 'Reload the page',
  },

  // Warnings
  warnings: {
    unsavedChanges: 'You have unsaved changes',
    confirmDelete: 'Are you sure? This action cannot be undone',
    sessionExpired: 'Your session has expired, please login again',
    maintenanceMode: 'We\'re under maintenance, try again in a few minutes',
  },
};
