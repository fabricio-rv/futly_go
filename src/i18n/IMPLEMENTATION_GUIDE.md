# Guia de Implementação - Sistema de Internacionalização (i18n)

## 📋 Visão Geral

Sistema profissional de internacionalização para Futly Go com suporte a:
- 🇧🇷 Português (Brasil) - Padrão
- 🇵🇹 Português (Portugal)
- 🇺🇸 Inglês (US)
- 🇪🇸 Espanhol (Espanha)

**Arquitetura:**
- Modular e escalável
- Type-safe com TypeScript
- Namespaces separados por tela/funcionalidade
- Zero dependências externas (sem i18next no início, mas preparado para integração)

---

## 🚀 Guia de Integração

### 1. Instalar i18next (opcional, para persistência avançada)

```bash
npm install i18next i18next-react-native-async-storage
npm install --save-dev @types/i18next
```

### 2. Importar no App Principal

```typescript
// src/components/layout/AppProviders.tsx
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppProviders: React.FC = ({ children }) => {
  const [language, setLanguage] = React.useState<Locale>('pt-BR');

  React.useEffect(() => {
    // Carregar idioma salvo no AsyncStorage
    AsyncStorage.getItem('futly_go_language').then((lang) => {
      if (lang && isSupportedLanguage(lang)) {
        setLanguage(lang);
      }
    });
  }, []);

  return (
    <View>
      {/* Seu contexto de idioma aqui */}
      {children}
    </View>
  );
};
```

---

## 📁 Estrutura de Diretórios

```
src/i18n/
├── index.ts                          # Configuração central e exports
├── types.ts                          # Type definitions
├── IMPLEMENTATION_GUIDE.md           # Este arquivo
│
├── locales/
│   ├── pt-BR/
│   │   ├── common.ts                 # Termos comuns (nav, ações, etc)
│   │   ├── login.ts                  # Tela de autenticação
│   │   ├── dashboard.ts              # Tela inicial
│   │   ├── matches.ts                # Gerenciamento de partidas
│   │   ├── profile.ts                # Perfil de usuário
│   │   ├── errors.ts                 # Mensagens de erro
│   │   └── index.ts                  # Export centralizado
│   │
│   ├── pt-PT/
│   │   ├── common.ts
│   │   ├── login.ts
│   │   └── ... (estrutura idêntica)
│   │
│   ├── en-US/
│   │   ├── common.ts
│   │   ├── login.ts
│   │   └── ... (estrutura idêntica)
│   │
│   └── es-ES/
│       ├── common.ts
│       ├── login.ts
│       └── ... (estrutura idêntica)
│
├── hooks/
│   └── useTranslation.ts             # Custom hook para traduções
│
└── components/
    └── LanguageSwitcher.tsx          # Seletor de idioma
```

---

## 💻 Exemplos de Uso

### Exemplo 1: Hook Básico

```typescript
import { useTranslation } from '@/i18n/hooks/useTranslation';

export const LoginScreen: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation('login');

  return (
    <View>
      <Text>{t('title')}</Text>
      <TextInput placeholder={t('fields.emailPlaceholder')} />
      <Button title={t('buttons.login')} />
    </View>
  );
};
```

### Exemplo 2: Interpolação (Variáveis)

```typescript
const { t } = useTranslation('dashboard');

// Na tradução: 'welcome': 'Bem-vindo, {{name}}!'
const message = t('headers.welcome', undefined, { name: 'João' });
// Resultado: "Bem-vindo, João!"
```

### Exemplo 3: Erro do Servidor

```typescript
import { useTranslation } from '@/i18n/hooks/useTranslation';

export const ErrorHandler = ({ error }: { error: Error }) => {
  const { t } = useTranslation('errors');

  const getErrorMessage = (error: any): string => {
    // Erro do Supabase - Email já existe
    if (error.message.includes('duplicate key')) {
      return t('auth.emailAlreadyExists');
    }

    // Erro genérico
    return t('general.unknownError');
  };

  return <Text style={styles.error}>{getErrorMessage(error)}</Text>;
};
```

### Exemplo 4: Tradução de Listas

```typescript
import { useTranslationList } from '@/i18n/hooks/useTranslation';

export const PositionSelector = () => {
  const tPosition = useTranslationList('login', 'positions');

  const positions = [
    { id: 'goleiro', label: tPosition('goleiro') },
    { id: 'lateral', label: tPosition('lateral') },
    { id: 'zagueiro', label: tPosition('zagueiro') },
  ];

  return (
    <FlatList
      data={positions}
      renderItem={({ item }) => <Text>{item.label}</Text>}
    />
  );
};
```

### Exemplo 5: Mudar Idioma em Tempo Real

```typescript
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useTranslation } from '@/i18n/hooks/useTranslation';

export const SettingsScreen = () => {
  const { currentLanguage } = useTranslation('common');

  return (
    <View>
      <LanguageSwitcher
        compact={false}
        onLanguageChange={(newLang) => {
          console.log('Idioma mudou para:', newLang);
          // Recarregar dados se necessário
        }}
      />
    </View>
  );
};
```

---

## 🎯 Melhores Práticas

### 1. Organização de Namespaces

Cada tela/funcionalidade tem seu próprio namespace:

```
- common     → Termos reutilizáveis (botões, ações, datas)
- login      → Autenticação
- dashboard  → Tela inicial
- matches    → Gerenciamento de partidas
- profile    → Perfil de usuário
- errors     → Mensagens de erro
```

### 2. Nomenclatura de Chaves

Use notação de ponto para aninhamento:

```typescript
// ✅ BOM
t('fields.emailPlaceholder')
t('buttons.login')
t('messages.welcome')

// ❌ RUIM
t('email_placeholder')
t('loginButton')
t('welcome_message')
```

