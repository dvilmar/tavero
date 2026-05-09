'use client'

export default function MenuError() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-accentSoft flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold mb-2">Error al cargar el menú</h1>
        <p className="text-muted text-sm">
          No se ha podido cargar el menú. Vuelve a intentarlo o contacta con el restaurante.
        </p>
      </div>
    </div>
  )
}
