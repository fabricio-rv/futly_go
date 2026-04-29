export type BillingPeriod = 'mensal' | 'semestral' | 'anual';

type PlanTone = 'default' | 'gold' | 'elite';
type PlanTagTone = 'neutral' | 'gold' | 'popular';

type PlanFeature = {
	text: string;
	muted?: boolean;
	gold?: boolean;
};

export type StorePlan = {
	id: 'free' | 'gold' | 'elite';
	tone: PlanTone;
	tag?: {
		label: string;
		tone: PlanTagTone;
	};
	name: string;
	title: string;
	description: string;
	price: string;
	per: string;
	strike?: string;
	highlight?: string;
	features: PlanFeature[];
	ctaLabel: string;
	ctaVariant: 'ghost' | 'gold' | 'primary';
};

export const billingOptions: Array<{
	value: BillingPeriod;
	label: string;
	save?: string;
}> = [
	{ value: 'mensal', label: 'Mensal' },
	{ value: 'semestral', label: 'Semestral', save: '-15%' },
	{ value: 'anual', label: 'Anual', save: '-25%' },
];

const sharedFeatures: PlanFeature[] = [
	{ text: 'Raio de busca ilimitado + filtros avancados' },
	{ text: 'Participacoes e criacoes ilimitadas' },
	{ text: 'Prioridade na fila em partidas concorridas' },
	{ text: 'Selo Atleta Gold no perfil' },
	{ text: 'Sem anuncios' },
];

const sharedEliteFeatures: PlanFeature[] = [
	{ text: 'Receba pagamentos direto pelo app (taxa 4,9%)' },
	{ text: 'Gestao de at? 5 locais/quadras' },
	{ text: 'Selo Host Verificado + destaque no feed' },
	{ text: 'Lista de espera automatica' },
	{ text: 'Suporte prioritario em at? 1h' },
];

