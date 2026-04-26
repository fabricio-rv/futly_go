import { getApiUrl } from '@/src/lib/api';

type EmailPayload =
  | { type: 'welcome'; to: string; name: string }
  | { type: 'matchCreated'; to: string; hostName: string; matchTitle: string; date: string; time: string }
  | { type: 'playerJoined'; to: string; playerName: string; matchTitle: string; date: string; time: string }
  | { type: 'playerConfirmation'; to: string; playerName: string; matchTitle: string; location: string; date: string; time: string };

async function sendEmail(payload: EmailPayload) {
  try {
    const response = await fetch(getApiUrl('/api/send-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => response.statusText);
      console.error('Email API error:', details || response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Email send failed:', error);
    return null;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({ type: 'welcome', to: email, name });
}

export async function sendMatchCreatedEmail(hostEmail: string, hostName: string, matchTitle: string, date: string, time: string) {
  return sendEmail({ type: 'matchCreated', to: hostEmail, hostName, matchTitle, date, time });
}

export async function sendPlayerJoinedEmail(hostEmail: string, playerName: string, matchTitle: string, date: string, time: string) {
  return sendEmail({ type: 'playerJoined', to: hostEmail, playerName, matchTitle, date, time });
}

export async function sendPlayerConfirmationEmail(playerEmail: string, playerName: string, matchTitle: string, location: string, date: string, time: string) {
  return sendEmail({ type: 'playerConfirmation', to: playerEmail, playerName, matchTitle, location, date, time });
}
