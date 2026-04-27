// Tradução PT-BR - Tela de Login
// Tom: Acolhedor, confiante e motivador

export const ptBRLogin = {
  title: 'Entre na Partida',
  subtitle: 'O melhor da bola está esperando por você',

  // Inputs e labels
  fields: {
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    password: 'Senha',
    passwordPlaceholder: 'Sua senha segura',
    confirmPassword: 'Confirmar Senha',
    confirmPasswordPlaceholder: 'Confirme sua senha',
    name: 'Nome Completo',
    namePlaceholder: 'Como deseja ser chamado',
    phone: 'Telefone (com WhatsApp)',
    phonePlaceholder: '(11) 9999-9999',
    birthDate: 'Data de Nascimento',
    birthDatePlaceholder: 'DD/MM/YYYY',
    position: 'Posição Principal',
    positionPlaceholder: 'Escolha sua posição',
    level: 'Nível de Jogo',
    levelPlaceholder: 'Iniciante, Intermediário ou Avançado',
  },

  // Botões e CTAs
  buttons: {
    login: 'Entrar na Partida',
    signup: 'Criar Minha Conta',
    forgotPassword: 'Esqueci minha senha',
    resetPassword: 'Redefinir Senha',
    sendCode: 'Enviar Código',
    verifyCode: 'Verificar Código',
    resendCode: 'Reenviar Código',
    continueWithGoogle: 'Continuar com Google',
    continueWithApple: 'Continuar com Apple',
    createAccount: 'Não tem conta? Cadastre-se',
    alreadyHaveAccount: 'Já tem conta? Entre',
  },

  // Fluxo de autenticação
  auth: {
    enterEmail: 'Insira seu email para começar',
    checkEmail: 'Verifique seu email',
    codeSent: 'Enviamos um código de 6 dígitos para {{email}}',
    enterCode: 'Digite o código para confirmar sua conta',
    codeExpires: 'Código expira em {{time}}',
    codeExpired: 'O código expirou, solicite um novo',
    verifying: 'Verificando...',
    verified: 'Email verificado com sucesso!',
    setupProfile: 'Complete seu perfil para começar a jogar',
    chooseRole: 'O que você faz melhor?',
  },

  // Posições de futebol
  positions: {
    goleiro: 'Goleiro',
    lateral: 'Lateral',
    zagueiro: 'Zagueiro',
    volante: 'Volante',
    meia: 'Meia',
    ala: 'Ala',
    atacante: 'Atacante',
    ponta: 'Ponta',
  },

  // Níveis de jogo
  levels: {
    beginner: 'Iniciante - Novo no jogo',
    intermediate: 'Intermediário - Jogo regularmente',
    advanced: 'Avançado - Jogo com frequência',
    professional: 'Profissional - Carreira no futebol',
  },

  // Mensagens de sucesso
  success: {
    accountCreated: 'Conta criada com sucesso!',
    passwordReset: 'Sua senha foi redefinida',
    emailVerified: 'Email verificado com sucesso',
    profileUpdated: 'Perfil atualizado',
  },

  // Termos e privacidade
  legal: {
    agreeToTerms: 'Concordo com os termos de serviço',
    agreeToPrivacy: 'Concordo com a política de privacidade',
    termsOfService: 'Termos de Serviço',
    privacyPolicy: 'Política de Privacidade',
    bySigningUp: 'Ao criar uma conta, você concorda com nossos {{terms}} e {{privacy}}',
  },

  // Dicas e incentivos
  tips: {
    strengthPassword: '✓ Crie uma senha forte com letras, números e símbolos',
    secureAccount: '✓ Sua conta está segura com nós',
    readyToPlay: 'Pronto para colocar a bola na jogo?',
    joinCommunity: 'Junte-se a milhares de jogadores apaixonados por futebol',
  },
};
