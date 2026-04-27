export function translateAuthError(message: string): string {
  const m = message.toLowerCase()

  if (
    m.includes('rate limit') ||
    m.includes('too many requests') ||
    m.includes('over_email_send_rate_limit') ||
    m.includes('for security purposes') ||
    m.includes('request this once every')
  ) return 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.'

  if (m.includes('email not confirmed'))
    return 'Confirma tu email antes de iniciar sesión.'

  if (m.includes('invalid login credentials') || m.includes('invalid credential'))
    return 'Contraseña incorrecta.'

  if (m.includes('user not found'))
    return 'No existe ninguna cuenta con ese email.'

  if (m.includes('network') || m.includes('fetch'))
    return 'Error de conexión. Comprueba tu internet e inténtalo de nuevo.'

  return message
}
