import {
	handleOptions,
	setCorsHeaders,
	type VercelRequest,
	type VercelResponse,
} from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	setCorsHeaders(res);

	if (handleOptions(req, res)) return;

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	const apiKey = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY;
	const fromEmail = process.env.RESEND_FROM_EMAIL || 'Futly Go <suporte@futlygo.com.br>';

	console.log('Testing email send:', {
		hasApiKey: !!apiKey,
		fromEmail,
		timestamp: new Date().toISOString(),
	});

	if (!apiKey) {
		res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
		return;
	}

	try {
		const testEmail = {
			from: fromEmail,
			to: 'test@example.com', // Email de teste que não será enviado realmente
			subject: 'Test Email - Futly Go',
			html: '<p>This is a test email to verify Resend configuration.</p>',
		};

		console.log('Sending test email with payload:', {
			from: testEmail.from,
			to: testEmail.to,
			subject: testEmail.subject,
		});

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(testEmail),
		});

		const responseBody = await response.json().catch(() => null);

		console.log('Resend response:', {
			status: response.status,
			ok: response.ok,
			body: responseBody,
		});

		if (!response.ok) {
			res.status(response.status).json({
				error: 'Resend API failed',
				details: responseBody,
				timestamp: new Date().toISOString(),
			});
			return;
		}

		res.status(200).json({
			success: true,
			messageId: responseBody?.id,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Email test failed:', error);
		res.status(500).json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString(),
		});
	}
}