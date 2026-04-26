const {
	getSupabaseAdmin,
	handleOptions,
	isString,
	normalizeAuthMessage,
	parseBody,
	setCorsHeaders,
} = require('./_auth');
const { sendResendEmail } = require('./_email');

function isSignupBody(value) {
	if (!value || typeof value !== 'object') return false;

	return isString(value.email) && isString(value.password) && isString(value.fullName);
}

module.exports = async function handler(req, res) {
	setCorsHeaders(res);

	if (handleOptions(req, res)) return;

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	const body = parseBody(req.body);

	if (!isSignupBody(body)) {
		res.status(400).json({ error: 'Preencha nome, e-mail e senha para criar a conta.' });
		return;
	}

	let createdUserId = null;

	try {
		const supabase = getSupabaseAdmin();
		const email = body.email.trim().toLowerCase();

		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password: body.password,
			email_confirm: false,
			user_metadata: {
				full_name: body.fullName,
				phone: body.phone,
				state: body.state,
				city: body.city,
				cep: body.cep,
			},
		});

		if (error || !data.user) {
			res.status(400).json({ error: normalizeAuthMessage(error?.message || 'Nao foi possivel criar a conta no momento.') });
			return;
		}

		createdUserId = data.user.id;

		const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
			type: 'signup',
			email,
			password: body.password,
			options: {
				data: {
					full_name: body.fullName,
					phone: body.phone,
					state: body.state,
					city: body.city,
					cep: body.cep,
				},
			},
		});

		if (linkError || !linkData.properties?.action_link) {
			await supabase.auth.admin.deleteUser(createdUserId).catch(() => undefined);
			res.status(500).json({ error: 'Nao foi possivel gerar o link de confirmacao.' });
			return;
		}

		await sendResendEmail({
			type: 'confirmSignup',
			to: email,
			name: body.fullName,
			confirmationUrl: linkData.properties.action_link,
		});

		res.status(200).json({ userId: createdUserId, requiresEmailConfirmation: true });
	} catch (error) {
		if (createdUserId) {
			await getSupabaseAdmin().auth.admin.deleteUser(createdUserId).catch(() => undefined);
		}

		console.error('Signup email flow failed:', error);
		res.status(500).json({
			error: 'Nao foi possivel enviar o e-mail.',
			details: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
