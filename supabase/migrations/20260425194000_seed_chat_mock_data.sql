-- Seed chat mock data for Futly Go conversation screens.

create or replace function public.seed_chat_mock_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  users uuid[];
  u1 uuid;
  u2 uuid;
  u3 uuid;
  u4 uuid;
  has_u2 boolean;
  has_u3 boolean;
  has_u4 boolean;
begin
  select array_agg(id order by created_at asc) into users from public.profiles;

  if coalesce(array_length(users, 1), 0) = 0 then
    raise notice 'seed_chat_mock_data skipped: no profiles available';
    return;
  end if;

  u1 := users[1];
  u2 := coalesce(users[2], users[1]);
  u3 := coalesce(users[3], users[2], users[1]);
  u4 := coalesce(users[4], users[3], users[2], users[1]);

  has_u2 := u2 <> u1;
  has_u3 := u3 <> u1;
  has_u4 := u4 <> u1;

  -- Matches used by chat list/screens.
  insert into public.matches (
    id, created_by, title, description, modality, match_date, match_time, turno,
    duration_minutes, price_per_person, min_age, max_age, accepted_levels, status,
    allow_external_reserves, rest_break, referee_included, venue_name, district,
    city, state, address, formation_json, facilities
  )
  values
    (
      '11111111-1111-1111-1111-111111111111',
      u1,
      'Arena Central - Quadra B',
      'Chat principal da partida de domingo',
      'futsal',
      current_date + 1,
      '19:30',
      'noite',
      90,
      25,
      16,
      55,
      array['casual','intermediario']::public.match_level[],
      'publicada',
      true,
      true,
      false,
      'Arena Central',
      'Cidade Baixa',
      'Porto Alegre',
      'RS',
      'R. dos Andradas, 1234',
      '{"mode":"futsal","slots":[{"key":"GOL","label":"Goleiro","open":true,"index":0},{"key":"FIXO","label":"Fixo","open":true,"index":1},{"key":"ALA_ESQ","label":"Ala Esq","open":true,"index":2},{"key":"ALA_DIR","label":"Ala Dir","open":true,"index":3},{"key":"PIVO","label":"Pivo","open":true,"index":4}]}'::jsonb,
      '[{"label":"Vestiario","selected":true}]'::jsonb
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      case when has_u2 then u2 else u1 end,
      'Estadio do Bairro',
      'Partida de sabado a tarde',
      'society',
      current_date + 2,
      '16:00',
      'tarde',
      90,
      40,
      16,
      55,
      array['intermediario']::public.match_level[],
      'publicada',
      true,
      false,
      false,
      'Estadio do Bairro',
      'Petropolis',
      'Porto Alegre',
      'RS',
      'Rua Exemplo, 456',
      '{"mode":"society","slots":[{"key":"GOL","label":"Goleiro","open":true,"index":0},{"key":"ZAG","label":"Zagueiro","open":true,"index":1},{"key":"MEI","label":"Meio","open":true,"index":2},{"key":"ATA","label":"Atacante","open":true,"index":3}]}'::jsonb,
      '[{"label":"Estacionamento","selected":true}]'::jsonb
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      u1,
      'CT Bola Cheia',
      'Partida quase lotada com aviso do sistema',
      'campo',
      current_date,
      '21:00',
      'noite',
      90,
      30,
      16,
      55,
      array['casual']::public.match_level[],
      'publicada',
      true,
      false,
      false,
      'CT Bola Cheia',
      'Zona Norte',
      'Porto Alegre',
      'RS',
      'Av. Exemplo, 999',
      '{"mode":"campo","slots":[{"key":"GOL","label":"Goleiro","open":true,"index":0},{"key":"DEF","label":"Defesa","open":true,"index":1},{"key":"MEI","label":"Meio","open":true,"index":2},{"key":"ATA","label":"Ataque","open":true,"index":3}]}'::jsonb,
      '[{"label":"Arbitro","selected":true}]'::jsonb
    ),
    (
      '44444444-4444-4444-4444-444444444444',
      case when has_u3 then u3 else u1 end,
      'Quadra Por-do-Sol',
      'Partida antiga para arquivamento',
      'futsal',
      current_date - 15,
      '19:00',
      'noite',
      90,
      20,
      16,
      55,
      array['casual']::public.match_level[],
      'finalizada',
      true,
      false,
      false,
      'Quadra Por-do-Sol',
      'Menino Deus',
      'Porto Alegre',
      'RS',
      'Rua do Sol, 88',
      '{"mode":"futsal","slots":[{"key":"GOL","label":"Goleiro","open":true,"index":0}]}'::jsonb,
      '[]'::jsonb
    ),
    (
      '55555555-5555-5555-5555-555555555555',
      case when has_u4 then u4 else u1 end,
      'Copa do Bairro R3',
      'Partida antiga com pendencia de avaliacao',
      'society',
      current_date - 11,
      '18:00',
      'noite',
      90,
      35,
      16,
      55,
      array['intermediario']::public.match_level[],
      'finalizada',
      true,
      false,
      false,
      'Copa do Bairro R3',
      'Centro',
      'Porto Alegre',
      'RS',
      'Rua da Copa, 10',
      '{"mode":"society","slots":[{"key":"GOL","label":"Goleiro","open":true,"index":0}]}'::jsonb,
      '[]'::jsonb
    )
  on conflict (id) do update
  set
    title = excluded.title,
    venue_name = excluded.venue_name,
    match_date = excluded.match_date,
    match_time = excluded.match_time,
    updated_at = now();

  -- Participants for category filters.
  insert into public.match_participants (match_id, user_id, position_key, position_label, status, is_host)
  select distinct on (row_data.match_id, row_data.user_id)
    row_data.match_id,
    row_data.user_id,
    row_data.position_key,
    row_data.position_label,
    row_data.status,
    row_data.is_host
  from (
    values
      ('11111111-1111-1111-1111-111111111111'::uuid, u1, 'GOL', 'Host', 'confirmado'::public.participant_status, true),
      ('11111111-1111-1111-1111-111111111111'::uuid, u2, 'FIXO', 'Fixo', 'confirmado'::public.participant_status, false),
      ('11111111-1111-1111-1111-111111111111'::uuid, u3, 'ALA_ESQ', 'Ala', 'confirmado'::public.participant_status, false),
      ('22222222-2222-2222-2222-222222222222'::uuid, case when has_u2 then u2 else u1 end, 'GOL', 'Host', 'confirmado'::public.participant_status, true),
      ('22222222-2222-2222-2222-222222222222'::uuid, u1, 'ATA', 'Jogador', 'confirmado'::public.participant_status, false),
      ('33333333-3333-3333-3333-333333333333'::uuid, u1, 'GOL', 'Host', 'confirmado'::public.participant_status, true),
      ('44444444-4444-4444-4444-444444444444'::uuid, case when has_u3 then u3 else u1 end, 'GOL', 'Host', 'confirmado'::public.participant_status, true),
      ('44444444-4444-4444-4444-444444444444'::uuid, u1, 'ATA', 'Jogador', 'confirmado'::public.participant_status, false),
      ('55555555-5555-5555-5555-555555555555'::uuid, case when has_u4 then u4 else u1 end, 'GOL', 'Host', 'confirmado'::public.participant_status, true),
      ('55555555-5555-5555-5555-555555555555'::uuid, u1, 'MEI', 'Jogador', 'confirmado'::public.participant_status, false)
  ) as row_data(match_id, user_id, position_key, position_label, status, is_host)
  where row_data.user_id is not null
  order by row_data.match_id, row_data.user_id, row_data.is_host desc
  on conflict (match_id, user_id) do update
  set
    status = excluded.status,
    is_host = excluded.is_host,
    position_key = excluded.position_key,
    position_label = excluded.position_label,
    updated_at = now();

  perform public.sync_match_conversation_participants('11111111-1111-1111-1111-111111111111');
  perform public.sync_match_conversation_participants('22222222-2222-2222-2222-222222222222');
  perform public.sync_match_conversation_participants('33333333-3333-3333-3333-333333333333');
  perform public.sync_match_conversation_participants('44444444-4444-4444-4444-444444444444');
  perform public.sync_match_conversation_participants('55555555-5555-5555-5555-555555555555');

  -- Private conversation.
  if has_u2 then
    insert into public.conversations (id, type, match_id, created_by, is_archived)
    values ('66666666-6666-6666-6666-666666666666', 'private', null, u1, false)
    on conflict (id) do nothing;

    insert into public.conversation_participants (conversation_id, user_id, role, last_read_at)
    values
      ('66666666-6666-6666-6666-666666666666', u1, 'player', now() - interval '1 hour'),
      ('66666666-6666-6666-6666-666666666666', u2, 'player', now() - interval '1 hour')
    on conflict (conversation_id, user_id) do update
    set role = excluded.role;
  end if;

  -- System + user messages for active and archived items.
  insert into public.messages (id, conversation_id, sender_id, content, message_type, created_at)
  values
    ('aaaaaaa1-0000-0000-0000-000000000001', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u1, 'Fala galera! Confirmacao geral ate 17h, beleza? Quem nao confirmar a vaga libera.', 'user', now() - interval '2 hours'),
    ('aaaaaaa1-0000-0000-0000-000000000002', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u2, 'Confirmado aqui chefe, levo a bola', 'user', now() - interval '112 minutes'),
    ('aaaaaaa1-0000-0000-0000-000000000003', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u1, 'To dentro! Posicao: Pivo. Quanto fica o pix?', 'user', now() - interval '106 minutes'),
    ('aaaaaaa1-0000-0000-0000-000000000004', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u1, 'R$ 25 cada. Pix do CNPJ ai em cima da partida. Aceita ate 18h30', 'user', now() - interval '101 minutes'),
    ('aaaaaaa1-0000-0000-0000-000000000005', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), null, 'Carla S. confirmou presenca', 'system', now() - interval '53 minutes'),
    ('aaaaaaa1-0000-0000-0000-000000000006', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u2, 'Galera, alguem tem espaco de carona vindo do Menino Deus?', 'user', now() - interval '36 minutes'),
    ('aaaaaaa1-0000-0000-0000-000000000007', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u1, 'Eu vou pelo Menino Deus tbm! Te chamo no privado', 'user', now() - interval '34 minutes'),
    ('aaaaaaa1-0000-0000-0000-000000000008', (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111'), u2, 'Gente, vamos chegar 19h15 que ai da tempo de aquecer', 'user', now() - interval '2 minutes'),

    ('bbbbbbb2-0000-0000-0000-000000000001', (select id from public.conversations where match_id = '22222222-2222-2222-2222-222222222222'), u2, 'Confirmado pra mim! Levo 2 garrafas d''agua', 'user', now() - interval '12 minutes'),

    ('ccccccc3-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', u1, 'To com o uniforme amarelo, ve se acha igual', 'user', now() - interval '1 hour'),

    ('ddddddd4-0000-0000-0000-000000000001', (select id from public.conversations where match_id = '33333333-3333-3333-3333-333333333333'), null, 'Partida confirmada! 14/14 vagas preenchidas.', 'system', now() - interval '1 day'),

    ('eeeeeee5-0000-0000-0000-000000000001', (select id from public.conversations where match_id = '44444444-4444-4444-4444-444444444444'), u3, 'Foi muito bom! 5 estrelas pro host', 'user', now() - interval '8 days'),
    ('fffffff6-0000-0000-0000-000000000001', (select id from public.conversations where match_id = '55555555-5555-5555-5555-555555555555'), null, 'Avalie os atletas da partida (+50 XP)', 'system', now() - interval '4 days')
  on conflict (id) do nothing;

  -- Unread counters aligned with mock screenshot behavior.
  update public.conversation_participants
  set last_read_at = now() - interval '40 minutes'
  where conversation_id = (select id from public.conversations where match_id = '11111111-1111-1111-1111-111111111111')
    and user_id = u1;

  update public.conversation_participants
  set last_read_at = now() - interval '20 minutes'
  where conversation_id = (select id from public.conversations where match_id = '22222222-2222-2222-2222-222222222222')
    and user_id = u1;

  update public.conversation_participants
  set last_read_at = now() - interval '2 hours'
  where conversation_id = (select id from public.conversations where match_id = '55555555-5555-5555-5555-555555555555')
    and user_id = u1;

  -- Force archived conversations section in list.
  update public.conversations
  set is_archived = true,
      archived_at = now() - interval '1 day'
  where match_id in ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');

  perform public.archive_expired_match_conversations();
end;
$$;

select public.seed_chat_mock_data();
