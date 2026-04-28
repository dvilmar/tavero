import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Tavero',
  description: 'Política de privacidad de la aplicación Tavero.',
}

const LAST_UPDATED = '28 de abril de 2026'
const CONTACT_EMAIL = 'dvm3manantial@gmail.com'

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--color-primary))' }}>
        Política de Privacidad
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgb(var(--color-muted))' }}>
        Última actualización: {LAST_UPDATED}
      </p>

      <section className="space-y-8 text-sm leading-relaxed" style={{ color: 'rgb(var(--color-primary))' }}>

        <div>
          <h2 className="font-semibold text-base mb-2">1. Responsable</h2>
          <p>
            Tavero es una aplicación de gestión de menús digitales para restaurantes y bares.
            El responsable del tratamiento de los datos es el titular de la cuenta registrada en la aplicación.
            Para cualquier consulta puedes escribirnos a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">2. Datos que recogemos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cuenta:</strong> dirección de correo electrónico para autenticación.</li>
            <li><strong>Contenido del menú:</strong> nombres, descripciones, precios e imágenes de productos y categorías que el propietario introduce voluntariamente.</li>
            <li><strong>Imágenes:</strong> fotos de platos subidas desde la galería del dispositivo.</li>
            <li><strong>Uso de la app:</strong> eventos de arranque en frío para analíticas de uso (a través de Expo Insights), sin datos personales identificables.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">3. Finalidad y base legal</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prestar el servicio de menú digital (ejecución del contrato).</li>
            <li>Mejorar la aplicación mediante analíticas agregadas y anónimas (interés legítimo).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">4. Terceros que acceden a los datos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — base de datos y almacenamiento de imágenes (servidores en la UE).</li>
            <li><strong>Vercel</strong> — alojamiento del menú web público.</li>
            <li><strong>Expo / EAS</strong> — distribución y actualizaciones de la aplicación móvil.</li>
          </ul>
          <p className="mt-2">
            No vendemos ni cedemos datos a terceros con fines publicitarios.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">5. Permisos del dispositivo</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Galería / almacenamiento:</strong> para subir fotos de platos. Solo se accede cuando el usuario lo solicita.</li>
            <li><strong>Micrófono:</strong> declarado como permiso de Android pero no se usa actualmente.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">6. Conservación de datos</h2>
          <p>
            Los datos se conservan mientras la cuenta esté activa. Al eliminar la cuenta se eliminan
            todos los datos asociados en un plazo máximo de 30 días.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">7. Tus derechos</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad y oposición
            escribiendo a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.
            Responderemos en un plazo máximo de 30 días.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">8. Cambios en esta política</h2>
          <p>
            Cualquier modificación relevante se notificará a través de la aplicación o por correo
            electrónico con al menos 15 días de antelación.
          </p>
        </div>

      </section>
    </main>
  )
}
