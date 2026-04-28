const WEB_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL?.replace('/menu', '') ?? 'https://tavero.app'

export const CHECK_EMAIL_URL = `${WEB_BASE_URL}/api/check-email`
export const RESET_REDIRECT_URL = `${WEB_BASE_URL}/auth/callback`

export async function checkEmailExists(email: string): Promise<boolean> {
	const res = await fetch(CHECK_EMAIL_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	})
	if (!res.ok) throw new Error('CHECK_EMAIL_FAILED')

	const payload: unknown = await res.json()
	if (typeof payload === 'object' && payload !== null && 'exists' in payload) {
		return Boolean((payload as { exists?: unknown }).exists)
	}
	throw new Error('CHECK_EMAIL_INVALID_PAYLOAD')
}
