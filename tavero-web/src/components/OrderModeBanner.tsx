'use client'

import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

type Props = {
  locale: Locale
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}

export function OrderModeBanner({ locale, active, onActivate, onDeactivate }: Props) {
  if (active) {
    return (
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-2.5 border-b border-[#25D366]/30" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="flex items-center gap-2">
          <span className="text-base">🛍️</span>
          <span className="text-sm font-semibold" style={{ color: '#15803d' }}>
            {t(locale, 'menu.orderModeActive')}
          </span>
        </div>
        <button
          onClick={onDeactivate}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
          style={{ color: '#15803d', borderColor: '#86efac', backgroundColor: '#dcfce7' }}
        >
          {t(locale, 'menu.cancelOrder')} ×
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-3">
      <button
        onClick={onActivate}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: '#25D366' }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🛍️</span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-bold text-sm leading-tight">{t(locale, 'menu.orderForPickup')}</p>
          <p className="text-white/75 text-xs mt-0.5">{t(locale, 'menu.orderForPickupHint')}</p>
        </div>
        <svg className="w-5 h-5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
