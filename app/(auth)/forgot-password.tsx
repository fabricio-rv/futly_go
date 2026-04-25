import { router } from 'expo-router';
import { Mail, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
	AuthBackground,
	AuthFeedbackModal,
	AuthStepIndicator,
	AuthToast,
	AuthTopNav,
	OtpBoxes,
	PasswordStrengthMeter,
} from '@/src/components/features/auth';
import { Button, Input, Text } from '@/src/components/ui';
import {
	sendPasswordResetCode,
	signOut,
	updatePassword,
	verifyPasswordResetCode,
} from '@/src/features/auth/service';

function getPasswordStrength(password: string) {
	let score = 0;
	if (password.length >= 8) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;
	return Math.min(score, 4);
}

function getStrengthLabel(level: number) {
	if (level <= 1) return 'Fraca - use mais de 8 caracteres';
	if (level === 2) return 'Media - adicione maiuscula e numero';
	if (level === 3) return 'Forte - 9 caracteres - maiuscula + numero';
	return 'Muito forte - pronta para uso';
}

function maskEmail(email: string) {
	const [name = '', domain = ''] = email.split('@');
	if (!name || !domain) return 'seu e-mail';
	const start = name.slice(0, 3);
	return `${start}${'*'.repeat(Math.max(name.length - 3, 1))}@${domain}`;
}

