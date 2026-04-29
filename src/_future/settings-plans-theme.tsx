/**
 * FUTURAS IMPLEMENTAÇÕES — Configurações: Planos, Pagamento e Tema
 *
 * Estes blocos foram removidos temporariamente da tela de Configurações.
 * Quando prontos para reintegrar, copiar de volta para app/(app)/settings.tsx
 * nas seções correspondentes (accountRows e preferenceRows).
 */

// ─── accountRows: Plano e pagamento ──────────────────────────────────────────
/*
{
  id: 'plan',
  icon: <Star size={16} color="currentColor" strokeWidth={2} />,
  iconTone: 'gold',
  title: t('settings.planPayment', 'Plano e pagamento'),
  subtitle: t('settings.planPaymentSubtitle', 'Gold - Renova 10/05'),
  rightLabel: t('actions.manage', 'Gerenciar'),
  showArrow: true,
  onPress: () => router.push('/(app)/plan'),
},
*/

// ─── accountRows: Planos (pacotes e benefícios) ───────────────────────────────
/*
{
  id: 'store',
  icon: <Store size={16} color="currentColor" strokeWidth={2} />,
  iconTone: 'default',
  title: t('settings.plans', 'Planos'),
  subtitle: t('settings.plansSubtitle', 'Ver pacotes e benefícios dos planos'),
  showArrow: true,
  onPress: () => router.push('/(app)/store'),
},
*/

// ─── preferenceRows: Tema claro/escuro ────────────────────────────────────────
/*
{
  id: 'theme',
  icon: settings?.theme === 'dark'
    ? <Moon size={16} color="currentColor" strokeWidth={2} />
    : <Sun size={16} color="currentColor" strokeWidth={2} />,
  iconTone: 'default',
  title: t('settings.theme', 'Tema'),
  subtitle: settings?.theme === 'dark' ? t('dark', 'Escuro') : t('light', 'Claro'),
  rightLabel: settings?.theme === 'dark' ? t('dark', 'Escuro') : t('light', 'Claro'),
  showArrow: true,
  onPress: () => setTheme(settings?.theme === 'dark' ? 'light' : 'dark').catch(() => undefined),
},
*/

// ─── Header do settings: botão ">" de atalho para editar perfil ───────────────
/*
<TouchableScale
  onPress={() => router.push('/(app)/edit-profile')}
  className="h-9 w-9 rounded-[12px] border items-center justify-center"
  style={{
    borderColor: theme === 'light' ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)',
    backgroundColor: theme === 'light' ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.10)',
  }}
>
  <Text variant="body" className="text-[#1F2937] dark:text-white">&gt;</Text>
</TouchableScale>
*/

// ─── Header do settings: "- Plano Gold" no subtítulo do email ─────────────────
/*
  {profile?.email ?? 'email@example.com'} - Plano Gold
*/
