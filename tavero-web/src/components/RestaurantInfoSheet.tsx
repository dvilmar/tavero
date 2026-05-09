'use client'

import { useEffect, useCallback } from 'react'
import type { Restaurant } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { SocialLinks } from '@/components/SocialLinks'

type Props = {
  restaurant: Restaurant
  locale: Locale
  open: boolean
  onClose: () => void
}

export function RestaurantInfoSheet({ restaurant, locale, open, onClose }: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
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

  const hasContact = restaurant.phone || restaurant.address || restaurant.whatsapp_number
  const hasWifi = restaurant.wifi_name
  const hasSocial = restaurant.instagram_url || restaurant.facebook_url || restaurant.tiktok_url || restaurant.twitter_url || restaurant.website_url

  return (
    <div
      className="fixed inset-0 z-50 animate-fade-overlay backdrop-sheet"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface rounded-t-3xl animate-slide-up max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
          aria-label={t(locale, 'menu.close')}
        >
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto overscroll-contain px-6 pb-8 pt-3">
          <h3 className="text-lg font-bold text-primary mb-5">
            {t(locale, 'menu.info')}
          </h3>

          <div className="space-y-4">
            {/* Phone */}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-bg border border-border hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-accentSoft flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t(locale, 'menu.phone')}</p>
                  <p className="text-sm font-medium text-primary">{restaurant.phone}</p>
                </div>
              </a>
            )}

            {/* WhatsApp */}
            {restaurant.whatsapp_number && (() => {
              const clean = restaurant.whatsapp_number.replace(/\D/g, '')
              return (
                <a
                  href={`https://wa.me/${clean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-xl bg-bg border border-border hover:border-accent/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#25D36622' }}>
                    <svg className="w-5 h-5" fill="#25D366" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t(locale, 'menu.whatsapp')}</p>
                    <p className="text-sm font-medium text-primary">{restaurant.whatsapp_number}</p>
                  </div>
                </a>
              )
            })()}

            {/* Address */}
            {restaurant.address && (
              <a
                href={restaurant.latitude && restaurant.longitude
                  ? `https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`
                  : `https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-bg border border-border hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-accentSoft flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t(locale, 'menu.address')}</p>
                  <p className="text-sm font-medium text-primary">{restaurant.address}</p>
                </div>
              </a>
            )}

            {/* Wi-Fi */}
            {hasWifi && (
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-bg border border-border">
                <div className="w-10 h-10 rounded-full bg-accentSoft flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t(locale, 'menu.wifi')}</p>
                  <p className="text-sm font-medium text-primary">{restaurant.wifi_name}</p>
                  {restaurant.wifi_password && (
                    <p className="text-xs text-muted mt-0.5">
                      {t(locale, 'menu.wifiPassword')}: <span className="font-mono font-medium text-primary">{restaurant.wifi_password}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Social links */}
            {hasSocial && (
              <div className="pt-2">
                <SocialLinks restaurant={restaurant} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
