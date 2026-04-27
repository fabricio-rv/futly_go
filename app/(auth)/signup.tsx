import { router } from 'expo-router';
import { Check, Eye, Lock, Mail, UserRound } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cities as getBrazilianCities, states as getBrazilianStates } from 'estados-cidades';

import {
	AuthBackground,
	AuthFeedbackModal,
	SocialAuthRow,
	PasswordStrengthMeter,
	AuthToast,
} from '@/src/components/features/auth';
import { Button, Input, SelectField, Text } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { BRAZIL_STATE_OPTIONS } from '@/src/features/auth/constants';
import {
	isProfileMissingRequiredData,
	signInWithSocial,
	signUpWithProfile,
	type SocialProvider,
} from '@/src/features/auth/service';
import { formatCep } from '@/src/features/location/cep';

function getPasswordStrength(password: string) {
	if (!password) return 0;

	let score = 0;
	if (password.length >= 8) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;
	return Math.min(score, 4);
}

function getStrengthLabel(level: number, t: (key: string, fallback?: string) => string) {
	if (level <= 0) return t('security.passwordStrength.veryWeak', 'Muito fraca - use mais de 8 caracteres');
	if (level === 1) return t('security.passwordStrength.weak', 'Fraca - adicione maiuscula e numero');
	if (level === 2) return t('security.passwordStrength.medium', 'Media - 9 caracteres - maiuscula + numero');
	return t('security.passwordStrength.strong', 'Forte - pronta para uso');
}

function formatDdd(value: string) {
	return value.replace(/\D/g, '').slice(0, 2);
}

