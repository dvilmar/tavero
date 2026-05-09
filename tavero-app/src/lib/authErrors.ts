import i18n from '@/lib/i18n'

const FALLBACK: Record<string, string> = {
  rateLimit: 'Too many attempts. Try again later.',
  emailNotConfirmed: 'Email not confirmed. Check your inbox.',
  invalidCredentials: 'Invalid email or password.',
  userNotFound: 'No account found with this email.',
  network: 'Connection error. Check your internet.',
}

export function translateAuthError(message: string): string {
  const m = message.toLowerCase()

  if (
    m.includes('rate limit') ||
    m.includes('too many requests') ||
    m.includes('over_email_send_rate_limit') ||
    m.includes('for security purposes') ||
    m.includes('request this once every')
  ) return safeT('rateLimit')

  if (m.includes('email not confirmed'))
    return safeT('emailNotConfirmed')

  if (m.includes('invalid login credentials') || m.includes('invalid credential'))
    return safeT('invalidCredentials')

  if (m.includes('user not found'))
    return safeT('userNotFound')

  if (m.includes('network') || m.includes('fetch'))
    return safeT('network')

  return safeT('rateLimit') ? safeT('common.error') : 'An error occurred.'
}

function safeT(key: string): string {
  try {
    if (i18n.isInitialized) return i18n.t(key)
  } catch { /* ignore */ }
  return FALLBACK[key] ?? key
}
