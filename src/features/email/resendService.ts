import { emailTemplates } from './templates';

const RESEND_API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY || '';
const FROM_EMAIL = 'Futly Go <suporte@futlygo.com.br>';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      console.error('Resend API error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Email send failed:', error);
    return null;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const template = emailTemplates.welcome(name);
  return sendEmail({ to: email, ...template });
}

export async function sendMatchCreatedEmail(hostEmail: string, hostName: string, matchTitle: string, date: string, time: string) {
  const template = emailTemplates.matchCreated(hostName, matchTitle, date, time);
  return sendEmail({ to: hostEmail, ...template });
}

export async function sendPlayerJoinedEmail(hostEmail: string, playerName: string, matchTitle: string, date: string, time: string) {
  const template = emailTemplates.playerJoined(playerName, matchTitle, date, time);
  return sendEmail({ to: hostEmail, ...template });
}

export async function sendPlayerConfirmationEmail(playerEmail: string, playerName: string, matchTitle: string, location: string, date: string, time: string) {
  const template = emailTemplates.playerConfirmation(playerName, matchTitle, location, date, time);
  return sendEmail({ to: playerEmail, ...template });
}
