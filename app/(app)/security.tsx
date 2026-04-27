import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFeedbackModal, OtpBoxes, PasswordStrengthMeter, AuthToast } from '@/src/components/features/auth';
import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Input, Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  updatePassword,
  signOut,
  normalizeAuthError,
} from '@/src/features/auth/service';

type Step = 1 | 2 | 3;

const VERIFICATION_CODE_LENGTH = 8;

function getPasswordStrength(
  password: string,
  t: (key: string, fallback?: string) => string
): { level: number; label: string } {
  if (!password) return { level: 0, label: t('security.passwordStrength.veryWeak', 'Muito fraca - use mais de 8 caracteres') };
  if (password.length < 6) return { level: 1, label: t('security.passwordStrength.veryWeak', 'Muito fraca - use mais de 8 caracteres') };
  if (password.length < 10) return { level: 2, label: t('security.passwordStrength.weak', 'Fraca - adicione maiuscula e numero') };
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
    return { level: 4, label: t('security.passwordStrength.strong', 'Forte - pronta para uso') };
  }
  return { level: 3, label: t('security.passwordStrength.medium', 'Media - 9 caracteres - maiuscula + numero') };
}

export default function SecurityScreen() {
  const { t } = useTranslation('auth');
  const theme = useAppColorScheme();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    tone: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  }

  async function handleStep1() {
    if (!email.trim()) {
      showToast(t('security.enterEmail', 'Digite seu e-mail'));
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetCode(email);
      setStep(2);
      showToast(t('security.codeSent', 'Codigo enviado para seu e-mail'));
    } catch (error) {
      const message = error instanceof Error ? normalizeAuthError(new Error(error.message)) : t('security.sendCodeFailed', 'Erro ao enviar codigo');
      setModalData({
        tone: 'error',
        title: t('security.sendCodeFailedTitle', 'Falha ao enviar codigo'),
        message,
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      showToast(
        t(
          'security.enterCodeLength',
          'Digite os {{VERIFICATION_CODE_LENGTH}} digitos do codigo',
          { VERIFICATION_CODE_LENGTH }
        )
      );
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetCode(email, code);
      setStep(3);
      showToast(t('security.codeVerified', 'Codigo verificado com sucesso'));
    } catch (error) {
      const message = error instanceof Error ? normalizeAuthError(new Error(error.message)) : t('security.invalidCode', 'Codigo invalido');
      setModalData({
        tone: 'error',
        title: t('security.invalidCodeTitle', 'Codigo invalido'),
        message,
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3() {
    if (password.length < 6) {
      showToast(t('security.minPassword', 'Senha deve ter no minimo 6 caracteres'));
      return;
    }

    if (password !== confirmPassword) {
      showToast(t('errors.passwordMismatch', 'As senhas nao coincidem'));
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      await signOut();
      setModalData({
        tone: 'success',
        title: t('security.passwordChanged', 'Senha alterada com sucesso'),
        message: t('security.passwordChangedMessage', 'Voce foi desconectado. Faca login novamente com sua nova senha.'),
      });
      setModalVisible(true);
    } catch (error) {
      const message = error instanceof Error ? normalizeAuthError(new Error(error.message)) : t('security.updatePasswordFailedMessage', 'Erro ao alterar senha');
      setModalData({
        tone: 'error',
        title: t('security.updatePasswordFailed', 'Falha ao alterar senha'),
        message,
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setModalVisible(false);
    if (modalData?.tone === 'success') {
      router.replace('/(auth)');
    }
  }

  function handleResendCode() {
    setCode('');
    void handleStep1();
  }

  function handleBackToEmail() {
    setStep(1);
    setCode('');
  }

  const bgColor = theme === 'light' ? '#FFFFFF' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title={t('security.title', 'Senha e Seguranca')} subtitle={t('security.changePassword', 'ALTERAR SENHA')} />

        {step === 1 && (
          <View className="mx-[18px] mt-6">
            <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
              <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-1">
                {t('security.step1', 'Passo 1 de 3')}
              </Text>
              <Text variant="body" className="text-[#4B5563] dark:text-fg3 mb-4">
                {t('security.step1Hint', 'Confirme seu e-mail para receber o codigo de verificacao')}
              </Text>

              <Input
                label={t('signup.email', 'E-mail')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('placeholders.email', 'seu@email.com')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button label={t('forgotPassword.sendCode', 'Enviar codigo')} loading={loading} disabled={loading} onPress={() => void handleStep1()} />
          </View>
        )}

        {step === 2 && (
          <View className="mx-[18px] mt-6">
            <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
              <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-1">
                {t('security.step2', 'Passo 2 de 3')}
              </Text>
              <Text variant="body" className="text-[#4B5563] dark:text-fg3 mb-4">
                {t('security.step2Hint', 'Digite o codigo que foi enviado para {{email}}', { email })}
              </Text>

              <View className="mb-4">
                <OtpBoxes value={code} />
              </View>

              <Input
                label={t('security.codeLabel', 'Codigo ({{VERIFICATION_CODE_LENGTH}} digitos)', { VERIFICATION_CODE_LENGTH })}
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, VERIFICATION_CODE_LENGTH))}
                keyboardType="number-pad"
                placeholder={t('security.codePlaceholder', '00000000')}
                maxLength={VERIFICATION_CODE_LENGTH}
              />
            </View>

            <View className="gap-3 mb-4">
              <Button label={t('forgotPassword.verifyCode', 'Verificar codigo')} loading={loading} disabled={loading} onPress={() => void handleStep2()} />
              <Button variant="ghost" label={t('forgotPassword.resendCode', 'Reenviar codigo')} onPress={handleResendCode} />
              <Button variant="ghost" label={t('common.back', 'Voltar')} onPress={handleBackToEmail} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="mx-[18px] mt-6">
            <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-4">
              <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-1">
                {t('security.step3', 'Passo 3 de 3')}
              </Text>
              <Text variant="body" className="text-[#4B5563] dark:text-fg3 mb-4">
                {t('security.step3Hint', 'Crie uma nova senha segura')}
              </Text>

              <View className="mb-4">
                <Input
                  label={t('security.newPassword', 'Nova senha')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('security.newPasswordPlaceholder', 'Minimo 6 caracteres')}
                  secureTextEntry={!showPassword}
                  rightAdornment={
                    <Text
                      variant="caption"
                      tone="secondary"
                      onPress={() => setShowPassword(!showPassword)}
                      className="font-medium"
                    >
                      {showPassword ? t('common.hide', 'Ocultar') : t('common.show', 'Mostrar')}
                    </Text>
                  }
                />
              </View>

              <View className="mb-4">
                <PasswordStrengthMeter {...getPasswordStrength(password, t)} />
              </View>

              <View className="mb-4">
                <Input
                  label={t('signup.confirmPassword', 'Confirmar senha')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('security.confirmPasswordPlaceholder', 'Repita a senha')}
                  secureTextEntry={!showConfirmPassword}
                  rightAdornment={
                    <Text
                      variant="caption"
                      tone="secondary"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="font-medium"
                    >
                      {showConfirmPassword ? t('common.hide', 'Ocultar') : t('common.show', 'Mostrar')}
                    </Text>
                  }
                />
              </View>
            </View>

            <Button
              label={t('security.changePassword', 'Salvar nova senha')}
              loading={loading}
              disabled={loading || password.length < 6 || password !== confirmPassword}
              onPress={() => void handleStep3()}
            />
          </View>
        )}
      </ScrollView>

      <MatchBottomNav active="none" />

      <AuthToast visible={toastVisible} message={toastMessage} />

      <AuthFeedbackModal
        visible={modalVisible}
        tone={modalData?.tone ?? 'info'}
        title={modalData?.title ?? ''}
        message={modalData?.message ?? ''}
        primaryLabel={modalData?.tone === 'success' ? t('signup.login', 'Ir para login') : t('common.retry', 'Tentar novamente')}
        onPrimaryPress={handleModalClose}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}
