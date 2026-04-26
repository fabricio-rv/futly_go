const { createClient } = require('@supabase/supabase-js');

function setCorsHeaders(res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleOptions(req, res) {
	if (req.method !== 'OPTIONS') return false;
	res.status(204).json(null);
	return true;
}

function parseBody(body) {
	if (typeof body === 'string') {
		try {
			return JSON.parse(body);
		} catch {
			return null;
		}
	}

	return body;
}

function isString(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

function normalizeAuthMessage(message) {
	const lowerMessage = message.toLowerCase();

	if (lowerMessage.includes('already registered') || lowerMessage.includes('already been registered')) {
		return 'Este e-mail ja esta cadastrado.';
	}

	if (lowerMessage.includes('password should be at least')) {
		return 'A senha precisa ter no minimo 6 caracteres.';
	}

	if (lowerMessage.includes('unable to validate email') || lowerMessage.includes('invalid email')) {
		return 'Digite um e-mail valido.';
	}

	if (lowerMessage.includes('user not found') || lowerMessage.includes('not found')) {
		return 'Nao encontramos uma conta com este e-mail.';
	}

	return message;
}

function getSupabaseAdmin() {
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

module.exports = {
	getSupabaseAdmin,
	handleOptions,
	isString,
	normalizeAuthMessage,
	parseBody,
	setCorsHeaders,
};
