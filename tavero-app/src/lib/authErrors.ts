import i18n from '@/lib/i18n'

export function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  const t = i18n.t.bind(i18n)

  if (
    m.includes('rate limit') ||
    m.includes('too many requests') ||
    m.includes('over_email_send_rate_limit') ||
    m.includes('for security purposes') ||
    m.includes('request this once every')
  ) return t('authErrors.rateLimit')

  if (m.includes('email not confirmed'))
    return t('authErrors.emailNotConfirmed')

  if (m.includes('invalid login credentials') || m.includes('invalid credential'))
    return t('authErrors.invalidCredentials')

  if (m.includes('user not found'))
    return t('authErrors.userNotFound')

  if (m.includes('network') || m.includes('fetch'))
    return t('authErrors.network')

  return t('common.error')
}
