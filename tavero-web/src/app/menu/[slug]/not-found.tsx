export default function MenuNotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accentSoft flex items-center justify-center">
          <span className="text-5xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight mb-2">
          Menú no encontrado
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-6">
          Este código QR no apunta a ningún restaurante activo, o el bar
          ha pausado temporalmente su menú digital.
        </p>
        <div className="bg-surface border border-border rounded-2xl px-5 py-4 text-left">
          <p className="text-xs font-semibold text-primary mb-1">¿Qué puedes hacer?</p>
          <ul className="text-xs text-muted space-y-1 leading-relaxed">
            <li>• Comprueba que escaneaste bien el QR</li>
            <li>• Pídele al camarero el enlace correcto</li>
            <li>• Vuelve a intentarlo más tarde</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