export default function ForgotPasswordScreen() {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState<{ visible: boolean; message: string; tone: 'success' | 'error' | 'info' }>({
		visible: false,
		message: '',
		tone: 'info',
	});
	const [feedback, setFeedback] = useState<{
		visible: boolean;
		tone: 'success' | 'error' | 'info';
		title: string;
		message: string;
		primaryLabel: string;
		onPrimary: () => void;
		secondaryLabel?: string;
		onSecondary?: () => void;
	}>({
		visible: false,
		tone: 'info',
		title: '',
		message: '',
		primaryLabel: 'Fechar',
		onPrimary: () => undefined,
	});

	function showToast(message: string, tone: 'success' | 'error' | 'info' = 'info') {
		setToast({ visible: true, message, tone });
		setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 1800);
	}

	const passwordLevel = useMemo(() => getPasswordStrength(password), [password]);

	async function handleSendCode() {
		if (!email.trim()) {
			showToast('Informe seu e-mail', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'E-mail obrigatório',
				message: 'Informe o e-mail para receber o código.',
				primaryLabel: 'Ok',
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		try {
			setLoading(true);
			await sendPasswordResetCode(email);
			showToast('Código enviado com sucesso', 'success');
			setStep(2);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Não foi possível enviar o código.';
			showToast('Erro ao enviar código', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Erro ao enviar código',
				message,
				primaryLabel: 'Voltar para login',
				onPrimary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					router.replace('/(auth)');
				},
				secondaryLabel: 'Tentar novamente',
				onSecondary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
		} finally {
			setLoading(false);
		}
	}

	async function handleVerifyCode() {
		if (code.length !== 6) {
			showToast('Código incompleto', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Código incompleto',
				message: 'Digite os 6 dígitos do código.',
				primaryLabel: 'Ok',
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		try {
			setLoading(true);
			await verifyPasswordResetCode(email, code);
			showToast('Código validado', 'success');
			setStep(3);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Não foi possível validar o código.';
			showToast('Código inválido', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Código inválido',
				message,
				primaryLabel: 'Solicitar novo código',
				onPrimary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					setStep(1);
				},
				secondaryLabel: 'Tentar novamente',
				onSecondary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
		} finally {
			setLoading(false);
		}
	}

	async function handleSavePassword() {
		if (password.length < 6) {
			showToast('Senha muito curta', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Senha inválida',
				message: 'A senha deve ter pelo menos 6 caracteres.',
				primaryLabel: 'Ok',
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		if (confirmPassword !== password) {
			showToast('As senhas não conferem', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Senhas diferentes',
				message: 'As senhas não conferem.',
				primaryLabel: 'Ok',
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		try {
			setLoading(true);
			await updatePassword(password);
			await signOut();
			showToast('Senha atualizada', 'success');
			setFeedback({
				visible: true,
				tone: 'success',
				title: 'Senha atualizada',
				message: 'Sua senha foi redefinida com sucesso. Faça login com a nova senha.',
				primaryLabel: 'Ir para login',
				onPrimary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					router.replace('/(auth)');
				},
				secondaryLabel: 'Ir para cadastro',
				onSecondary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					router.replace('/(auth)/signup');
				},
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Não foi possível atualizar a senha.';
			showToast('Erro ao atualizar senha', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Erro ao atualizar senha',
				message,
				primaryLabel: 'Ir para login',
				onPrimary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					router.replace('/(auth)');
				},
				secondaryLabel: 'Tentar novamente',
				onSecondary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-ink-0">
			<AuthBackground />
			<AuthToast visible={toast.visible} message={toast.message} tone={toast.tone} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
				keyboardShouldPersistTaps="handled"
			>
				<View className="relative pb-6">
					<AuthTopNav
						title="Recuperar Senha"
						subtitle={`ETAPA ${step} DE 3`}
						onBackPress={() => {
							if (step > 1) {
								setStep((prev) => prev - 1);
								return;
							}
							router.back();
						}}
					/>

					<AuthStepIndicator current={step} />

					<View className="px-6 pt-2">
						{step === 1 ? (
							<View>
								<View className="h-[70px] w-[70px] rounded-[20px] border border-[#22B76C59] bg-[#22B76C24] items-center justify-center mb-[18px]">
									<Mail size={32} color="#86E5B4" strokeWidth={1.9} />
								</View>

								<Text variant="title" className="text-white font-extrabold">
									Informe seu e-mail
								</Text>
								<Text variant="label" className="mt-1 mb-4 text-fg2 leading-[20px]">
									Vamos enviar um codigo de recuperacao de 6 digitos.
								</Text>

								<Input
									label="E-mail"
									value={email}
									onChangeText={setEmail}
									placeholder="seuemail@dominio.com"
									autoCapitalize="none"
									keyboardType="email-address"
									leftAdornment={<Mail size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
									containerClassName="h-12 rounded-[14px] border-line2 bg-[#0C111E]"
									labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
								/>

								<Button
									label="Enviar codigo"
									variant="primary"
									size="xl"
									loading={loading}
									disabled={loading}
									className="mt-4 rounded-[14px]"
									onPress={handleSendCode}
								/>
							</View>
						) : null}

						{step === 2 ? (
							<View>
								<View className="h-[70px] w-[70px] rounded-[20px] border border-[#22B76C59] bg-[#22B76C24] items-center justify-center mb-[18px]">
									<ShieldCheck size={32} color="#86E5B4" strokeWidth={1.9} />
								</View>

								<Text variant="title" className="text-white font-extrabold">
									Digite o codigo
								</Text>
								<Text variant="label" className="mt-1 text-fg2 leading-[20px]">
									Enviamos um codigo de 6 digitos para
								</Text>
								<Text variant="label" className="text-white font-semibold mt-1">
									{maskEmail(email)}
								</Text>

								<Pressable className="mt-1 mb-4" onPress={handleSendCode}>
									<Text variant="micro" className="text-fg3">
										Nao chegou? <Text className="text-ok font-bold">Reenviar codigo</Text>
									</Text>
								</Pressable>

								<OtpBoxes value={code} />

								<Input
									label="Codigo de verificacao"
									value={code}
									onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
									placeholder="Digite o codigo de 6 digitos"
									keyboardType="number-pad"
									containerClassName="mt-4 h-12 rounded-[14px] border-line2 bg-[#0C111E]"
									labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
								/>

								<Button
									label="Verificar codigo"
									variant="primary"
									size="xl"
									loading={loading}
									disabled={loading}
									className="mt-2 rounded-[14px]"
									onPress={handleVerifyCode}
								/>
								<Button
									label="Voltar e mudar email"
									variant="ghost"
									size="xl"
									disabled={loading}
									className="mt-[10px] rounded-[14px]"
									onPress={() => setStep(1)}
								/>
							</View>
						) : null}

						{step === 3 ? (
							<View>
								<View className="h-[70px] w-[70px] rounded-[20px] border border-[#22B76C59] bg-[#22B76C24] items-center justify-center mb-[18px]">
									<ShieldCheck size={32} color="#86E5B4" strokeWidth={1.9} />
								</View>

								<Text variant="title" className="text-white font-extrabold">
									Defina sua nova senha
								</Text>
								<Text variant="label" className="mt-1 mb-4 text-fg2 leading-[20px]">
									Crie uma senha forte para proteger sua conta.
								</Text>

								<Input
									label="Nova senha"
									value={password}
									onChangeText={setPassword}
									placeholder="Digite a nova senha"
									secureTextEntry
									containerClassName="h-12 rounded-[14px] border-ok bg-[#0C111E]"
									labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
								/>

								<PasswordStrengthMeter level={passwordLevel} label={getStrengthLabel(passwordLevel)} />

								<Input
									label="Confirmar senha"
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									placeholder="Confirme a nova senha"
									secureTextEntry
									containerClassName="mt-3 h-12 rounded-[14px] border-line2 bg-[#0C111E]"
									labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
								/>

								<Button
									label="Salvar nova senha"
									variant="primary"
									size="xl"
									loading={loading}
									disabled={loading}
									className="mt-4 rounded-[14px]"
									onPress={handleSavePassword}
								/>
							</View>
						) : null}

					</View>
				</View>
			</ScrollView>
			<AuthFeedbackModal
				visible={feedback.visible}
				tone={feedback.tone}
				title={feedback.title}
				message={feedback.message}
				primaryLabel={feedback.primaryLabel}
				onPrimaryPress={feedback.onPrimary}
				secondaryLabel={feedback.secondaryLabel}
				onSecondaryPress={feedback.onSecondary}
				onClose={() => setFeedback((prev) => ({ ...prev, visible: false }))}
			/>
		</SafeAreaView>
	);
}


