import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, useColorScheme } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFeedbackModal, OtpBoxes, PasswordStrengthMeter, AuthToast } from '@/src/components/features/auth';
import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Input, Text } from '@/src/components/ui';
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  updatePassword,
  signOut,
  normalizeAuthError,
} from '@/src/features/auth/service';

type Step = 1 | 2 | 3;

const VERIFICATION_CODE_LENGTH = 8;

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: 'Digite uma senha' };
  if (password.length < 6) return { level: 1, label: 'Muito fraca' };
  if (password.length < 10) return { level: 2, label: 'Fraca' };
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, label: 'Forte' };
  return { level: 3, label: 'Media' };
}

export default function SecurityScreen() {
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
      showToast('Digite seu e-mail');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetCode(email);
      setStep(2);
      showToast('Código enviado para seu e-mail');
    } catch (error) {
      const message = error instanceof Error ? normalizeAuthError(new Error(error.message)) : 'Erro ao enviar código';
      setModalData({
        tone: 'error',
        title: 'Falha ao enviar código',
        message,
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2() {
    if (code.length !== VERIFICATION_CODE_LENGTH) {
      showToast(`Digite os ${VERIFICATION_CODE_LENGTH} digitos do codigo`);
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetCode(email, code);
      setStep(3);
      showToast('Código verificado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? normalizeAuthError(new Error(error.message)) : 'Código inválido';
      setModalData({
        tone: 'error',
        title: 'Código inválido',
        message,
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep3() {
    if (password.length < 6) {
      showToast('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      await signOut();
      setModalData({
        tone: 'success',
        title: 'Senha alterada com sucesso',
        message: 'Você foi desconectado. Faça login novamente com sua nova senha.',
      });
      setModalVisible(true);
    } catch (error) {
      const message = error instanceof Error ? normalizeAuthError(new Error(error.message)) : 'Erro ao alterar senha';
      setModalData({
        tone: 'error',
        title: 'Falha ao alterar senha',
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
    handleStep1();
  }

  function handleBackToEmail() {
    setStep(1);
    setCode('');
  }

  const bgColor = theme === 'light' ? '#FFFFFF' : '#05070B';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title="Senha e Segurança" subtitle="ALTERAR SENHA" />

        {/* Step 1: Email */}
        {step === 1 && (
          <View className="mx-[18px] mt-6">
            <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[18px] mb-4">
              <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-1">
                Passo 1 de 3
              </Text>
              <Text variant="body" className="text-gray-600 dark:text-fg3 mb-4">
                Confirme seu e-mail para receber o código de verificação
              </Text>

              <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Button label="Enviar código" loading={loading} disabled={loading} onPress={handleStep1} />
          </View>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <View className="mx-[18px] mt-6">
            <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[18px] mb-4">
              <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-1">
                Passo 2 de 3
              </Text>
              <Text variant="body" className="text-gray-600 dark:text-fg3 mb-4">
                Digite o código que foi enviado para {email}
              </Text>

              <View className="mb-4">
                <OtpBoxes value={code} />
              </View>

              <Input
                label={`Codigo (${VERIFICATION_CODE_LENGTH} digitos)`}
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, VERIFICATION_CODE_LENGTH))}
                keyboardType="number-pad"
                placeholder="00000000"
                maxLength={VERIFICATION_CODE_LENGTH}
              />
            </View>

            <View className="gap-3 mb-4">
              <Button label="Verificar código" loading={loading} disabled={loading} onPress={handleStep2} />
              <Button variant="ghost" label="Reenviar código" onPress={handleResendCode} />
              <Button variant="ghost" label="Voltar" onPress={handleBackToEmail} />
            </View>
          </View>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <View className="mx-[18px] mt-6">
            <View className="rounded-[18px] border border-gray-200 dark:border-line2 bg-white dark:bg-[#0C111E] p-[18px] mb-4">
              <Text variant="label" className="font-bold text-gray-900 dark:text-white mb-1">
                Passo 3 de 3
              </Text>
              <Text variant="body" className="text-gray-600 dark:text-fg3 mb-4">
                Crie uma nova senha segura
              </Text>

              <View className="mb-4">
                <Input
                  label="Nova senha"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!showPassword}
                  rightAdornment={
                    <Text
                      variant="caption"
                      tone="secondary"
                      onPress={() => setShowPassword(!showPassword)}
                      className="font-medium"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  }
                />
              </View>

              <View className="mb-4">
                <PasswordStrengthMeter {...getPasswordStrength(password)} />
              </View>

              <View className="mb-4">
                <Input
                  label="Confirmar senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a senha"
                  secureTextEntry={!showConfirmPassword}
                  rightAdornment={
                    <Text
                      variant="caption"
                      tone="secondary"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="font-medium"
                    >
                      {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  }
                />
              </View>
            </View>

            <Button
              label="Salvar nova senha"
              loading={loading}
              disabled={loading || password.length < 6 || password !== confirmPassword}
              onPress={handleStep3}
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
        primaryLabel={modalData?.tone === 'success' ? 'Ir para login' : 'Tentar novamente'}
        onPrimaryPress={handleModalClose}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}