### 3. Type Safety

```typescript
// src/i18n/types.ts fornece tipos para validação
type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'es-ES';

// Use em funções que lidam com idioma
function setLanguage(lang: Locale) {
  // TypeScript vai reclamar se passar algo inválido
}
```

### 4. Interpolação em Traduções

```typescript
// Na tradução
{ 
  'matchesPlayed': 'Você jogou {{count}} partidas este mês'
}

// No código
t('dashboard.matchesPlayed', undefined, { count: 15 })
// Resultado: "Você jogou 15 partidas este mês"
```

### 5. Valores Padrão

```typescript
// Fornecer valor padrão em caso de tradução não encontrada
const { t } = useTranslation('myNamespace');
t('nonexistentKey', 'Fallback Value')
// Resultado: "Fallback Value"
```

---

## 📝 Checklist para Adicionar Nova Tela

Ao adicionar uma nova tela, siga este checklist:

- [ ] Criar arquivo de tradução em cada idioma:
  - [ ] `src/i18n/locales/pt-BR/myscreen.ts`
  - [ ] `src/i18n/locales/pt-PT/myscreen.ts`
  - [ ] `src/i18n/locales/en-US/myscreen.ts`
  - [ ] `src/i18n/locales/es-ES/myscreen.ts`

- [ ] Atualizar tipos em `src/i18n/types.ts` (TranslationResource)

- [ ] Atualizar `I18N_CONFIG.namespaces` em `src/i18n/types.ts`

- [ ] Adicionar exports em cada `locales/[lang]/index.ts`

- [ ] Traduzir TUDO:
  - [ ] Labels de inputs
  - [ ] Placeholders
  - [ ] Botões e CTAs
  - [ ] Mensagens de erro
  - [ ] Mensagens de sucesso
  - [ ] Mensagens motivacionais
  - [ ] Dicas e ajuda

- [ ] Usar hook `useTranslation('myscreen')` na tela

---

## 🌐 Diferenças Regionais (PT-BR vs PT-PT)

### PT-BR (Brasil)
```typescript
{
  team: 'Time',
  squad: 'Elenco',
  match: 'Partida',
  soccer: 'Futebol',
}
```

### PT-PT (Portugal)
```typescript
{
  team: 'Equipa',
  squad: 'Plantel',
  match: 'Jogo',
  soccer: 'Futebol',
}
```

**Palavra-chave:** Procure por comentários `// PT-PT:` nos arquivos para diferenças importantes.

---

## 🔄 Fluxo de Persistência de Idioma

```
1. Usuário abre app
   ↓
2. AppProviders verifica AsyncStorage('futly_go_language')
   ↓
3. Se encontrar, usa aquele idioma; senão, usa padrão (pt-BR)
   ↓
4. LanguageSwitcher permite mudança
   ↓
5. Novo idioma é salvo em AsyncStorage
   ↓
6. App é notificado via callback
   ↓
7. UI é re-renderizada com novas traduções
```

---

## 🐛 Troubleshooting

### Problema: Tradução não aparece

```typescript
// Verificar:
1. Namespace está correto?
   const { t } = useTranslation('matches'); // 'matches' existe?

2. Chave está correta?
   t('create.title') // 'create' e 'title' existem?

3. Idioma é suportado?
   isSupportedLanguage(lang) // Retorna true?
```

### Problema: Interpolação não funciona

```typescript
// ERRADO - espaços extras
t('key', undefined, { name: 'João' })
// {{name}} não funciona se tiver espaços

// CORRETO - sem espaços
// Na tradução use: "{{ name }}" com espaços
// Ou atualize regex em useTranslation.ts
```

### Problema: AsyncStorage não salva

```typescript
// Verificar:
1. AsyncStorage está importado?
import AsyncStorage from '@react-native-async-storage/async-storage';

2. Permissões estão configuradas? (Android)
3. App tem acesso para escrever em AsyncStorage?
```

---

## 📚 Recursos Adicionais

### Para Integração Completa com i18next (futuro)

```bash
npm install i18next i18next-react-native-async-storage
```

```typescript
// src/i18n/i18nConfig.ts
import i18n from 'i18next';
import { initReactI18next } from 'i18next-react-native';
import AsyncStorageBackend from 'i18next-react-native-async-storage';

i18n
  .use(AsyncStorageBackend)
  .use(initReactI18next)
  .init(i18nConfig);

export default i18n;
```

### Variáveis de Ambiente

```env
# .env
DEFAULT_LANGUAGE=pt-BR
FALLBACK_LANGUAGE=en-US
```

---

## ✅ Status de Tradução

| Idioma | Status | Completude |
|--------|--------|-----------|
| 🇧🇷 PT-BR | ✅ Completo | 100% |
| 🇵🇹 PT-PT | ⏳ Pendente | 0% |
| 🇺🇸 EN-US | ✅ Completo | 100% |
| 🇪🇸 ES-ES | ⏳ Pendente | 0% |

---

## 🤝 Contribuindo

Para adicionar/atualizar traduções:

1. Edite o arquivo específico: `src/i18n/locales/[lang]/[namespace].ts`
2. Mantenha a mesma estrutura em TODOS os idiomas
3. Valide a ortografia e tom (esportivo, motivacional)
4. Teste com `useTranslation` hook
5. Commit com mensagem clara: `i18n: Add/Update [namespace] translations for [lang]`

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte examples em `LanguageSwitcher.tsx`
3. Abra issue no repositório com detalhes

---

**Última atualização:** 26 de Abril de 2026
**Versão:** 1.0.0
**Manutenedor:** Futly Go Team
