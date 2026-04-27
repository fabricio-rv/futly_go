import { router } from 'expo-router';
import { ArrowRight, Check, Eye, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
	AuthBackground,
	AuthFeedbackModal,
	AuthToast,
	SocialAuthRow,
} from '@/src/components/features/auth';
import { Button, Input, Text } from '@/src/components/ui';
import {
	isProfileMissingRequiredData,
	signInWithPassword,
	signInWithSocial,
	type SocialProvider,
} from '@/src/features/auth/service';

export default function LoginScreen() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(true);
	const [loading, setLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
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

	async function navigateAfterLogin() {
		const needsProfileCompletion = await isProfileMissingRequiredData();
		if (needsProfileCompletion) {
			router.replace('/(app)/edit-profile');
			return;
		}

		router.replace('/(app)');
	}

	async function handleLogin() {
		if (!email.trim() || !password.trim()) {
			showToast('Preencha os campos obrigatorios', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Dados incompletos',
				message: 'Preencha e-mail e senha para entrar.',
				primaryLabel: 'Ok',
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		try {
			setLoading(true);
			await signInWithPassword(email, password);
			showToast('Login realizado com sucesso', 'success');
			setTimeout(() => {
				void navigateAfterLogin();
			}, 400);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Nao foi possivel fazer login.';
			showToast('Falha no login', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Nao foi possivel entrar',
				message,
				primaryLabel: 'Ir para cadastro',
				onPrimary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					router.push('/(auth)/signup');
				},
				secondaryLabel: 'Tentar de novo',
				onSecondary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
		} finally {
			setLoading(false);
		}
	}

	async function handleSocialLogin(provider: SocialProvider) {
		try {
			setSocialLoading(provider);
			await signInWithSocial(provider);
			showToast('Login social realizado com sucesso', 'success');
			setTimeout(() => {
				void navigateAfterLogin();
			}, 300);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Nao foi possivel fazer login social.';
			showToast('Falha no login social', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: 'Falha no login social',
				message,
				primaryLabel: 'Fechar',
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
		} finally {
			setSocialLoading(null);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-ink-0">
			<AuthBackground />
			<AuthToast visible={toast.visible} message={toast.message} tone={toast.tone} />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingVertical: 28 }}
				keyboardShouldPersistTaps="handled"
			>
				<View className="relative flex-1 justify-center px-6 py-6">
					<View className="items-center mb-11">
						<View
							className="rounded-[22px] border border-[#22B76C52] bg-[#0A1220] items-center justify-center overflow-hidden"
							style={{ width: 130, height: 130 }}
						>
							<Image
								source={require('../../assets/icons/Icon-512.png')}
								style={{ width: 130, height: 130, borderRadius: 25 }}
								resizeMode="contain"
							/>
						</View>
						<Text variant="display" className="mt-5 text-white font-extrabold tracking-[-0.7px]">
							FUTLY{' '}
							<Text variant="display" className="text-ok font-extrabold tracking-[-0.7px]">
								GO
							</Text>
						</Text>
						<Text variant="micro" className="mt-1.5 uppercase tracking-[2.8px] font-bold text-fg3">
							Marque - Jogue - Avalie
						</Text>
					</View>

					<View className="gap-4">
						<Input
							label="E-mail"
							value={email}
							onChangeText={setEmail}
							placeholder="seuemail@dominio.com"
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="email-address"
							leftAdornment={<Mail size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
							containerClassName="h-12 rounded-[14px] border-line2 bg-[#0C111E]"
							labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
						/>

						<Input
							label="Senha"
							value={password}
							onChangeText={setPassword}
							placeholder="Digite sua senha"
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							leftAdornment={<Lock size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
							rightAdornment={(
								<Pressable
									accessibilityRole="button"
									onPress={() => setShowPassword((prev) => !prev)}
									className="h-8 w-8 items-center justify-center"
								>
									<Eye size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />
								</Pressable>
							)}
							containerClassName="h-12 rounded-[14px] border-ok bg-[#0C111E]"
							labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
						/>
					</View>

					<View className="mt-4 mb-5 flex-row items-center justify-between">
						<Pressable
							accessibilityRole="checkbox"
							accessibilityState={{ checked: remember }}
							onPress={() => setRemember((prev) => !prev)}
							className="flex-row items-center gap-2"
						>
							<View className={`h-5 w-5 rounded-[7px] items-center justify-center ${remember ? 'bg-ok' : 'bg-[#0C111E] border border-line2'}`}>
								{remember ? <Check size={12} color="#05070B" strokeWidth={2.8} /> : null}
							</View>
							<Text variant="caption" className="text-fg2 font-medium">
								Lembrar
							</Text>
						</Pressable>

						<Pressable
							accessibilityRole="button"
							onPress={() => router.push('/(auth)/forgot-password')}
						>
							<Text variant="caption" className="font-semibold" style={{ color: '#22B76C' }}>
								Esqueci a senha
							</Text>
						</Pressable>
					</View>

					<Button
						label="Entrar"
						variant="primary"
						size="xl"
						loading={loading}
						disabled={loading || socialLoading !== null}
						rightAdornment={<ArrowRight size={14} color="#05070B" strokeWidth={2.4} />}
						className="rounded-[14px]"
						onPress={handleLogin}
					/>
					<View className="my-6 flex-row items-center gap-[10px]">
						<View className="h-px flex-1 bg-line2" />
						<Text variant="micro" className="uppercase tracking-[2.4px] font-bold text-fg4">
							ou continue com
						</Text>
						<View className="h-px flex-1 bg-line2" />
					</View>

					<SocialAuthRow
						onGooglePress={() => void handleSocialLogin('google')}
						onApplePress={() => void handleSocialLogin('apple')}
						googleDisabled={loading || socialLoading !== null}
						appleDisabled={loading || socialLoading !== null}
					/>

					<View className="mt-9 items-center">
						<Text variant="label" className="text-fg3">
							Ainda nao tem conta?
						</Text>
						<Pressable
							accessibilityRole="button"
							onPress={() => router.push('/(auth)/signup')}
							className="mt-2"
						>
							<Text variant="label" className="font-bold" style={{ color: '#22B76C' }}>
								Criar conta gratis
							</Text>
						</Pressable>
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
