const {
	getSupabaseAdmin,
	handleOptions,
	isString,
	normalizeAuthMessage,
	parseBody,
	setCorsHeaders,
} = require('./_auth');
const { sendResendEmail } = require('./_email');

module.exports = async function handler(req, res) {
	setCorsHeaders(res);

	if (handleOptions(req, res)) return;

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	const body = parseBody(req.body);

	if (!isString(body?.email)) {
		res.status(400).json({ error: 'Informe o e-mail para receber o codigo.' });
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
			res.status(400).json({ error: normalizeAuthMessage(error?.message || 'Nao foi possivel enviar o codigo.') });
			return;
		}

		await sendResendEmail({ type: 'passwordResetCode', to: email, code: data.properties.email_otp });

		res.status(200).json({ ok: true });
	} catch (error) {
		console.error('Password reset email flow failed:', error);
		res.status(500).json({
			error: 'Nao foi possivel enviar o codigo.',
			details: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
