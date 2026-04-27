import type { AuthError, User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { sendWelcomeEmail } from '@/src/features/email/resendService';
import { getApiUrl } from '@/src/lib/api';
import { supabase } from '@/src/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type SignupPayload = {
	fullName: string;
	email: string;
	password: string;
	phone: string | null;
	state: string | null;
	city: string | null;
	cep: string | null;
};

export type SocialProvider = 'google' | 'apple';

export function normalizeAuthError(error: AuthError | Error | null) {
	if (!error) return 'Ocorreu um erro inesperado. Tente novamente.';
	const message = error.message.toLowerCase();

	if (message.includes('invalid login credentials')) return 'E-mail ou senha invalidos.';
	if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
	if (message.includes('already registered')) return 'Este e-mail já esta cadastrado.';
	if (message.includes('password should be at least')) return 'A senha precisa ter no minimo 6 caracteres.';
	if (message.includes('unable to validate email')) return 'Digite um e-mail valido.';
	if (message.includes('same_password')) return 'A nova senha deve ser diferente da senha atual.';
	if (message.includes('expired')) return 'Código expirado. Solicite um novo código.';
	if (message.includes('token')) return 'Código invalido. Revise e tente novamente.';

	return error.message;
}

export function sanitizeEmail(value: string) {
	return value.trim().toLowerCase();
}

function getOAuthRedirectUri() {
	return AuthSession.makeRedirectUri({
		path: 'login-callback',
	});
}

function normalizeSocialErrorMessage(message: string) {
	const normalized = message.toLowerCase();

	if (normalized.includes('access_denied') || normalized.includes('cancel')) {
		return 'Login cancelado.';
	}

	return message;
}

function parseFragmentParams(url: string) {
	const hashIndex = url.indexOf('#');
	if (hashIndex < 0) return new URLSearchParams();

	const fragment = url.slice(hashIndex + 1);
	return new URLSearchParams(fragment);
}

async function requestEmailAction<T>(path: string, body: unknown) {
	const response = await fetch(getApiUrl(path), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const data = (await response.json().catch(() => null)) as T | { error?: string } | null;

	if (!response.ok) {
		const message = data && typeof data === 'object' && 'error' in data && data.error ? data.error : 'Não foi possível enviar o e-mail.';
		throw new Error(message);
	}

	return data as T;
}

function extractProfileFromUser(user: User) {
	return {
		id: user.id,
		full_name: String(user.user_metadata?.full_name ?? '').trim() || 'Atleta Futly',
		email: sanitizeEmail(user.email ?? ''),
		phone: user.user_metadata?.phone ? String(user.user_metadata.phone) : null,
		state: user.user_metadata?.state ? String(user.user_metadata.state) : null,
		city: user.user_metadata?.city ? String(user.user_metadata.city) : null,
		cep: user.user_metadata?.cep ? String(user.user_metadata.cep) : null,
	};
}

export async function ensureCurrentUserProfile() {
	const { data, error } = await supabase.auth.getUser();
	if (error || !data.user || !data.user.email) return;

	const profile = extractProfileFromUser(data.user);
	const { error: upsertError } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });

	if (upsertError) {
		throw new Error('Falha ao sincronizar perfil.');
	}
}

export async function signInWithPassword(email: string, password: string) {
	const { error } = await supabase.auth.signInWithPassword({
		email: sanitizeEmail(email),
		password,
	});

	if (error) {
		throw new Error(normalizeAuthError(error));
	}

	await ensureCurrentUserProfile().catch(() => undefined);
}

export async function signInWithSocial(provider: SocialProvider) {
	const redirectTo = getOAuthRedirectUri();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo,
			skipBrowserRedirect: true,
			queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
		},
	});

	if (error || !data?.url) {
		throw new Error(normalizeAuthError(error));
	}

	const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

	if (result.type !== 'success' || !result.url) {
		throw new Error('Login cancelado.');
	}

	const callbackUrl = new URL(result.url);
	const authCode = callbackUrl.searchParams.get('code');
	const providerError =
		callbackUrl.searchParams.get('error_description') ??
		callbackUrl.searchParams.get('error');
	const fragmentParams = parseFragmentParams(result.url);
	const accessToken = fragmentParams.get('access_token');
	const refreshToken = fragmentParams.get('refresh_token');
	const fragmentError =
		fragmentParams.get('error_description') ??
		fragmentParams.get('error');

	if (providerError || fragmentError) {
		throw new Error(normalizeSocialErrorMessage(providerError ?? fragmentError ?? 'Erro no login social.'));
	}

	if (authCode) {
		const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);

		if (exchangeError) {
			throw new Error(normalizeAuthError(exchangeError));
		}
	} else if (accessToken && refreshToken) {
		const { error: sessionError } = await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken,
		});

		if (sessionError) {
			throw new Error(normalizeAuthError(sessionError));
		}
	} else {
		throw new Error('Não foi possível concluir o login social.');
	}

	await ensureCurrentUserProfile().catch(() => undefined);
}

export async function isProfileMissingRequiredData() {
	const { data, error } = await supabase.auth.getUser();
	if (error || !data.user) return false;

	const { data: profile } = await supabase
		.from('profiles')
		.select('state, city, cep')
		.eq('id', data.user.id)
		.maybeSingle();

	if (!profile) return true;

	const hasState = Boolean(profile.state?.trim());
	const hasCity = Boolean(profile.city?.trim());
	const hasCep = Boolean(profile.cep?.trim());

	return !(hasState && hasCity && hasCep);
}

export async function signUpWithProfile(payload: SignupPayload) {
	await requestEmailAction<{ userId: string; requiresEmailConfirmation: boolean }>('/api/auth-signup', {
		email: sanitizeEmail(payload.email),
		password: payload.password,
		fullName: payload.fullName,
		phone: payload.phone,
		state: payload.state,
		city: payload.city,
		cep: payload.cep,
	});

	await sendWelcomeEmail(payload.email, payload.fullName).catch(() => undefined);

	return {
		requiresEmailConfirmation: true,
	};
}

export async function sendPasswordResetCode(email: string) {
	const sanitizedEmail = sanitizeEmail(email);
	await requestEmailAction('/api/send-password-reset-code', { email: sanitizedEmail });

	return { email: sanitizedEmail };
}

export async function verifyPasswordResetCode(email: string, code: string) {
	const { error } = await supabase.auth.verifyOtp({
		email: sanitizeEmail(email),
		token: code,
		type: 'email',
	});

	if (error) {
		throw new Error(normalizeAuthError(error));
	}
}

export async function updatePassword(newPassword: string) {
	const { error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) {
		throw new Error(normalizeAuthError(error));
	}
}

export async function signOut() {
	await supabase.auth.signOut();
}

export async function deleteAccount() {
	const { error } = await supabase.rpc('delete_my_account');

	if (error) {
		throw new Error('Não foi possível deletar a conta. Tente novamente.');
	}
}
