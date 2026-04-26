import { createClient } from '@supabase/supabase-js';

export type VercelRequest = {
	method?: string;
	body?: unknown;
};

export type VercelResponse = {
	setHeader: (name: string, value: string) => void;
	status: (code: number) => {
		json: (body: unknown) => void;
	};
};

export function setCorsHeaders(res: VercelResponse) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleOptions(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'OPTIONS') return false;

	res.status(204).json(null);
	return true;
}

export function parseBody(body: unknown) {
	if (typeof body === 'string') {
		try {
			return JSON.parse(body) as unknown;
		} catch {
			return null;
		}
	}

	return body;
}

export function isString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeAuthMessage(message: string) {
	const lowerMessage = message.toLowerCase();

	if (lowerMessage.includes('already registered') || lowerMessage.includes('already been registered')) {
		return 'Este e-mail já está cadastrado.';
	}

	if (lowerMessage.includes('password should be at least')) {
		return 'A senha precisa ter no mínimo 6 caracteres.';
	}

	if (lowerMessage.includes('unable to validate email') || lowerMessage.includes('invalid email')) {
		return 'Digite um e-mail válido.';
	}

	if (lowerMessage.includes('user not found') || lowerMessage.includes('not found')) {
		return 'Não encontramos uma conta com este e-mail.';
	}

	return message;
}

export function getSupabaseAdmin() {
	const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

export async function sendEmail(payload: unknown) {
	const baseUrl = process.env.APP_URL || process.env.EXPO_PUBLIC_APP_URL || 'https://futlygo.vercel.app';
	const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/send-email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const details = await response.text().catch(() => response.statusText);
		throw new Error(details || 'Email send failed');
	}
}