function formatPhone(value: string) {
	const digits = value.replace(/\D/g, '').slice(0, 9);

	if (digits.length <= 5) {
		return digits;
	}

	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function SignupScreen() {
	const { t } = useTranslation('auth');
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [ddd, setDdd] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [selectedState, setSelectedState] = useState<string | null>('RS');
	const [selectedCity, setSelectedCity] = useState<string | null>(null);
	const [cep, setCep] = useState('');
	const [acceptedTerms, setAcceptedTerms] = useState(true);
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
		primaryLabel: t('common.close', 'Fechar'),
		onPrimary: () => undefined,
	});

	function showToast(message: string, tone: 'success' | 'error' | 'info' = 'info') {
		setToast({ visible: true, message, tone });
		setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 1800);
	}

	async function navigateAfterSocialLogin() {
		const needsProfileCompletion = await isProfileMissingRequiredData();
		if (needsProfileCompletion) {
			router.replace('/(app)/edit-profile');
			return;
		}

		router.replace('/(app)');
	}

	async function handleSocialSignup(provider: SocialProvider) {
		try {
			setSocialLoading(provider);
			await signInWithSocial(provider);
			showToast('Conta social conectada com sucesso', 'success');
			setTimeout(() => {
				void navigateAfterSocialLogin();
			}, 300);
		} catch (error) {
			const message = error instanceof Error ? error.message : t('errors.socialSignupFailed', 'Não foi possível continuar com login social.');
			showToast('Falha no login social', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: t('errors.socialLoginFailedTitle', 'Falha no login social'),
				message,
				primaryLabel: t('common.close', 'Fechar'),
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
		} finally {
			setSocialLoading(null);
		}
	}

	const passwordLevel = useMemo(() => getPasswordStrength(password), [password]);
	const confirmPasswordError =
		confirmPassword.length > 0 && confirmPassword !== password
			? t('errors.passwordMismatch', 'As senhas não conferem')
			: undefined;
	const availableStateCodes = useMemo(() => getBrazilianStates(), []);
	const stateOptions = useMemo(
		() =>
			BRAZIL_STATE_OPTIONS.filter((state) => availableStateCodes.includes(state.value)).map((state) => ({
				value: state.value,
				label: state.label,
				description: state.value,
			})),
		[availableStateCodes],
	);
	const cityOptions = useMemo(() => {
		if (!selectedState) {
			return [];
		}

		try {
			return getBrazilianCities(selectedState).map((city) => ({
				value: city,
				label: city,
			}));
		} catch {
			return [];
		}
	}, [selectedState]);

	useEffect(() => {
		if (!selectedState || stateOptions.some((item) => item.value === selectedState)) {
			return;
		}

		setSelectedState(stateOptions[0]?.value ?? null);
	}, [selectedState, stateOptions]);

	useEffect(() => {
		if (!selectedState) {
			setSelectedCity(null);
			return;
		}

		setSelectedCity((previous) => {
			if (previous && cityOptions.some((item) => item.value === previous)) {
				return previous;
			}

			if (selectedState === 'RS' && cityOptions.some((item) => item.value === 'Porto Alegre')) {
				return 'Porto Alegre';
			}

			return cityOptions[0]?.value ?? null;
		});
	}, [selectedState, cityOptions]);

	async function handleSignup() {
		if (!fullName.trim() || !email.trim() || !password.trim()) {
			showToast(t('validation.fillRequiredFields', 'Preencha os campos obrigatórios'), 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: t('errors.incompleteDataTitle', 'Dados incompletos'),
				message: t('errors.incompleteSignupDataMessage', 'Preencha nome, e-mail e senha para criar a conta.'),
				primaryLabel: t('common.ok', 'Ok'),
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		if (password.length < 6) {
			showToast(t('validation.passwordTooShort', 'Senha muito curta'), 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: t('errors.invalidPassword', 'Senha invalida'),
				message: t('errors.passwordMinLength', 'A senha precisa ter pelo menos 6 caracteres.'),
				primaryLabel: t('common.ok', 'Ok'),
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		if (confirmPassword !== password) {
			showToast(t('errors.passwordMismatch', 'As senhas não conferem'), 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: t('errors.passwordMismatchTitle', 'Senhas diferentes'),
				message: t('errors.passwordMismatch', 'As senhas não conferem.'),
				primaryLabel: t('common.ok', 'Ok'),
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		if (!acceptedTerms) {
			showToast('Aceite os termos para continuar', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: t('errors.requiredTermsTitle', 'Termos obrigatórios'),
				message: t('errors.requiredTermsMessage', 'Aceite os termos para concluir o cadastro.'),
				primaryLabel: t('common.ok', 'Ok'),
				onPrimary: () => setFeedback((prev) => ({ ...prev, visible: false })),
			});
			return;
		}

		const normalizedPhone = `${ddd}${phone}`.replace(/\D/g, '');

		try {
			setLoading(true);

			const result = await signUpWithProfile({
				fullName,
				email,
				password,
				phone: normalizedPhone.length > 0 ? normalizedPhone : null,
				state: selectedState,
				city: selectedCity,
				cep: cep.replace(/\D/g, '') || null,
			});

			if (result.requiresEmailConfirmation) {
				showToast('Conta criada. Confirme no e-mail', 'success');
				setFeedback({
					visible: true,
					tone: 'success',
					title: 'Conta criada com sucesso',
					message: 'Enviamos um e-mail de confirmação. Após confirmar, faça login para entrar no app.',
					primaryLabel: 'Ir para login',
					onPrimary: () => {
						setFeedback((prev) => ({ ...prev, visible: false }));
						router.replace('/(auth)');
					},
					secondaryLabel: 'Ficar no cadastro',
					onSecondary: () => setFeedback((prev) => ({ ...prev, visible: false })),
				});
				return;
			}

			showToast(t('signup.signupCompleted', 'Cadastro concluído'), 'success');
			setTimeout(() => router.replace('/(app)'), 500);
		} catch (error) {
			const message = error instanceof Error ? error.message : t('errors.signupFailed', 'Não foi possível concluir o cadastro.');
			showToast('Falha no cadastro', 'error');
			setFeedback({
				visible: true,
				tone: 'error',
				title: t('errors.signupFailedTitle', 'Falha no cadastro'),
				message,
				primaryLabel: t('signup.login', 'Ir para login'),
				onPrimary: () => {
					setFeedback((prev) => ({ ...prev, visible: false }));
					router.replace('/(auth)');
				},
				secondaryLabel: t('common.retry', 'Tentar novamente'),
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
				contentContainerStyle={{ paddingBottom: 56 }}
				keyboardShouldPersistTaps="handled"
			>
				<View className="relative pt-5 pb-10">
					<View className="px-6 pt-2">
						<Text variant="heading" className="font-extrabold text-white tracking-[-0.5px]">
							{t('signup.welcomeAthlete', 'Bem-vindo, atleta.')}
						</Text>
						<Text variant="label" className="mt-1 mb-7 leading-[20px] text-fg2">
							{t('signup.welcomeSubtitle', 'Crie sua conta para encontrar partidas perto de você.')}
						</Text>
						<SocialAuthRow
							onGooglePress={() => void handleSocialSignup('google')}
							onApplePress={() => void handleSocialSignup('apple')}
							googleDisabled={loading || socialLoading !== null}
							appleDisabled={loading || socialLoading !== null}
						/>
						<View className="my-6 flex-row items-center gap-[10px]">
							<View className="h-px flex-1 bg-line2" />
							<Text variant="micro" className="uppercase tracking-[2.4px] font-bold text-fg4">
								{t('signup.orFillData', 'ou preencha os dados abaixo')}
							</Text>
							<View className="h-px flex-1 bg-line2" />
						</View>

						<View className="gap-[18px]">
							<Input
								label={t('signup.name', 'Nome completo')}
								value={fullName}
								onChangeText={setFullName}
								placeholder={t('placeholders.fullName', 'Seu nome completo')}
								leftIcon={<UserRound size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
								containerClassName="border-line2 bg-[#0C111E]"
								labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
							/>

							<Input
								label={t('signup.email', 'E-mail')}
								value={email}
								onChangeText={setEmail}
								placeholder={t('placeholders.email', 'seuemail@dominio.com')}
								autoCapitalize="none"
								keyboardType="email-address"
								leftIcon={<Mail size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
								rightIcon={<Check size={14} color="#22B76C" strokeWidth={2.8} />}
								containerClassName="border-line2 bg-[#0C111E]"
								labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
							/>

							<View className="flex-row gap-[10px]">
								<View className="flex-1">
									<Input
										label={t('signup.ddd', 'DDD')}
										value={ddd}
										onChangeText={(value) => setDdd(formatDdd(value))}
										keyboardType="number-pad"
										maxLength={2}
										placeholder="51"
										leftIcon={<Text variant="caption" className="text-fg3 font-semibold">+55</Text>}
										containerClassName="border-line2 bg-[#0C111E]"
										labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
									/>
								</View>
								<View className="flex-1">
									<Input
										label={t('signup.phone', 'Telefone')}
										value={phone}
										onChangeText={(value) => setPhone(formatPhone(value))}
										keyboardType="phone-pad"
										maxLength={10}
										placeholder="99820-1144"
										containerClassName="border-line2 bg-[#0C111E]"
										labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
									/>
								</View>
							</View>

							<Input
								label={t('signup.password', 'Senha')}
								value={password}
								onChangeText={setPassword}
								placeholder={t('placeholders.createPassword', 'Crie uma senha')}
								secureTextEntry={!showPassword}
								leftIcon={<Lock size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
								rightIcon={(
									<Pressable
										accessibilityRole="button"
										onPress={() => setShowPassword((prev) => !prev)}
										className="h-8 w-8 items-center justify-center"
									>
										<Eye size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />
									</Pressable>
								)}
								containerClassName="border-ok bg-[#0C111E]"
								labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
							/>

							<PasswordStrengthMeter level={passwordLevel} label={getStrengthLabel(passwordLevel, t)} />

							<Input
								label={t('signup.confirmPassword', 'Confirmar senha')}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								placeholder={t('placeholders.confirmPassword', 'Repita sua senha')}
								secureTextEntry={!showConfirmPassword}
								error={confirmPasswordError}
								leftIcon={<Lock size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
								rightIcon={(
									<Pressable
										accessibilityRole="button"
										onPress={() => setShowConfirmPassword((prev) => !prev)}
										className="h-8 w-8 items-center justify-center"
									>
										<Eye size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />
									</Pressable>
								)}
								containerClassName={`bg-[#0C111E] ${confirmPasswordError ? 'border-danger' : 'border-line2'}`}
								labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
							/>

							<View className="gap-3">
								<View className="rounded-[14px] border border-[#22B76C40] bg-[#22B76C1A] px-3 py-3">
									<View className="flex-row items-center justify-between">
										<Text variant="label" className="font-semibold text-white">
											{t('signup.location', 'Localização')}
										</Text>
										<Text variant="micro" className="uppercase tracking-[1.6px] font-bold text-[#86E5B4]">
											{t('common.optional', 'Opcional')}
										</Text>
									</View>
									<Text variant="caption" className="mt-1 text-fg2 leading-[18px]">
										{t('signup.locationHint', 'Preencha Estado, Cidade e CEP para indicarmos partidas proximas da sua região.')}
									</Text>
								</View>

								<SelectField
									label={t('signup.state', 'Estado')}
									value={selectedState}
									options={stateOptions}
									onChange={(value) => {
										setSelectedState(value);
										setSelectedCity(null);
									}}
									searchable
									placeholder={t('placeholders.selectState', 'Selecione o estado')}
									disabled={stateOptions.length === 0}
								/>

								<SelectField
									label={t('signup.city', 'Cidade')}
									value={selectedCity}
									options={cityOptions}
									onChange={setSelectedCity}
									searchable
									placeholder={
										!selectedState
											? t('placeholders.selectStateFirst', 'Selecione o estado primeiro')
											: t('placeholders.selectCity', 'Selecione a cidade')
									}
									disabled={!selectedState || cityOptions.length === 0}
								/>

								<Input
									label={t('signup.cep', 'CEP')}
									value={cep}
									onChangeText={(value) => setCep(formatCep(value))}
									keyboardType="number-pad"
									maxLength={9}
									placeholder="00000-000"
									containerClassName="border-line2 bg-[#0C111E]"
									labelClassName="uppercase tracking-[2px] text-[10px] font-bold text-fg3"
								/>
							</View>
						</View>

						<Pressable
							accessibilityRole="checkbox"
							accessibilityState={{ checked: acceptedTerms }}
							onPress={() => setAcceptedTerms((prev) => !prev)}
							className="mt-4 mb-6 flex-row items-center gap-2"
						>
							<View className={`h-6 w-6 rounded-[8px] items-center justify-center ${acceptedTerms ? 'bg-ok' : 'bg-[#0C111E] border border-line2'}`}>
								{acceptedTerms ? <Check size={13} color="#05070B" strokeWidth={2.8} /> : null}
							</View>
							<Text variant="caption" className="flex-1 text-fg3 leading-[18px]">
								Concordo com os{' '}
								<Text variant="caption" className="text-ok font-semibold">
									{t('signup.termsOfUse', 'Termos de Uso')}
								</Text>{' '}
								e{' '}
								<Text variant="caption" className="text-ok font-semibold">
									{t('signup.privacyPolicy', 'Política de Privacidade')}
								</Text>
								{t('signup.ageRequirement', '. Tenho 16+ anos.')}
							</Text>
						</Pressable>

						<Button
							label={t('signup.createAccount', 'Criar conta gratis')}
							variant="primary"
							size="xl"
							loading={loading}
							disabled={loading || socialLoading !== null}
							className="mt-2"
							onPress={handleSignup}
						/>

						<View className="mt-6 items-center">
							<Text variant="label" className="text-fg3">
								{t('signup.alreadyHave', 'Já tem conta?')}
							</Text>
							<Pressable onPress={() => router.replace('/(auth)')} className="mt-2 px-1 py-0.5">
								<Text variant="label" className="font-bold" style={{ color: '#22B76C' }}>
									{t('signup.login', 'Entrar')}
								</Text>
							</Pressable>
						</View>
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
