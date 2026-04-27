export const ptPTStore = {
  title: 'Planos',
  currentPlan: 'SEU PLANO ACTUAL',
  plans: {
    free: {
      name: 'Free - Pelada',
      subtitle: 'Pelada de Bairro',
      description: 'Para começar no Futly e entrar nos primeiros jogos.',
      price: 'Grátis',
      features: [
        'Buscar jogos em raio de 5km',
        'Participar de jogos (até 3/mês)',
        'Criar até 1 jogo/mês',
        'Chat com host e jogadores',
        'Anúncios no app'
      ]
    },
    gold: {
      name: 'Gold - Atleta',
      subtitle: 'Atleta Gold',
      description: 'Para quem joga com frequência e quer prioridade.',
      badge: 'Mais popular',
      button: 'Assinar Gold',
      renews: 'Renova em 10/05/2026',
      features: [
        'Raio de busca ilimitado + filtros avançados',
        'Participações e criações ilimitadas',
        'Prioridade na fila',
        'Selo Atleta Gold',
        'Sem anúncios'
      ]
    },
    elite: {
      name: 'Elite - Anfitrião',
      subtitle: 'Host Elite',
      description: 'Para quem organiza jogos com frequência.',
      features: [
        'Receba pagamentos direto (taxa 4,9%)',
        'Gestão de até 5 locais',
        'Selo Host Verificado',
        'Lista de espera automática',
        'Suporte prioritário'
      ]
    }
  },
  billing: {
    monthly: 'Mensal',
    semester: 'Semestral',
    annual: 'Anual',
    startFrom: 'A partir de',
    perMonth: '/mês',
    subscribe: 'Assinar',
    upgrade: 'Fazer upgrade',
    current: 'Plano actual'
  },
  features: {
    unlimitedSearch: 'Raio de busca ilimitado',
    advancedFilters: 'Filtros avançados',
    unlimited: 'Ilimitadas',
    priority: 'Prioridade',
    verified: 'Verificado',
    noAds: 'Sem anúncios'
  },
  plan: {
    title: 'Plano e Pagamento',
    currentDescription: 'Esta no nosso plano premium com todos os beneficios exclusivos.',
    manage: 'Gerir plano',
    goldBenefits: 'Beneficios do Gold',
    unlimitedDescription: 'Crie e participe em quantos jogos quiser',
    advancedFiltersDescription: 'Procure jogos por nivel, horario e localizacao',
    priorityDescription: 'As suas mensagens aparecem em destaque',
    verifiedDescription: 'O seu perfil recebe o selo de verificacao',
    noAdsDescription: 'Desfrute da experiencia sem distracoes',
    exploreOtherPlans: 'Explorar outros planos',
    freePlan: 'Plano Gratuito',
    active: 'Ativo',
    freeDescription: 'Funcionalidades basicas - R$ 0,00/mes',
    yourPlan: 'O seu plano',
    goldDescription: 'Plano premium - R$ 19,90/mes',
    comingSoon: 'Em breve',
    eliteDescription: 'Plano exclusivo - R$ 49,90/mes',
    questionsTitle: 'Tem duvidas sobre os planos?',
    questionsDescription: 'Consulte a nossa central de ajuda ou fale com o suporte para mais informacoes.'
  },
  footer: {
    title: 'Pague como quiser. Cancele quando quiser.',
    description: 'PIX, cartao de credito ou Apple/Google Pay. Sem fidelizacao. Reembolso total nos primeiros 7 dias.'
  },
  hero: {
    kicker: 'Hub de Partidas - Pro',
    title: 'Mais jogos. Mais visibilidade. Mais futebol.',
    description: 'Desbloqueie raio de pesquisa alargado, criacao ilimitada de jogos e prioridade nas vagas mais concorridas.'
  }
};
