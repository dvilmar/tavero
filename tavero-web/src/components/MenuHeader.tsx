'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Restaurant } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { RestaurantInfoSheet } from '@/components/RestaurantInfoSheet'

type Props = {
  restaurant: Restaurant
  locale: Locale
}

export function MenuHeader({ restaurant, locale }: Props) {
  const [infoOpen, setInfoOpen] = useState(false)
  const accent = 'var(--color-accent, 17 24 39)'

  const hasInfo = restaurant.phone || restaurant.address || restaurant.wifi_name || restaurant.whatsapp_number
  const hasBanner = !!restaurant.menu_banner_url

  return (
    <>
      <div className="relative overflow-hidden" style={{ backgroundColor: `rgb(${accent})` }}>
        {/* Cover image */}
        {hasBanner ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <Image
              src={restaurant.menu_banner_url!}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
          </div>
        ) : (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />
          </div>
        )}

        {/* Restaurant info overlay */}
        <div className="relative px-5 -mt-14 pb-3">
          {/* Logo */}
          <div className="mb-2.5">
            {restaurant.logo_url ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/25 shadow-lg bg-white/10">
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {restaurant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-white/75 text-[13px] mt-0.5 leading-relaxed line-clamp-2">
              {restaurant.description}
            </p>
          )}

          {/* Info row */}
          <div className="flex items-center mt-2.5">
            {hasInfo && (
              <button
                onClick={() => setInfoOpen(true)}
                className="inline-flex items-center gap-1.5 text-white/70 text-xs hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t(locale, 'menu.tapForInfo')}
              </button>
            )}
          </div>
        </div>
      </div>

      <RestaurantInfoSheet
        restaurant={restaurant}
        locale={locale}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </>
  )
}
