import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tavero — Menú digital con QR para bares y restaurantes',
  description: 'Crea tu menú digital en minutos. Tus clientes lo consultan escaneando un QR. Sin papel, sin actualizaciones manuales.',
}

const FEATURES = [
  {
    icon: '📱',
    title: 'Menú siempre actualizado',
    desc: 'Edita precios, añade platos y oculta categorías desde tu móvil. Los cambios se publican al instante.',
  },
  {
    icon: '🎨',
    title: 'Diseño personalizado',
    desc: 'Elige colores y tipografía para que el menú refleje la identidad de tu bar. Sube tu logo y foto de portada.',
  },
  {
    icon: '🌾',
    title: 'Alérgenos y etiquetas',
    desc: 'Marca vegano, sin gluten, picante y más. Informa a tus clientes con claridad y cumple la normativa.',
  },
  {
    icon: '📋',
    title: 'Múltiples menús',
    desc: 'Crea menú del día, carta de vinos o menú de temporada. Actívalos por horario automáticamente.',
  },
  {
    icon: '📊',
    title: 'Estadísticas de visitas',
    desc: 'Descubre cuántas veces consultan tu menú cada día. Conoce mejor a tus clientes sin esfuerzo.',
  },
  {
    icon: '📢',
    title: 'Banners promocionales',
    desc: 'Anuncia el menú del día, ofertas especiales o eventos con banners en la parte superior del menú.',
  },
]

