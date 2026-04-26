const {
	handleOptions,
	isString,
	parseBody,
	setCorsHeaders,
} = require('./_auth');
const { sendResendEmail } = require('./_email');

function isEmailPayload(value) {
	if (!value || typeof value !== 'object') return false;
	if (!isString(value.to) || !isString(value.type)) return false;

	if (value.type === 'welcome') return isString(value.name);
	if (value.type === 'confirmSignup') return isString(value.name) && isString(value.confirmationUrl);
	if (value.type === 'passwordResetCode') return isString(value.code);
	if (value.type === 'matchCreated') return isString(value.hostName) && isString(value.matchTitle) && isString(value.date) && isString(value.time);
	if (value.type === 'playerJoined') return isString(value.playerName) && isString(value.matchTitle) && isString(value.date) && isString(value.time);

	if (value.type === 'playerConfirmation') {
		return (
			isString(value.playerName) &&
			isString(value.matchTitle) &&
			isString(value.location) &&
			isString(value.date) &&
			isString(value.time)
		);
	}

	return false;
}

module.exports = async function handler(req, res) {
	setCorsHeaders(res);

	if (handleOptions(req, res)) return;

	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	try {
		const payload = parseBody(req.body);

		if (!isEmailPayload(payload)) {
			res.status(400).json({ error: 'Invalid email payload' });
			return;
		}

		const result = await sendResendEmail(payload);
		res.status(200).json(result);
	} catch (error) {
		console.error('Send email failed:', error);
		res.status(500).json({
			error: 'Resend email failed',
			details: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
