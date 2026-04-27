# 📚 Exemplos Práticos de Uso - i18n System

## Exemplo 1: Tela de Login Completa

```typescript
// src/features/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Button, Card, ScreenHeader } from '@/components/ui';
import { styles } from './LoginScreen.styles';

export const LoginScreen: React.FC = ({ navigation }: any) => {
  const { t, currentLanguage } = useTranslation('login');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Validação
      if (!email || !password) {
        Alert.alert(
          tErrors('validation.fieldRequired'),
          tCommon('validation.fillAllFields')
        );
        return;
      }

      if (!email.includes('@')) {
        Alert.alert(
          tErrors('validation.invalidEmail'),
          tCommon('validation.invalidEmail')
        );
        return;
      }

      // Chamar API
      // const response = await loginUser(email, password);
      
      // Sucesso
      Alert.alert(
        tCommon('actions.success'),
        t('success.accountCreated')
      );
      
    } catch (error: any) {
      // Tratamento de erro específico
      if (error.message.includes('Auth.InvalidUserAttributes')) {
        Alert.alert(
          tErrors('general.error'),
          tErrors('auth.invalidEmail')
        );
      } else {
        Alert.alert(
          tErrors('general.error'),
          tErrors('general.unknownError')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={t('title')} 
        subtitle={t('subtitle')}
      />

      <Card style={styles.formCard}>
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('fields.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('fields.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Password Input */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('fields.password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('fields.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>
              {t('buttons.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title={loading ? tCommon('actions.loading') : t('buttons.login')}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          {/* Social Auth */}
          <Text style={styles.divider}>{tCommon('messages.selectOption')}</Text>
          
          <View style={styles.socialButtons}>
            <Button
              title={t('buttons.continueWithGoogle')}
              variant="secondary"
              onPress={() => console.log('Google login')}
              disabled={loading}
            />
            <Button
              title={t('buttons.continueWithApple')}
              variant="secondary"
              onPress={() => console.log('Apple login')}
              disabled={loading}
            />
          </View>
        </View>
      </Card>

      {/* Sign Up Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('buttons.createAccount')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.footerLink}>{tCommon('actions.signup')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

---

## Exemplo 2: Tela de Criação de Partida

```typescript
// src/features/matches/CreateMatchScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useTranslation, useTranslationList } from '@/i18n/hooks/useTranslation';
import { Button, Card, Input, Select } from '@/components/ui';

