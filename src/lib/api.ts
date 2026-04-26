export function getApiUrl(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const configuredUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_APP_URL;
	const normalizedConfiguredUrl = configuredUrl?.replace(/\/$/, '');

	// On web we may host frontend and API on different domains.
	// If EXPO_PUBLIC_API_URL is configured, always prefer it.
	if (normalizedConfiguredUrl) {
		return `${normalizedConfiguredUrl}${normalizedPath}`;
	}

	if (typeof window !== 'undefined' && window.location?.origin) {
		return `${window.location.origin}${normalizedPath}`;
	}

	const baseUrl = 'https://futlygo.vercel.app';
	return `${baseUrl}${normalizedPath}`;
}
