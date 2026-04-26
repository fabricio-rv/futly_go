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

type SignupBody = {
	email: string;
	password: string;
	fullName: string;
	phone: string | null;
	state: string | null;
	city: string | null;
	cep: string | null;
};

function isSignupBody(value: unknown): value is SignupBody {
	if (!value || typeof value !== 'object') return false;

	const body = value as Record<string, unknown>;
	return isString(body.email) && isString(body.password) && isString(body.fullName);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

	try {
		console.log('Starting signup process for:', body.email);
		const supabase = getSupabaseAdmin();
		const email = body.email.trim().toLowerCase();

		console.log('Creating user:', { email, hasPassword: !!body.password });

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

		console.log('User creation result:', {
			success: !!data.user,
			userId: data.user?.id,
			error: error?.message
		});

		if (error || !data.user) {
			console.log('User creation failed, sending error response');
			res.status(400).json({ error: normalizeAuthMessage(error?.message || 'Não foi possível criar a conta no momento.') });
			return;
		}

		console.log('User created successfully, generating confirmation link');

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

		console.log('Link generation result:', {
			success: !!linkData.properties?.action_link,
			hasEmailOtp: !!linkData.properties?.email_otp,
			error: linkError?.message
		});

		if (linkError || !linkData.properties?.action_link) {
			console.log('Link generation failed, deleting user and returning error');
			await supabase.auth.admin.deleteUser(data.user.id).catch(() => undefined);
			res.status(500).json({ error: 'Error sending confirmation email' });
			return;
		}

		console.log('Link generated, sending confirmation email to:', email);

		try {
			await sendEmail({
				type: 'confirmSignup',
				to: email,
				name: body.fullName,
				confirmationUrl: linkData.properties.action_link,
			});
			console.log('Confirmation email sent successfully');
		} catch (emailError) {
			console.log('Email sending failed:', emailError);
			await supabase.auth.admin.deleteUser(data.user.id).catch(() => undefined);
			res.status(500).json({ error: 'Error sending confirmation email' });
			return;
		}

		console.log('Signup completed successfully');
		res.status(200).json({ userId: data.user.id, requiresEmailConfirmation: true });
	} catch (error) {
		console.error('Signup email flow failed:', error);
		res.status(500).json({ error: 'Error sending confirmation email' });
	}
}
