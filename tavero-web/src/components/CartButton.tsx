'use client'

import { CURRENCY_SYMBOL } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

type Props = {
  count: number
  total: number
  locale: Locale
  onClick: () => void
}

export function CartButton({ count, total, locale, onClick }: Props) {
  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-40 flex items-center justify-between px-5 py-3.5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: '#25D366' }}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
          {count}
        </span>
        <span className="text-white text-sm font-semibold">{t(locale, 'menu.viewOrder')}</span>
      </div>
      <span className="text-white font-bold text-sm">
        {total.toFixed(2)}{CURRENCY_SYMBOL}
      </span>
    </button>
  )
}
