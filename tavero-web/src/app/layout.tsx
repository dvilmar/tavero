import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tavero-web.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tavero — Menú Digital',
    template: '%s · Tavero',
  },
  description: 'Escanea el QR y consulta el menú del bar al instante.',
  applicationName: 'Tavero',
  authors: [{ name: 'Tavero' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Tavero',
    title: 'Tavero — Menú Digital',
    description: 'Escanea el QR y consulta el menú del bar al instante.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tavero — Menú Digital',
    description: 'Escanea el QR y consulta el menú del bar al instante.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF9' },
    { media: '(prefers-color-scheme: dark)',  color: '#0C0A09' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// Inline script that runs before paint — prevents dark-mode flash
const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&d)){document.documentElement.classList.add('dark')}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
