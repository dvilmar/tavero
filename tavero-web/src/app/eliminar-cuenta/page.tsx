import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eliminar cuenta · Tavero',
  description: 'Solicita la eliminación de tu cuenta y datos de Tavero.',
}

const CONTACT_EMAIL = 'dvm3manantial@gmail.com'
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta&body=Hola%2C%0A%0ASolicito%20la%20eliminaci%C3%B3n%20de%20mi%20cuenta%20y%20todos%20los%20datos%20asociados.%0A%0ACorreo%20de%20la%20cuenta%3A%20`

export default function EliminarCuentaPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-xl mx-auto flex flex-col items-center justify-center text-center">

      <div className="mb-6 text-4xl">🗑️</div>

      <h1 className="text-2xl font-bold mb-3" style={{ color: 'rgb(var(--color-primary))' }}>
        Eliminar cuenta
      </h1>

      <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgb(var(--color-muted))' }}>
        Al eliminar tu cuenta se borrarán permanentemente todos tus datos: menú, categorías,
        productos e imágenes. Esta acción no se puede deshacer.
      </p>

      <div
        className="w-full rounded-xl border p-6 mb-8 text-left space-y-3 text-sm"
        style={{
          borderColor: 'rgb(var(--color-border))',
          backgroundColor: 'rgb(var(--color-surface))',
          color: 'rgb(var(--color-primary))',
        }}
      >
        <p className="font-semibold">¿Qué se elimina?</p>
        <ul className="list-disc pl-5 space-y-1" style={{ color: 'rgb(var(--color-muted))' }}>
          <li>Tu cuenta y credenciales de acceso</li>
          <li>Todos los productos y categorías de tu menú</li>
          <li>Las imágenes subidas a la aplicación</li>
          <li>La URL pública de tu menú digital</li>
        </ul>
      </div>

      <a
        href={MAILTO}
        className="inline-block w-full rounded-lg py-3 px-6 text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'rgb(var(--color-accent))' }}
      >
        Solicitar eliminación por correo
      </a>

      <p className="mt-4 text-xs" style={{ color: 'rgb(var(--color-muted))' }}>
        Responderemos y eliminaremos tu cuenta en un plazo máximo de 30 días.
      </p>
    </main>
  )
}
