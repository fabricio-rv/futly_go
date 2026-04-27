# 🌍 Futly Go - Sistema de Internacionalização (i18n)

![Portuguese](https://img.shields.io/badge/Portuguese%20(BR)-✅%20100%25-brightgreen)
![Portuguese](https://img.shields.io/badge/Portuguese%20(PT)-⏳%200%25-orange)
![English](https://img.shields.io/badge/English%20(US)-✅%20100%25-brightgreen)
![Spanish](https://img.shields.io/badge/Spanish%20(ES)-⏳%200%25-orange)

Sistema profissional, modular e escalável de internacionalização para Futly Go com suporte a 4 idiomas.

## ✨ Características

- ✅ **Type-Safe**: 100% TypeScript com type checking completo
- 📦 **Modular**: Um arquivo por tela/funcionalidade
- 🎯 **Namespace System**: Carregamento otimizado por namespace
- 🌍 **4 Idiomas**: PT-BR, PT-PT, EN-US, ES-ES
- 💾 **Persistência**: Salva preferência de idioma com AsyncStorage
- ⚡ **Zero Config**: Pronto para usar, sem dependências obrigatórias
- 🎨 **Esportivo**: Tom motivacional e engajador
- 📊 **Escalável**: Fácil adicionar novos idiomas e telas

## 🚀 Quick Start

### 1. Usar Hook em Componente

```typescript
import { useTranslation } from '@/i18n/hooks/useTranslation';

export const MyScreen: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation('matches');

  return (
    <>
      <Text>{t('create.title')}</Text>
      <Button title={t('actions.joinMatch')} />
    </>
  );
};
```

### 2. Adicionar Seletor de Idioma

```typescript
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

<LanguageSwitcher 
  onLanguageChange={(lang) => console.log('Novo idioma:', lang)}
  modal={true}
/>
```

### 3. Interpolação com Variáveis

```typescript
const message = t('dashboard.welcome', undefined, { name: 'João' });
// Resultado: 'Bem-vindo, João!'
```

---

## 📁 Estrutura

```
src/i18n/
├── index.ts                 # Configuração e exports
├── types.ts                # Type definitions
├── hooks/useTranslation.ts # Custom hooks
├── locales/
│   ├── pt-BR/             # [✅ Completo]
│   │   ├── common.ts
│   │   ├── login.ts
│   │   ├── dashboard.ts
│   │   ├── matches.ts
│   │   ├── profile.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   ├── en-US/             # [✅ Completo]
│   ├── pt-PT/             # [⏳ Pendente]
│   └── es-ES/             # [⏳ Pendente]
├── IMPLEMENTATION_GUIDE.md
├── EXAMPLES.md
├── ARCHITECTURE.md
└── README.md
```

---

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** | 📖 Guia de integração passo a passo |
| **[EXAMPLES.md](./EXAMPLES.md)** | 💻 5 exemplos práticos de código |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ Diagramas e arquitetura técnica |
| **[README.md](./README.md)** | 📄 Este arquivo (visão geral) |

---

## 🎯 Namespaces Disponíveis

### common
Termos reutilizáveis em todo app: navegação, botões, meses, mensagens genéricas.

```typescript
const { t } = useTranslation('common');
t('navigation.home')     // 'Início'
t('actions.save')        // 'Salvar'
t('time.january')        // 'Janeiro'
```

### login
Autenticação e setup de conta: campos, botões auth, termos legais, posições.

```typescript
const { t } = useTranslation('login');
t('fields.email')        // 'Email'
t('positions.goleiro')   // 'Goleiro'
t('legal.termsOfService') // 'Termos de Serviço'
```

### dashboard
Tela inicial e hub: boas-vindas, estatísticas, sugestões.

```typescript
const { t } = useTranslation('dashboard');
t('headers.welcome')     // 'Bem-vindo, {{name}}!'
t('stats.matchesPlayed') // 'Partidas Jogadas'
```

### matches
Criação e gerenciamento de partidas: formulários, modalidades, players.

```typescript
const { t } = useTranslation('matches');
t('create.title')        // 'Criar Partida'
t('modality.futsal')     // 'Futsal (5x5)'
t('status.confirmed')    // 'Confirmada'
```

### profile
Perfil de usuário: informações pessoais, badges, avaliações, privacidade.

```typescript
const { t } = useTranslation('profile');
t('personal.fullName')   // 'Nome Completo'
t('stats.goalsScored')   // 'Gols Marcados'
t('badges.topPlayer')    // 'Melhor Jogador'
```

### errors
Mensagens de erro: validação, autenticação, servidor, segurança.

```typescript
const { t } = useTranslation('errors');
t('validation.fieldRequired') // 'Este campo é obrigatório'
t('auth.emailAlreadyExists')  // 'Email já cadastrado'
t('general.unknownError')     // 'Erro desconhecido'
```

---

## 🌐 Idiomas Suportados

```typescript
// Tipos supportados
type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'es-ES';

// Lista completa com flags
SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
]
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Componente Simples

```typescript
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Text, View } from 'react-native';

export const WelcomeCard: React.FC = () => {
  const { t } = useTranslation('dashboard');

  return (
    <View>
      <Text>{t('headers.letSPlay')}</Text>
    </View>
  );
};
```

### Exemplo 2: Com Interpolação

```typescript
const { t } = useTranslation('dashboard');

const welcomeMessage = t(
  'headers.welcome',
  undefined,
  { name: user.name }
);

// PT-BR: 'Bem-vindo, João!'
// EN-US: 'Welcome, João!'
```

### Exemplo 3: Tratamento de Erro

```typescript
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Alert } from 'react-native';

const { t } = useTranslation('errors');

try {
  // operação
} catch (error) {
  Alert.alert(
    t('general.error'),
    t('validation.fieldRequired')
  );
}
```

### Exemplo 4: Mudar Idioma

```typescript
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import type { Locale } from '@/i18n';

const [showSettings, setShowSettings] = useState(false);

return (
  <>
    {showSettings && (
      <LanguageSwitcher
        modal={true}
        onClose={() => setShowSettings(false)}
        onLanguageChange={(newLang: Locale) => {
          console.log('Idioma mudou para:', newLang);
        }}
      />
    )}
  </>
);
```

---

## 🔧 Guia de Integração (Resumido)

### Passo 1: Instalar (Opcional)

```bash
# Se quiser usar i18next completo no futuro
npm install i18next i18next-react-native-async-storage
```

### Passo 2: Importar em AppProviders

```typescript
// src/components/layout/AppProviders.tsx
import { useTranslation } from '@/i18n/hooks/useTranslation';

export const AppProviders: React.FC = ({ children }) => {
  const { currentLanguage } = useTranslation('common');

  return (
    <View>
      {/* Seu contexto de idioma aqui */}
      {children}
    </View>
  );
};
```

### Passo 3: Usar em Componentes

```typescript
const { t } = useTranslation('myNamespace');

// Use t() para traduzir strings
```

### Passo 4: Adicionar Seletor (Opcional)

```typescript
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

<LanguageSwitcher modal={true} compact={false} />
```

---

## ✅ Checklist para Novos Componentes

Ao criar uma nova tela/funcionalidade:

- [ ] Criar namespace em `src/i18n/types.ts`
- [ ] Criar arquivos de tradução:
  - [ ] `src/i18n/locales/pt-BR/newfeature.ts`
  - [ ] `src/i18n/locales/en-US/newfeature.ts`
- [ ] Atualizar `index.ts` em cada locale
- [ ] Adicionar hook: `const { t } = useTranslation('newfeature')`
- [ ] Traduzir TUDO (labels, placeholders, mensagens, erros)
- [ ] Revisar ortografia em PT-BR ✅ IMPORTANTE

---

## 🎓 Melhores Práticas

### ✅ DO (Fazer)

```typescript
// ✅ Usar notação de ponto para estruturar
t('matches.create.title')

// ✅ Agrupar logicamente
const { t } = useTranslation('matches');

// ✅ Fornecer fallback
t('key', 'Fallback value')

// ✅ Usar interpolação para variáveis
t('key', undefined, { var: value })

// ✅ Traduzir tudo (placeholders, erros, dicas)
placeholder={t('fields.emailPlaceholder')}
```

### ❌ DON'T (Não Fazer)

```typescript
// ❌ Misturar namespaces
t('matches.login.email') // Não faça isso

// ❌ Usar strings hardcoded
<Text>Entrar</Text> // Use t('actions.login')

// ❌ Espaços extras na interpolação
t('key') // {{name}} funciona melhor que {{ name }}

// ❌ Ignorar diferenças regionais
// PT-BR: "Time" vs PT-PT: "Equipa"

// ❌ Deixar de traduzir mensagens de erro
Alert.alert(error.message) // Sempre traduzir
```

---

## 🐛 Troubleshooting

### Tradução não aparece?

```typescript
// 1. Verificar namespace
const { t } = useTranslation('correctNamespace');

// 2. Verificar chave
t('correct.nested.key')

// 3. Verificar idioma
console.log(currentLanguage) // 'pt-BR'?

// 4. Arquivo existe?
// src/i18n/locales/pt-BR/matches.ts
```

### Interpolação não funciona?

```typescript
// ERRADO
t('key') // {{ name }} não funciona

// CORRETO - Na tradução use:
{ welcome: 'Bem-vindo, {{name}}!' }

// E no código:
t('welcome', undefined, { name: 'João' })
```

### AsyncStorage não salva?

```typescript
// Verificar permissões
// Android: adicionar permissão em AndroidManifest.xml
// iOS: sem permissões necessárias para AsyncStorage
```

---

## 📊 Status de Tradução

### Concluído ✅

- [x] Português (Brasil) - 100% completo
- [x] Inglês (US) - 100% completo
- [x] Estrutura base - Type-safe, modular, escalável
- [x] Componente LanguageSwitcher - Funcional
- [x] Custom hooks - useTranslation, useGlobalTranslation, etc

### Em Progresso ⏳

- [ ] Português (Portugal) - Variações regionais
- [ ] Espanhol (Espanha) - Tradução completa
- [ ] Integração com i18next (opcional, para futuro)

---

## 🚀 Próximos Passos

1. **Integração imediata:**
   ```
   1. Use useTranslation('namespace') em componentes
   2. Remova strings hardcoded
   3. Adicione LanguageSwitcher em Settings
   ```

2. **Traducões regionais:**
   ```
   1. Copiar pt-BR para pt-PT (base)
   2. Atualizar diferenças: Team→Equipa, Match→Jogo
   3. Revisar acentuação específica de Portugal
   ```

3. **Tradução para Espanhol:**
   ```
   1. Traduzir todos os 6 namespaces
   2. Revisar ton esportivo em espanhol
   3. Considerar variações: España vs América Latina
   ```

---

## 🤝 Contribuindo

### Adicionar Tradução

```typescript
// 1. Editar arquivo
// src/i18n/locales/pt-BR/myscreen.ts

// 2. Adicionar chave
export const ptBRMyScreen = {
  myKey: 'Minha tradução',
}

// 3. Atualizar em TODAS as línguas
// src/i18n/locales/*/myscreen.ts
```

### Corrigir Erro

Se encontrar erro de tradução:
1. Verificar em `IMPLEMENTATION_GUIDE.md`
2. Revisar tom e acentuação
3. Checar ortografia com dicionário
4. Atualizar em todos idiomas

---

## 📞 Suporte

Dúvidas ou problemas?

1. Ler [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
2. Ver [EXAMPLES.md](./EXAMPLES.md) para código
3. Estudar [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes
4. Abrir issue com contexto

---

## 📄 Licença

Parte do projeto Futly Go © 2026

---

## 🏆 Status

✅ **Pronto para Produção**

- Type-safe: ✅
- Testado: ✅
- Documentado: ✅
- Escalável: ✅

---

**Última atualização:** 26 de Abril de 2026  
**Versão:** 1.0.0  
**Manutenedor:** Futly Go Team
