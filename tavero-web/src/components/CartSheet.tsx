'use client'

import { useEffect, useCallback, useState } from 'react'
import { CURRENCY_SYMBOL } from '@/lib/config'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import type { CartItem } from '@/lib/cart'
import { cartKey, cartTotal } from '@/lib/cart'

type Props = {
  open: boolean
  items: CartItem[]
  locale: Locale
  whatsappNumber: string
  restaurantName: string
  onClose: () => void
  onUpdateQty: (key: string, delta: number) => void
  onClear: () => void
  onDeactivate?: () => void
}

export function CartSheet({ open, items, locale, whatsappNumber, restaurantName, onClose, onUpdateQty, onClear, onDeactivate }: Props) {
  const [sent, setSent] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { setSent(false); onClose() }
  }, [onClose])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const total = cartTotal(items)

  const buildMessage = () => {
    const lines = items.map((item) => {
      const label = item.variantName ? `${item.productName} (${item.variantName})` : item.productName
      const subtotal = (item.price * item.qty).toFixed(2)
      return `• ${label} x${item.qty} — ${subtotal}${CURRENCY_SYMBOL}`
    })
    const greeting = t(locale, 'menu.orderGreeting', { name: restaurantName })
    const totalLine = `${t(locale, 'menu.cartTotal')}: ${total.toFixed(2)}${CURRENCY_SYMBOL}`
    const farewell = t(locale, 'menu.orderFarewell')
    return `${greeting}\n\n${lines.join('\n')}\n\n${totalLine}\n\n${farewell}`
  }

  const handleSend = () => {
    const clean = whatsappNumber.replace(/\D/g, '')
    const msg = buildMessage()
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  const handleNewOrder = () => {
    setSent(false)
    onClear()
    onClose()
  }

  const handleDone = () => {
    setSent(false)
    onClear()
    onDeactivate?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 animate-fade-overlay backdrop-sheet"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface rounded-t-3xl animate-slide-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
          aria-label={t(locale, 'menu.close')}
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pt-3 pb-3 flex-shrink-0 border-b border-border">
          <h3 className="text-lg font-bold text-primary">{t(locale, 'menu.myOrder')}</h3>
          <p className="text-xs text-muted mt-0.5">{t(locale, 'menu.pickupOrderHint')}</p>
        </div>

        {/* Items */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-primary font-semibold">{t(locale, 'menu.cartEmpty')}</p>
              <p className="text-muted text-sm mt-1">{t(locale, 'menu.cartEmptyHint')}</p>
            </div>
          ) : (
            items.map((item) => {
              const key = cartKey(item)
              const subtotal = (item.price * item.qty).toFixed(2)
              return (
                <div key={key} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary leading-snug">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted">{item.variantName}</p>
                    )}
                    <p className="text-xs font-bold text-accent mt-0.5">
                      {subtotal}{CURRENCY_SYMBOL}
                    </p>
                  </div>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQty(key, -1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-bg transition-colors text-primary font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold text-primary w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(key, +1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-bg transition-colors text-primary font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {sent ? (
          <div className="flex-shrink-0 px-6 pb-8 pt-5 border-t border-border flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
              <svg className="w-7 h-7" fill="none" stroke="#16a34a" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-primary">{t(locale, 'menu.orderSentTitle')}</p>
              <p className="text-sm text-muted mt-0.5">{t(locale, 'menu.orderSentHint')}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleNewOrder}
                className="w-full py-3 rounded-2xl font-bold text-white"
                style={{ backgroundColor: '#25D366' }}
              >
                {t(locale, 'menu.newOrder')}
              </button>
              <button
                onClick={handleDone}
                className="w-full py-2 text-xs text-muted hover:text-primary transition-colors"
              >
                {t(locale, 'menu.exitOrdering')}
              </button>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="flex-shrink-0 px-6 pb-8 pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">{t(locale, 'menu.cartTotal')}</span>
              <span className="text-lg font-bold text-accent">{total.toFixed(2)}{CURRENCY_SYMBOL}</span>
            </div>
            <button
              onClick={handleSend}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t(locale, 'menu.sendOrder')}
            </button>
            <button
              onClick={onClear}
              className="w-full py-2 text-xs text-muted hover:text-primary transition-colors"
            >
              {t(locale, 'menu.clearOrder')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
