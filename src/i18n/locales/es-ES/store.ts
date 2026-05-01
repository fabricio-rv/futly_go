export const esESStore = {
  title: 'Planes',
  currentPlan: 'TU PLAN ACTUAL',
  plans: {
    free: {
      name: 'Gratis - Casual',
      subtitle: 'Casual de Barrio',
      description: 'Para empezar en Futly y unirte a tus primeros partidos.',
      price: 'Gratis',
      features: [
        'Buscar partidos en radio de 5km',
        'Unirte a partidos (hasta 3/mes)',
        'Crear hasta 1 partido/mes como anfitrión',
        'Chat con anfitrión y jugadores',
        'Anuncios en la app'
      ]
    },
    gold: {
      name: 'Oro - Atleta',
      subtitle: 'Atleta Oro',
      description: 'Para quienes juegan frecuentemente y quieren prioridad en los mejores puestos.',
      badge: 'Más popular',
      button: 'Suscribirse Oro',
      renews: 'Renueva el 10/05/2026',
      features: [
        'Radio de búsqueda ilimitado + filtros avanzados',
        'Participaciones y creaciones ilimitadas',
        'Prioridad en cola en partidos competitivos',
        'Insignia Atleta Oro en perfil',
        'Sin anuncios'
      ]
    },
    elite: {
      name: 'Elite - Anfitrión',
      subtitle: 'Anfitrión Elite',
      description: 'Para quienes organizan partidos frecuentemente y quieren operación profesional.',
      features: [
        'Recibe pagos directamente por la app (tasa 4,9%)',
        'Gestión de hasta 5 lugares/canchas',
        'Insignia Anfitrión Verificado + destaque en feed',
        'Lista de espera automática',
        'Soporte prioritario en hasta 1h'
      ]
    }
  },
  billing: {
    monthly: 'Mensual',
    semester: 'Semestral',
    annual: 'Anual',
    startFrom: 'Desde',
    perMonth: '/mes',
    subscribe: 'Suscribirse',
    upgrade: 'Mejorar',
    current: 'Plan actual'
  },
  features: {
    unlimitedSearch: 'Radio de búsqueda ilimitado',
    advancedFilters: 'Filtros avanzados',
    unlimited: 'Ilimitadas',
    priority: 'Prioridad',
    verified: 'Verificado',
    noAds: 'Sin Anuncios'
  },
  plan: {
    title: 'Plan y pago',
    currentDescription: 'Estas en nuestro plan premium con beneficios exclusivos.',
    manage: 'Gestionar plan',
    goldBenefits: 'Beneficios del Gold',
    unlimitedDescription: 'Crea y participa en todos los partidos que quieras',
    advancedFiltersDescription: 'Busca partidos por nivel, horário y ubicacion',
    priorityDescription: 'Tus mensajes aparecen con prioridad',
    verifiedDescription: 'Tu perfil recibe la insignia de verificacion',
    noAdsDescription: 'Disfruta la experiencia sin anuncios',
    exploreOtherPlans: 'Explorar otros planes',
    freePlan: 'Plan gratuito',
    active: 'Activo',
    freeDescription: 'Funciones basicas - R$ 0,00/mes',
    yourPlan: 'Tu plan',
    goldDescription: 'Plan premium - R$ 19,90/mes',
    comingSoon: 'Proximamente',
    eliteDescription: 'Plan exclusivo - R$ 49,90/mes',
    questionsTitle: 'Tienes dudas sobre los planes?',
    questionsDescription: 'Consulta nuestro centro de ayuda o contacta con soporte para mas informacion.'
  },
  footer: {
    title: 'Paga como quieras. Cancela cuando quieras.',
    description: 'PIX, tarjeta de credito o Apple/Google Pay. Sin permanencia. Reembolso completo en los primeros 7 dias.'
  },
  hero: {
    kicker: 'Futly Go - Pro',
    title: 'Mas partidos. Mas visibilidad. Mas futbol.',
    description: 'Desbloquea un radio de busqueda mayor, creacion ilimitada de partidos y prioridad en plazas concurridas.'
  }
};