export const plansByPeriod: Record<BillingPeriod, StorePlan[]> = {
	mensal: [
		{
			id: 'free',
			tone: 'default',
			tag: { label: 'Atual de novos', tone: 'neutral' },
			name: 'Free - Pelada',
			title: 'Pelada de Bairro',
			description: 'Para comecar no Futly e entrar nas primeiras partidas.',
			price: '0',
			per: '/mês - gratis',
			features: [
				{ text: 'Buscar partidas em raio de 5km' },
				{ text: 'Participar de partidas (at? 3/mês)' },
				{ text: 'Criar at? 1 partida/mês como host' },
				{ text: 'Chat com host e jogadores da partida' },
				{ text: 'Anuncios no app', muted: true },
			],
			ctaLabel: 'Plano atual',
			ctaVariant: 'ghost',
		},
		{
			id: 'gold',
			tone: 'gold',
			tag: { label: 'Mais popular', tone: 'gold' },
			name: 'Gold - Atleta',
			title: 'Atleta Gold',
			description: 'Para quem joga com frequencia e quer prioridade nas melhores vagas.',
			price: '23,90',
			per: '/mês',
			features: [{ text: 'Tudo do Free, e mais:', gold: true }, ...sharedFeatures],
			ctaLabel: 'Assinar Gold - R$ 23,90/mês',
			ctaVariant: 'gold',
		},
		{
			id: 'elite',
			tone: 'elite',
			tag: { label: 'Para hosts', tone: 'popular' },
			name: 'Elite - Anfitriao',
			title: 'Host Elite',
			description: 'Para quem organiza partidas com frequencia e quer operacao profissional.',
			price: '39,90',
			per: '/mês',
			features: [
				{ text: 'Tudo do Gold, e mais:', gold: true },
				...sharedEliteFeatures,
			],
			ctaLabel: 'Fazer upgrade - R$ 39,90/mês',
			ctaVariant: 'primary',
		},
	],
	semestral: [
		{
			id: 'free',
			tone: 'default',
			tag: { label: 'Atual de novos', tone: 'neutral' },
			name: 'Free - Pelada',
			title: 'Pelada de Bairro',
			description: 'Para comecar no Futly e entrar nas primeiras partidas.',
			price: '0',
			per: '/mês - gratis',
			features: [
				{ text: 'Buscar partidas em raio de 5km' },
				{ text: 'Participar de partidas (at? 3/mês)' },
				{ text: 'Criar at? 1 partida/mês como host' },
				{ text: 'Chat com host e jogadores da partida' },
				{ text: 'Anuncios no app', muted: true },
			],
			ctaLabel: 'Plano atual',
			ctaVariant: 'ghost',
		},
		{
			id: 'gold',
			tone: 'gold',
			tag: { label: 'Mais popular', tone: 'gold' },
			name: 'Gold - Atleta',
			title: 'Atleta Gold',
			description: 'Para quem joga com frequencia e quer prioridade nas melhores vagas.',
			price: '19,90',
			per: '/mês',
			strike: 'R$ 23,90',
			highlight: 'R$ 119,40 a cada 6 meses - economiza R$ 24',
			features: [{ text: 'Tudo do Free, e mais:', gold: true }, ...sharedFeatures],
			ctaLabel: 'Plano atual - Gerenciar',
			ctaVariant: 'gold',
		},
		{
			id: 'elite',
			tone: 'elite',
			tag: { label: 'Para hosts', tone: 'popular' },
			name: 'Elite - Anfitriao',
			title: 'Host Elite',
			description: 'Para quem organiza partidas com frequencia e quer operacao profissional.',
			price: '34,90',
			per: '/mês',
			strike: 'R$ 39,90',
			highlight: 'R$ 209,40 a cada 6 meses - economiza R$ 30',
			features: [
				{ text: 'Tudo do Gold, e mais:', gold: true },
				...sharedEliteFeatures,
			],
			ctaLabel: 'Fazer upgrade - R$ 34,90/mês',
			ctaVariant: 'primary',
		},
	],
	anual: [
		{
			id: 'free',
			tone: 'default',
			tag: { label: 'Atual de novos', tone: 'neutral' },
			name: 'Free - Pelada',
			title: 'Pelada de Bairro',
			description: 'Para comecar no Futly e entrar nas primeiras partidas.',
			price: '0',
			per: '/mês - gratis',
			features: [
				{ text: 'Buscar partidas em raio de 5km' },
				{ text: 'Participar de partidas (at? 3/mês)' },
				{ text: 'Criar at? 1 partida/mês como host' },
				{ text: 'Chat com host e jogadores da partida' },
				{ text: 'Anuncios no app', muted: true },
			],
			ctaLabel: 'Plano atual',
			ctaVariant: 'ghost',
		},
		{
			id: 'gold',
			tone: 'gold',
			tag: { label: 'Mais popular', tone: 'gold' },
			name: 'Gold - Atleta',
			title: 'Atleta Gold',
			description: 'Para quem joga com frequencia e quer prioridade nas melhores vagas.',
			price: '17,90',
			per: '/mês',
			strike: 'R$ 23,90',
			highlight: 'R$ 214,80 por ano - economiza R$ 72',
			features: [{ text: 'Tudo do Free, e mais:', gold: true }, ...sharedFeatures],
			ctaLabel: 'Assinar Gold anual',
			ctaVariant: 'gold',
		},
		{
			id: 'elite',
			tone: 'elite',
			tag: { label: 'Para hosts', tone: 'popular' },
			name: 'Elite - Anfitriao',
			title: 'Host Elite',
			description: 'Para quem organiza partidas com frequencia e quer operacao profissional.',
			price: '29,90',
			per: '/mês',
			strike: 'R$ 39,90',
			highlight: 'R$ 359,00/ano - economiza R$ 119,80',
			features: [
				{ text: 'Tudo do Gold, e mais:', gold: true },
				...sharedEliteFeatures,
			],
			ctaLabel: 'Fazer upgrade - R$ 359,00/ano',
			ctaVariant: 'primary',
		},
	],
};

export type ConversationPreview = {
	id: string;
	title: string;
	message: string;
	author?: string;
	time: string;
	avatar: string;
	avatarUrl?: string | null;
	avatarTone: 'ok' | 'blue' | 'brown' | 'wine' | 'gold';
	unreadCount?: number;
	unread?: boolean;
	privateTag?: string;
	checkStatus?: 'sent' | 'delivered' | 'read';
	archived?: boolean;
	presence?: 'online' | 'offline';
	lastSeenLabel?: string;
	privateSeenLabel?: string;
	messageKind?: 'text' | 'audio' | 'image' | 'video' | 'document';
};

export const activeConversations: ConversationPreview[] = [
	{
		id: 'arena-central-quinta',
		title: 'Arena Central - Quinta 19h30',
		author: 'Pedro K.',
		message: 'Gente, vamos chegar 19h15 que ai da tempo de aquecer',
		time: 'agora',
		avatar: 'AC',
		avatarTone: 'ok',
		unreadCount: 3,
		unread: true,
	},
	{
		id: 'estadio-bairro-sab',
		title: 'Estadio do Bairro - Sab 16h00',
		author: 'Carla S.',
		message: "Confirmado pra mim! Levo 2 garrafas d'agua",
		time: '12min',
		avatar: 'EB',
		avatarTone: 'blue',
		unreadCount: 1,
		unread: true,
	},
	{
		id: 'luiz-privado',
		title: 'Luiz G.',
		message: 'Você: To com o uniforme amarelo, ve se acha igual',
		time: '1h',
		avatar: 'LG',
		avatarTone: 'brown',
		privateTag: 'PRIVADO',
		checkStatus: 'read',
	},
	{
		id: 'ct-bola-cheia',
		title: 'CT Bola Cheia - Sex 21h00',
		author: 'Sistema',
		message: 'Partida confirmada! 14/14 vagas preenchidas.',
		time: 'ontem',
		avatar: 'CT',
		avatarTone: 'wine',
		checkStatus: 'sent',
	},
];

