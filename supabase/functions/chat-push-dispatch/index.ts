import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.1';

type OutboxRow = {
  id: string;
  recipient_profile_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { data, error } = await supabase
    .from('chat_push_outbox')
    .select('id,recipient_profile_id,title,body,data')
    .is('sent_at', null)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as OutboxRow[];
  const tickets: Array<{ outboxId: string; ok: boolean; error?: string }> = [];

  for (const row of rows) {
    const { data: tokenRows, error: tokenError } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('profile_id', row.recipient_profile_id);

    if (tokenError) {
      await supabase
        .from('chat_push_outbox')
        .update({ error: tokenError.message })
        .eq('id', row.id);
      tickets.push({ outboxId: row.id, ok: false, error: tokenError.message });
      continue;
    }

    const messages = (tokenRows ?? []).map((token) => ({
      to: token.expo_push_token,
      sound: 'default',
      channelId: 'chat',
      title: row.title,
      body: row.body,
      data: row.data,
    }));

    if (messages.length === 0) {
      await supabase
        .from('chat_push_outbox')
        .update({ sent_at: new Date().toISOString(), error: 'no_push_token' })
        .eq('id', row.id);
      tickets.push({ outboxId: row.id, ok: false, error: 'no_push_token' });
      continue;
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const body = await response.text();
    await supabase
      .from('chat_push_outbox')
      .update({
        sent_at: response.ok ? new Date().toISOString() : null,
        error: response.ok ? null : body.slice(0, 500),
      })
      .eq('id', row.id);

    tickets.push({ outboxId: row.id, ok: response.ok, error: response.ok ? undefined : body });
  }

  return Response.json({ processed: tickets.length, tickets });
});
