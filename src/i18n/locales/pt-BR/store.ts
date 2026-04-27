export const ptBRStore = {
  title: 'Planos',
  currentPlan: 'SEU PLANO ATUAL',
  plans: {
    free: {
      name: 'Free - Pelada',
      subtitle: 'Pelada de Bairro',
      description: 'Para começar no Futly e entrar nas primeiras partidas.',
      price: 'Grátis',
      features: [
        'Buscar partidas em raio de 5km',
        'Participar de partidas (até 3/mês)',
        'Criar até 1 partida/mês como host',
        'Chat com host e jogadores',
        'Anúncios no app'
      ]
    },
    gold: {
      name: 'Gold - Atleta',
      subtitle: 'Atleta Gold',
      description: 'Para quem joga com frequência e quer prioridade nas melhores vagas.',
      badge: 'Mais popular',
      button: 'Assinar Gold',
      renews: 'Renova em 10/05/2026',
      features: [
        'Raio de busca ilimitado + filtros avançados',
        'Participações e criações ilimitadas',
        'Prioridade na fila em partidas concorridas',
        'Selo Atleta Gold no perfil',
        'Sem anúncios'
      ]
    },
    elite: {
      name: 'Elite - Anfitrião',
      subtitle: 'Host Elite',
      description: 'Para quem organiza partidas com frequência e quer operação profissional.',
      features: [
        'Receba pagamentos direto pelo app (taxa 4,9%)',
        'Gestão de até 5 locais/quadras',
        'Selo Host Verificado + destaque no feed',
        'Lista de espera automática',
        'Suporte prioritário em até 1h'
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
    current: 'Plano atual'
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
    currentDescription: 'Você está no nosso plano premium com todos os benefícios exclusivos.',
    manage: 'Gerenciar plano',
    goldBenefits: 'Benefícios do Gold',
    unlimitedDescription: 'Crie e participe de quantas partidas quiser',
    advancedFiltersDescription: 'Busque partidas por nível, horário e localização',
    priorityDescription: 'Suas mensagens aparecem em destaque',
    verifiedDescription: 'Seu perfil recebe o badge de verificação',
    noAdsDescription: 'Aproveite a experiência sem distrações',
    exploreOtherPlans: 'Explorar outros planos',
    freePlan: 'Plano Gratuito',
    active: 'Ativo',
    freeDescription: 'Funcionalidades básicas - R$ 0,00/mês',
    yourPlan: 'Seu plano',
    goldDescription: 'Plano premium - R$ 19,90/mês',
    comingSoon: 'Em breve',
    eliteDescription: 'Plano exclusivo - R$ 49,90/mês',
    questionsTitle: 'Tem dúvidas sobre os planos?',
    questionsDescription: 'Consulte nossa central de ajuda ou fale com o suporte para mais informações.'
  },
  footer: {
    title: 'Pague ? vontade. Cancele quando quiser.',
    description: 'PIX, cartão de crédito ou Apple/Google Pay. Sem fidelidade. Reembolso integral nos primeiros 7 dias.'
  },
  hero: {
    kicker: 'Hub de Partidas - Pro',
    title: 'Mais partidas. Mais visibilidade. Mais futebol.',
    description: 'Desbloqueie raio de busca ampliado, criação ilimitada de partidas e prioridade nas vagas concorridas.'
  }
};
