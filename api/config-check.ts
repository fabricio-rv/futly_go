import {
	handleOptions,
	setCorsHeaders,
	type VercelRequest,
	type VercelResponse,
} from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	setCorsHeaders(res);

	if (handleOptions(req, res)) return;

	if (req.method !== 'GET') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	const config = {
		hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.EXPO_PUBLIC_SUPABASE_URL,
		hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
		hasResendApiKey: !!process.env.RESEND_API_KEY || !!process.env.EXPO_PUBLIC_RESEND_API_KEY,
		hasResendFromEmail: !!process.env.RESEND_FROM_EMAIL,
		resendKeyStartsWith: (process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY || '').startsWith('re_'),
		supabaseUrl: process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
		nodeEnv: process.env.NODE_ENV,
		vercelEnv: process.env.VERCEL_ENV,
		timestamp: new Date().toISOString(),
	};

	console.log('Configuration check:', config);

	res.status(200).json(config);
}