export const CreateMatchScreen: React.FC = ({ navigation }: any) => {
  const { t, currentLanguage } = useTranslation('matches');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');
  
  // Hooks de tradução para listas
  const tModality = useTranslationList('matches', 'modality');
  const tPosition = useTranslationList('matches', 'positions');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    duration: 90,
    numPlayers: 10,
    modality: 'futsal',
    position: 'any',
    price: '0',
    level: 'intermediate',
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    // Validar step
    if (!validateStep(step)) {
      Alert.alert(
        tErrors('validation.fieldRequired'),
        tCommon('validation.fillAllFields')
      );
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleCreate = async () => {
    try {
      // Validar todos os campos
      if (!formData.name || !formData.location || !formData.date) {
        Alert.alert(
          tErrors('validation.fieldRequired'),
          tCommon('validation.fillAllFields')
        );
        return;
      }

      // API call
      // await createMatch(formData);

      Alert.alert(
        tCommon('actions.success'),
        t('success.matchCreated')
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        tErrors('matches.cannotJoinOwnMatch'),
        error.message || tErrors('general.unknownError')
      );
    }
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return formData.name.length > 0 && formData.modality.length > 0;
      case 2:
        return formData.location.length > 0 && formData.date.length > 0;
      case 3:
        return formData.time.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepText}>
          {t('step', undefined, { current: step, total: totalSteps })}
        </Text>
      </View>

      <ScrollView style={styles.container}>
        {step === 1 && (
          <Card>
            <Text style={styles.sectionTitle}>{t('create.basicInfo')}</Text>
            
            <Input
              label={t('form.matchName')}
              placeholder={t('form.matchNamePlaceholder')}
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
            />

            <Select
              label={t('form.modality')}
              value={formData.modality}
              options={[
                { label: tModality('futsal'), value: 'futsal' },
                { label: tModality('soccer7'), value: 'soccer7' },
                { label: tModality('soccer11'), value: 'soccer11' },
                { label: tModality('beach'), value: 'beach' },
              ]}
              onValueChange={(modality) =>
                setFormData({ ...formData, modality })
              }
            />
          </Card>
        )}

        {step === 2 && (
          <Card>
            <Text style={styles.sectionTitle}>{t('create.location')}</Text>
            
            <Input
              label={t('form.location')}
              placeholder={t('form.locationPlaceholder')}
              value={formData.location}
              onChangeText={(location) =>
                setFormData({ ...formData, location })
              }
            />

            <Input
              label={t('form.date')}
              placeholder={t('form.date')}
              value={formData.date}
              onChangeText={(date) => setFormData({ ...formData, date })}
            />
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Text style={styles.sectionTitle}>{t('create.datetime')}</Text>
            
            <Input
              label={t('form.time')}
              placeholder="HH:MM"
              value={formData.time}
              onChangeText={(time) => setFormData({ ...formData, time })}
            />

            <Select
              label={t('form.duration')}
              value={String(formData.duration)}
              options={[
                { label: `30 ${tCommon('time.today')}`, value: '30' },
                { label: '60 min', value: '60' },
                { label: '90 min', value: '90' },
                { label: '120 min', value: '120' },
              ]}
              onValueChange={(duration) =>
                setFormData({ ...formData, duration: parseInt(duration) })
              }
            />
          </Card>
        )}

        {step === 4 && (
          <Card>
            <Text style={styles.sectionTitle}>{t('create.details')}</Text>
            
            <Select
              label={t('form.position')}
              value={formData.position}
              options={[
                { label: tPosition('any'), value: 'any' },
                { label: tPosition('goalkeeper'), value: 'goalkeeper' },
                { label: tPosition('defender'), value: 'defender' },
                { label: tPosition('midfielder'), value: 'midfielder' },
                { label: tPosition('forward'), value: 'forward' },
              ]}
              onValueChange={(position) =>
                setFormData({ ...formData, position })
              }
            />

            <Input
              label={t('form.pricePerPlayer')}
              placeholder={t('form.free')}
              value={formData.price}
              onChangeText={(price) => setFormData({ ...formData, price })}
              keyboardType="decimal-pad"
            />

            {/* Resumo */}
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>{t('create.review')}</Text>
              <Text>{t('form.matchName')}: {formData.name}</Text>
              <Text>{t('form.location')}: {formData.location}</Text>
              <Text>{tModality(formData.modality)}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Botões de ação */}
      <View style={styles.buttonContainer}>
        <Button
          title={tCommon('actions.back')}
          onPress={() => setStep(Math.max(1, step - 1))}
          variant="secondary"
          disabled={step === 1}
        />
        
        {step < totalSteps ? (
          <Button
            title={tCommon('actions.next')}
            onPress={handleNext}
          />
        ) : (
          <Button
            title={t('actions.createMatch')}
            onPress={handleCreate}
          />
        )}
      </View>
    </View>
  );
};
```

---

## Exemplo 3: Tratamento de Erros com i18n

```typescript
// src/lib/errorHandler.ts
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface ErrorMap {
  pattern: RegExp;
  translationKey: string;
  namespace: 'errors' | 'matches' | 'auth';
}

const ERROR_MAP: ErrorMap[] = [
  {
    pattern: /duplicate key/i,
    translationKey: 'auth.emailAlreadyExists',
    namespace: 'errors',
  },
  {
    pattern: /Auth\.InvalidUserAttributes/i,
    translationKey: 'auth.invalidEmail',
    namespace: 'errors',
  },
  {
    pattern: /not found/i,
    translationKey: 'matches.matchNotFound',
    namespace: 'errors',
  },
  {
    pattern: /timeout/i,
    translationKey: 'general.timeout',
    namespace: 'errors',
  },
];

export function useErrorTranslation() {
  const { t: tErrors } = useTranslation('errors');
  const { t: tMatches } = useTranslation('matches');
  const { t: tAuth } = useTranslation('auth');

  const getLocalizedError = (error: Error | string): string => {
    const message = typeof error === 'string' ? error : error.message;

    // Procurar por padrão de erro
    for (const map of ERROR_MAP) {
      if (map.pattern.test(message)) {
        const t = map.namespace === 'errors' ? tErrors : tMatches;
        return t(map.translationKey);
      }
    }

    // Fallback para erro genérico
    return tErrors('general.unknownError');
  };

  return { getLocalizedError };
}

// Uso em componente
export const MatchCard: React.FC = ({ match }: any) => {
  const { getLocalizedError } = useErrorTranslation();

  const handleJoinMatch = async () => {
    try {
      // joinMatch logic
    } catch (error) {
      const localizedError = getLocalizedError(error);
      Alert.alert('Erro', localizedError);
    }
  };

  return (
    <Button title="Entrar" onPress={handleJoinMatch} />
  );
};
```

---

## Exemplo 4: Seletor de Idioma em Settings

```typescript
// src/features/settings/LanguageSettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Card, ScreenHeader } from '@/components/ui';

export const LanguageSettingsScreen: React.FC = () => {
  const { currentLanguage, t } = useTranslation('common');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLanguageChange = (newLanguage: Locale) => {
    // Você pode fazer coisas extras aqui, como recarregar dados
    console.log('Idioma mudou para:', newLanguage);
    
    // Exemplo: Recarregar dados de APIs que dependem do idioma
    // reloadAllData(newLanguage);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title={t('navigation.settings')} 
      />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{t('common.appName)}</Text>
        
        <View style={styles.languageInfo}>
          <Text style={styles.label}>Idioma atual:</Text>
          <Text style={styles.value}>
            {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}
          </Text>
        </View>

        <Button
          title="Mudar Idioma"
          onPress={() => setShowLanguageModal(true)}
        />
      </Card>

      {showLanguageModal && (
        <LanguageSwitcher
          modal
          onClose={() => setShowLanguageModal(false)}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </View>
  );
};
```

---

## Exemplo 5: Validação e Mensagens de Formulário

```typescript
// src/hooks/useFormValidation.ts
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface Field {
  name: string;
  value: string;
  type: 'email' | 'password' | 'text' | 'phone' | 'date';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export function useFormValidation() {
  const { t } = useTranslation('errors');

  const validateField = (field: Field): string | null => {
    // Campo obrigatório
    if (field.required && !field.value.trim()) {
      return t('validation.fieldRequired');
    }

    // Email
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        return t('validation.invalidEmail');
      }
    }

    // Telefone (brasileiro)
    if (field.type === 'phone') {
      const phoneRegex = /^(\(?\d{2}\)?\s)?9?\d{4}-?\d{4}$/;
      if (!phoneRegex.test(field.value)) {
        return t('location.cepNotFound'); // ou outro erro apropriado
      }
    }

    // Mínimo de caracteres
    if (field.minLength && field.value.length < field.minLength) {
      return t('validation.tooShort');
    }

    // Máximo de caracteres
    if (field.maxLength && field.value.length > field.maxLength) {
      return t('validation.tooLong');
    }

    return null;
  };

  return { validateField };
}
```

---

## Dicas Finais 💡

1. **Sempre use TypeScript**: O sistema é totalmente type-safe
2. **Namespace por funcionalidade**: Cada tela tem seu próprio namespace
3. **Interpolação quando necessário**: Use `{{varName}}` para variáveis dinâmicas
4. **Teste todos os idiomas**: Não assume que uma tradução funciona bem em português
5. **Mantenha tom consistente**: Esportivo, motivacional e direto
6. **Revise ortografia**: Especialmente em PT-BR (não esqueça acentos!)
7. **Atualize todos idiomas**: Se mudar algo em PT-BR, mude em todos os outros também

---

**Sucesso na implementação! 🚀⚽**
