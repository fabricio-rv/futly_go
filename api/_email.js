function getFromEmail() {
	const fromEmail = process.env.RESEND_FROM_EMAIL || 'Futly Go <suporte@futlygo.com.br>';
	return fromEmail.includes('<') ? fromEmail : `Futly Go <${fromEmail}>`;
}

function getTemplate(payload) {
	if (payload.type === 'confirmSignup') {
		return {
			subject: 'Confirme seu cadastro no Futly Go',
			html: `
				<div style="font-family: Arial, sans-serif; color: #05070B; background: #F3F6FB; padding: 20px;">
					<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;">
						<h1 style="color: #22B76C; margin: 0 0 16px 0;">Confirme seu e-mail</h1>
						<p style="margin: 0 0 16px 0; color: #5B6B80;">Ola, ${payload.name}. Clique no botao abaixo para ativar sua conta no Futly Go.</p>
						<a href="${payload.confirmationUrl}" style="display: inline-block; background: #22B76C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Confirmar cadastro</a>
						<p style="margin: 18px 0 0 0; color: #5B6B80; font-size: 13px;">Se o botao nao funcionar, copie e cole este link no navegador:</p>
						<p style="word-break: break-all; color: #1F2937; font-size: 13px;">${payload.confirmationUrl}</p>
					</div>
				</div>
			`,
		};
	}

	if (payload.type === 'welcome') {
		return {
			subject: 'Bem-vindo ao Futly Go!',
			html: `<p>Ola, ${payload.name}. Sua conta foi criada com sucesso no Futly Go.</p>`,
		};
	}

	if (payload.type === 'passwordResetCode') {
		return {
			subject: 'Codigo para redefinir sua senha Futly Go',
			html: `<p>Use este codigo para redefinir sua senha:</p><h1>${payload.code}</h1>`,
		};
	}

	if (payload.type === 'matchCreated') {
		return {
			subject: 'Sua partida foi criada!',
			html: `<p>${payload.hostName}, sua partida ${payload.matchTitle} foi criada para ${payload.date} as ${payload.time}.</p>`,
		};
	}

	if (payload.type === 'playerJoined') {
		return {
			subject: `${payload.playerName} confirmou presenca!`,
			html: `<p>${payload.playerName} confirmou presenca em ${payload.matchTitle} no dia ${payload.date} as ${payload.time}.</p>`,
		};
	}

	return {
		subject: 'Voce confirmou na partida!',
		html: `<p>${payload.playerName}, voce confirmou presenca em ${payload.matchTitle}, ${payload.location}, no dia ${payload.date} as ${payload.time}.</p>`,
	};
}

async function sendResendEmail(payload) {
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		throw new Error('RESEND_API_KEY is not configured');
	}

	const template = getTemplate(payload);
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: getFromEmail(),
			to: payload.to,
			subject: template.subject,
			html: template.html,
		}),
	});

	const responseText = await response.text();
	const responseBody = responseText ? JSON.parse(responseText) : null;

	if (!response.ok) {
		throw new Error(JSON.stringify(responseBody || { status: response.status }));
	}

	return responseBody;
}

module.exports = { sendResendEmail };