const STEPS = [
  { n: '1', title: 'Crea tu bar', desc: 'Regístrate, añade el nombre y sube tu logo en menos de 2 minutos.' },
  { n: '2', title: 'Diseña tu menú', desc: 'Añade categorías, platos, precios, fotos y alérgenos desde la app.' },
  { n: '3', title: 'Imprime el QR', desc: 'Descarga y personaliza tu código QR. Ponlo en las mesas y ¡listo!' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917]">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E7E5E4]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Tavero</span>
          <a
            href="https://apps.apple.com"
            className="text-sm font-semibold text-white bg-[#111827] px-4 py-2 rounded-full hover:bg-[#1f2937] transition-colors"
          >
            Descargar app
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#F3F4F6] text-[#374151] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Menús digitales para bares y restaurantes
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Tu menú digital,<br />
              <span className="text-[#6B7280]">siempre a punto.</span>
            </h1>
            <p className="text-lg text-[#78716C] leading-relaxed mb-8 max-w-xl">
              Crea un menú digital profesional en minutos. Tus clientes lo consultan escaneando un QR desde su móvil. Sin papel, sin apps que instalar.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com"
                className="inline-flex items-center gap-2 bg-[#111827] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1f2937] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href="https://play.google.com"
                className="inline-flex items-center gap-2 border border-[#E7E5E4] text-[#1C1917] font-semibold px-6 py-3 rounded-full hover:border-[#9CA3AF] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.18 23.76c.3.17.64.24.99.19l12.6-7.27-2.75-2.75-10.84 9.83zM.54 1.27C.2 1.6 0 2.13 0 2.82v18.36c0 .69.2 1.22.54 1.55l.08.08 10.28-10.28v-.24L.62 1.19l-.08.08zM20.12 10.55l-2.9-1.67-3.07 3.07 3.07 3.07 2.92-1.68c.83-.48.83-1.26-.02-1.79zM4.17.24L16.77 7.5 14.02 10.25 3.18.42c.3-.2.66-.25.99-.18z" />
                </svg>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mock menu preview */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#111827] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
            <div className="flex-1 text-white">
              <h2 className="text-2xl font-bold mb-3">Un menú que impresiona</h2>
              <p className="text-[#9CA3AF] leading-relaxed mb-6">
                Diseño limpio y profesional con soporte para fotos de platos, categorías con imagen, alérgenos certificados, y modo oscuro automático.
              </p>
              <ul className="space-y-2">
                {['Fotos de alta calidad', 'Categorías con imagen de portada', 'Alérgenos y etiquetas', 'Modo oscuro automático'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#D1D5DB]">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Phone mockup */}
            <div className="flex-shrink-0">
              <div className="w-52 bg-[#0C0A09] rounded-[2rem] border-4 border-[#374151] shadow-2xl overflow-hidden">
                {/* Status bar */}
                <div className="h-6 bg-[#0C0A09] flex items-center justify-center">
                  <div className="w-16 h-3 bg-[#1C1917] rounded-full" />
                </div>
                {/* Header */}
                <div className="bg-[#111827] p-4 pb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#374151] mb-3" />
                  <div className="h-4 w-24 bg-[#374151] rounded-full mb-1.5" />
                  <div className="h-2.5 w-32 bg-[#374151]/60 rounded-full" />
                </div>
                {/* Category nav */}
                <div className="bg-[#1C1917] px-3 py-2 flex gap-2 overflow-hidden">
                  <div className="h-6 w-14 bg-[#FAFAF9] rounded-full flex-shrink-0" />
                  <div className="h-6 w-16 bg-[#374151] rounded-full flex-shrink-0" />
                  <div className="h-6 w-12 bg-[#374151] rounded-full flex-shrink-0" />
                </div>
                {/* Products */}
                <div className="bg-[#0C0A09] px-3 py-3 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="h-3 bg-[#374151] rounded-full w-28 mb-1.5" />
                        <div className="h-2 bg-[#374151]/50 rounded-full w-20 mb-1" />
                        <div className="h-2.5 bg-[#F59E0B]/60 rounded-full w-10" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#374151] flex-shrink-0" />
                    </div>
                  ))}
                </div>
                <div className="h-6 bg-[#0C0A09]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Todo lo que necesita tu bar</h2>
            <p className="text-[#78716C]">Herramientas pensadas para hosteleros, no para informáticos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-4 text-xl">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-sm text-[#78716C] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">En 3 pasos</h2>
            <p className="text-[#78716C]">Empieza hoy mismo. Sin cursos, sin instalaciones complicadas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#111827] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-[#78716C] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#111827] text-white rounded-3xl px-8 py-14 text-center">
            <h2 className="text-3xl font-bold mb-3">Empieza gratis hoy</h2>
            <p className="text-[#9CA3AF] mb-8 max-w-md mx-auto">
              Sin tarjeta de crédito. Sin compromisos. Descarga Tavero y ten tu menú digital listo en minutos.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://apps.apple.com"
                className="inline-flex items-center gap-2 bg-white text-[#111827] font-semibold px-6 py-3 rounded-full hover:bg-[#F3F4F6] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href="https://play.google.com"
                className="inline-flex items-center gap-2 border border-[#374151] text-white font-semibold px-6 py-3 rounded-full hover:border-[#6B7280] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.18 23.76c.3.17.64.24.99.19l12.6-7.27-2.75-2.75-10.84 9.83zM.54 1.27C.2 1.6 0 2.13 0 2.82v18.36c0 .69.2 1.22.54 1.55l.08.08 10.28-10.28v-.24L.62 1.19l-.08.08zM20.12 10.55l-2.9-1.67-3.07 3.07 3.07 3.07 2.92-1.68c.83-.48.83-1.26-.02-1.79zM4.17.24L16.77 7.5 14.02 10.25 3.18.42c.3-.2.66-.25.99-.18z" />
                </svg>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E4] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold">Tavero</span>
          <div className="flex gap-6 text-sm text-[#78716C]">
            <Link href="/privacidad" className="hover:text-[#1C1917] transition-colors">Privacidad</Link>
            <Link href="/eliminar-cuenta" className="hover:text-[#1C1917] transition-colors">Eliminar cuenta</Link>
          </div>
          <p className="text-sm text-[#78716C]">© {new Date().getFullYear()} Tavero</p>
        </div>
      </footer>

    </div>
  )
}
