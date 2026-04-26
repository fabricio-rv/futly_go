import { emailTemplates } from '../src/features/email/templates';

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    end?: () => void;
  };
};

type EmailPayload =
  | { type: 'welcome'; to: string; name: string }
  | { type: 'confirmSignup'; to: string; name: string; confirmationUrl: string }
  | { type: 'passwordResetCode'; to: string; code: string }
  | { type: 'matchCreated'; to: string; hostName: string; matchTitle: string; date: string; time: string }
  | { type: 'playerJoined'; to: string; playerName: string; matchTitle: string; date: string; time: string }
  | { type: 'playerConfirmation'; to: string; playerName: string; matchTitle: string; location: string; date: string; time: string };

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseBody(body: unknown) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return null;
    }
  }

  return body;
}

function isEmailPayload(value: unknown): value is EmailPayload {
  if (!value || typeof value !== 'object') return false;

  const payload = value as Record<string, unknown>;
  if (!isString(payload.to) || !isString(payload.type)) return false;

  if (payload.type === 'welcome') {
    return isString(payload.name);
  }

  if (payload.type === 'confirmSignup') {
    return isString(payload.name) && isString(payload.confirmationUrl);
  }

  if (payload.type === 'passwordResetCode') {
    return isString(payload.code);
  }

  if (payload.type === 'matchCreated') {
    return isString(payload.hostName) && isString(payload.matchTitle) && isString(payload.date) && isString(payload.time);
  }

  if (payload.type === 'playerJoined') {
    return isString(payload.playerName) && isString(payload.matchTitle) && isString(payload.date) && isString(payload.time);
  }

  if (payload.type === 'playerConfirmation') {
    return (
      isString(payload.playerName) &&
      isString(payload.matchTitle) &&
      isString(payload.location) &&
      isString(payload.date) &&
      isString(payload.time)
    );
  }

  return false;
}

function getTemplate(payload: EmailPayload) {
  if (payload.type === 'welcome') return emailTemplates.welcome(payload.name);

  if (payload.type === 'confirmSignup') {
    return emailTemplates.confirmSignup(payload.name, payload.confirmationUrl);
  }

  if (payload.type === 'passwordResetCode') return emailTemplates.passwordResetCode(payload.code);

  if (payload.type === 'matchCreated') {
    return emailTemplates.matchCreated(payload.hostName, payload.matchTitle, payload.date, payload.time);
  }

  if (payload.type === 'playerJoined') {
    return emailTemplates.playerJoined(payload.playerName, payload.matchTitle, payload.date, payload.time);
  }

  return emailTemplates.playerConfirmation(
    payload.playerName,
    payload.matchTitle,
    payload.location,
    payload.date,
    payload.time,
  );
}

function getFromEmail() {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Futly Go <suporte@futlygo.com.br>';

  if (fromEmail.includes('<')) {
    return fromEmail;
  }

  return `Futly Go <${fromEmail}>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).json(null);
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.EXPO_PUBLIC_RESEND_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
    return;
  }

  const payload = parseBody(req.body);

  if (!isEmailPayload(payload)) {
    res.status(400).json({ error: 'Invalid email payload' });
    return;
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

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Resend API error:', response.status, responseBody);
    res.status(response.status).json({ error: 'Resend email failed', details: responseBody });
    return;
  }

  res.status(200).json(responseBody);
}
