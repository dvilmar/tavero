'use client'

import { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import type { Product, ProductVariant } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { CURRENCY_SYMBOL } from '@/lib/config'
import { AllergenList } from '@/components/AllergenList'
import { LabelBadge } from '@/components/LabelBadge'

type Props = {
  product: Product | null
  locale: Locale
  onClose: () => void
  slug?: string
  onAddToCart?: (product: Product, variant?: ProductVariant) => void
}

export function ProductBottomSheet({ product, locale, onClose, slug, onAddToCart }: Props) {
  const [copied, setCopied] = useState(false)
  const [added, setAdded] = useState<string | null>(null)

  const handleShare = useCallback(async () => {
    if (!product) return
    const url = slug ? `${window.location.origin}/menu/${slug}?p=${product.id}` : window.location.href
    if (navigator.share) {
      await navigator.share({ title: product.name, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [product, slug])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!product) return
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [product, handleKeyDown])

  if (!product) return null

  const hasVariants = product.variants.length > 0

  return (
    <div
      className="fixed inset-0 z-50 animate-fade-overlay backdrop-sheet"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface rounded-t-3xl animate-slide-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Top bar: close + share */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label={t(locale, 'menu.share')}
          >
            {copied ? (
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label={t(locale, 'menu.close')}
          >
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain">
          {/* Image */}
          {product.image_url && (
            <div className="relative w-full aspect-[16/10] bg-bg">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
          )}

          <div className="px-6 pb-8 pt-4 space-y-4">
            {/* Labels */}
            {product.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.labels.map((label) => (
                  <LabelBadge key={label} label={label} locale={locale} />
                ))}
              </div>
            )}

            {/* Name & Price */}
            <div>
              <h3 className={`text-xl font-bold leading-tight ${product.out_of_stock ? 'text-muted line-through' : 'text-primary'}`}>
                {product.name}
              </h3>
              {product.out_of_stock && (
                <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide text-red-500">
                  {t(locale, 'menu.outOfStock')}
                </span>
              )}
              {product.description && (
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price or Variants */}
            {!product.out_of_stock && hasVariants ? (
              <div className="space-y-2">
                {product.variants
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((variant) => {
                    const isAdded = added === variant.id
                    return (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-bg border border-border"
                      >
                        <span className="text-sm font-medium text-primary">{variant.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-accent tabular-nums">
                            {Number(variant.price).toFixed(2)} {CURRENCY_SYMBOL}
                          </span>
                          {onAddToCart && (
                            <button
                              onClick={() => {
                                onAddToCart(product, variant)
                                setAdded(variant.id)
                                setTimeout(() => setAdded(null), 1200)
                              }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all ${isAdded ? 'scale-90' : 'hover:scale-110 active:scale-90'}`}
                              style={{ backgroundColor: isAdded ? '#16a34a' : '#25D366' }}
                              aria-label={t(locale, 'menu.addToOrder')}
                            >
                              {isAdded ? '✓' : '+'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : !product.out_of_stock ? (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-baseline gap-1.5 bg-accentSoft px-3.5 py-1.5 rounded-xl">
                  <span className="text-lg font-bold text-accent tabular-nums">
                    {Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-muted">{CURRENCY_SYMBOL}</span>
                </div>
                {onAddToCart && (() => {
                  const isAdded = added === 'main'
                  return (
                    <button
                      onClick={() => {
                        onAddToCart(product)
                        setAdded('main')
                        setTimeout(() => setAdded(null), 1200)
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all ${isAdded ? 'scale-95' : 'hover:opacity-90 active:scale-95'}`}
                      style={{ backgroundColor: isAdded ? '#16a34a' : '#25D366' }}
                    >
                      {isAdded ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {t(locale, 'menu.added')}
                        </>
                      ) : (
                        <>
                          <span className="text-lg leading-none">+</span>
                          {t(locale, 'menu.addToOrder')}
                        </>
                      )}
                    </button>
                  )
                })()}
              </div>
            ) : null}

            {/* Allergens */}
            {product.allergens.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2.5">
                  {t(locale, 'menu.allergens')}
                </p>
                <AllergenList allergens={product.allergens} locale={locale} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
