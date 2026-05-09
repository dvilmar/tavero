const WEB_BASE_URL = process.env.EXPO_PUBLIC_MENU_URL?.replace('/menu', '') ?? 'https://tavero.app'

export const RESET_REDIRECT_URL = `${WEB_BASE_URL}/auth/callback`
