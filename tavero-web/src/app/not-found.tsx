import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="text-7xl mb-4">🍽️</div>
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">404</h1>
        <p className="text-muted text-base mb-8 leading-relaxed">
          Esta página no existe.<br />Quizás te equivocaste de enlace.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-bg font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
