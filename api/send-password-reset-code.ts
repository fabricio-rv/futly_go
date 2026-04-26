import {
	getSupabaseAdmin,
	handleOptions,
	isString,
	normalizeAuthMessage,
	parseBody,
	sendEmail,
	setCorsHeaders,
	type VercelRequest,
	type VercelResponse,
} from './_auth';

function generateCode() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
	setCorsHeaders(res);

	if (handleOptions(req, res)) return;

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	const body = parseBody(req.body) as { email?: unknown } | null;

	if (!isString(body?.email)) {
		res.status(400).json({ error: 'Informe o e-mail para receber o código.' });
		return;
	}

	try {
		const supabase = getSupabaseAdmin();
		const email = body.email.trim().toLowerCase();
		const { data, error } = await supabase.auth.admin.generateLink({
			type: 'magiclink',
			email,
		});

		if (error || !data.properties?.email_otp) {
			res.status(400).json({ error: normalizeAuthMessage(error?.message || 'Não foi possível enviar o código.') });
			return;
		}

		const code = data.properties.email_otp || generateCode();
		await sendEmail({ type: 'passwordResetCode', to: email, code });

		res.status(200).json({ ok: true });
	} catch (error) {
		console.error('Password reset email flow failed:', error);
		res.status(500).json({ error: 'Não foi possível enviar o código.' });
	}
}
