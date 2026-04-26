import type { AuthError, User } from '@supabase/supabase-js';

import { supabase } from '@/src/lib/supabase';
import { sendWelcomeEmail } from '@/src/features/email/resendService';
import { getApiUrl } from '@/src/lib/api';

export type SignupPayload = {
	fullName: string;
	email: string;
	password: string;
	phone: string | null;
	state: string | null;
	city: string | null;
	cep: string | null;
};

export function normalizeAuthError(error: AuthError | Error | null) {
	if (!error) return 'Ocorreu um erro inesperado. Tente novamente.';
	const message = error.message.toLowerCase();

	if (message.includes('invalid login credentials')) return 'E-mail ou senha inválidos.';
	if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
	if (message.includes('already registered')) return 'Este e-mail já está cadastrado.';
	if (message.includes('password should be at least')) return 'A senha precisa ter no mínimo 6 caracteres.';
	if (message.includes('unable to validate email')) return 'Digite um e-mail válido.';
	if (message.includes('same_password')) return 'A nova senha deve ser diferente da senha atual.';
	if (message.includes('expired')) return 'Código expirado. Solicite um novo código.';
	if (message.includes('token')) return 'Código inválido. Revise e tente novamente.';

	return error.message;
}

export function sanitizeEmail(value: string) {
	return value.trim().toLowerCase();
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

	// Backfill defensivo para contas antigas sem profile.
	await ensureCurrentUserProfile().catch(() => undefined);
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

	// Enviar email de boas-vindas
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