export const archivedConversations: ConversationPreview[] = [
	{
		id: 'quadra-por-do-sol',
		title: 'Quadra Por-do-Sol - Sab passado',
		author: 'Amanda M.',
		message: 'Foi muito bom! 5 estrelas pro host',
		time: 'ha 1 sem',
		avatar: 'QP',
		avatarTone: 'ok',
		archived: true,
	},
	{
		id: 'copa-bairro-r3',
		title: 'Copa do Bairro R3 - ha 4 dias',
		author: 'Sistema',
		message: 'Avalie os atletas da partida (+50 XP)',
		time: 'ha 4d',
		avatar: 'CB',
		avatarTone: 'gold',
		unreadCount: 1,
		archived: true,
	},
];

export type ChatMessage = {
	id: string;
	kind: 'system' | 'them' | 'me' | 'typing';
	senderId?: string | null;
	text?: string;
	attachment?: {
		id: string;
		kind: 'image' | 'video' | 'audio' | 'document';
		fileName?: string | null;
		mimeType?: string | null;
		url?: string | null;
		downloadUrl?: string | null;
		previewUrl?: string | null;
		durationSec?: number | null;
	};
	author?: string;
	avatarUrl?: string | null;
	role?: string;
	time?: string;
	replyTo?: string;
	replyAuthor?: string | null;
	replyMine?: boolean;
	isForwarded?: boolean;
	receipt?: 'sent' | 'delivered' | 'read';
};

export type ConversationDetail = {
	id: string;
	title: string;
	subtitle: string;
	avatar: string;
	bannerTitle: string;
	bannerSubtitle: string;
	messages: ChatMessage[];
};

export const conversationDetails: Record<string, ConversationDetail> = {
	'arena-central-quinta': {
		id: 'arena-central-quinta',
		title: 'Arena Central - Q. B',
		subtitle: 'Pedro K. + 4 atletas - online',
		avatar: 'AC',
		bannerTitle: 'Quinta - 25 abr - 19h30 - 5/7 vagas',
		bannerSubtitle: 'R. dos Andradas, 1234 - Cidade Baixa - Confirma em 2h 14m',
		messages: [
			{ id: 's1', kind: 'system', text: 'Pedro K. (host) criou esta conversa' },
			{
				id: 't1',
				kind: 'them',
				author: 'Pedro K.',
				role: 'Host',
				text: 'Fala galera! Confirmacao geral at? 17h, beleza? Quem não confirmar a vaga libera.',
				time: '17:02',
			},
			{
				id: 't2',
				kind: 'them',
				author: 'Luiz G.',
				role: 'Fixo',
				text: 'Confirmado aqui chefe, levo a bola',
				time: '17:08',
			},
			{
				id: 'm1',
				kind: 'me',
				text: 'To dentro! Posicao: Pivo. Quanto fica o pix?',
				time: '17:14',
			},
			{
				id: 't3',
				kind: 'them',
				author: 'Pedro K.',
				role: 'Host',
				text: 'R$ 25 cada. Pix do CNPJ ai em cima da partida. Aceita at? 18h30',
				time: '17:15',
			},
			{ id: 's2', kind: 'system', text: 'Carla S. confirmou presença' },
			{
				id: 't4',
				kind: 'them',
				author: 'Carla S.',
				role: 'Ala',
				text: 'Galera, alguem tem espaco de carona vindo do Menino Deus?',
				time: '18:24',
			},
			{
				id: 'm2',
				kind: 'me',
				text: 'Eu vou pelo Menino Deus tbm! Te chamo no privado',
				time: '18:26',
			},
			{
				id: 't5',
				kind: 'them',
				author: 'Pedro K.',
				role: 'Host',
				text: 'Gente, vamos chegar 19h15 que ai da tempo de aquecer',
				time: 'agora',
			},
			{ id: 'typing', kind: 'typing', author: 'Amanda M.' },
		],
	},
};

export function getConversationDetail(id: string) {
	return conversationDetails[id] ?? conversationDetails['arena-central-quinta'];
}
