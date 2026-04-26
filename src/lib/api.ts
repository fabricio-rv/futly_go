export function getApiUrl(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	if (typeof window !== 'undefined' && window.location?.origin) {
		return `${window.location.origin}${normalizedPath}`;
	}

	const configuredUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_APP_URL;
	const baseUrl = configuredUrl?.replace(/\/$/, '') || 'https://futlygo.vercel.app';
	return `${baseUrl}${normalizedPath}`;
}
