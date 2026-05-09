'use client'

import Image from 'next/image'
import type { Product } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import { CURRENCY_SYMBOL } from '@/lib/config'
import { LabelBadge } from '@/components/LabelBadge'
import { AllergenList } from '@/components/AllergenList'

type Props = {
  product: Product
  locale: Locale
  onClick: () => void
  orderingMode?: boolean
}

export function ProductCard({ product, locale, onClick, orderingMode }: Props) {
  const hasImage = !!product.image_url
  const hasVariants = product.variants.length > 0
  const hasLabels = product.labels.length > 0
  const hasAllergens = product.allergens.length > 0

  return (
    <article
      className="flex items-start gap-3 px-5 py-3.5 cursor-pointer active:bg-bg/60 transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      <div className="flex-1 min-w-0">
        {/* Name + Labels inline */}
        <h3 className={`font-semibold text-[15px] leading-snug ${product.out_of_stock ? 'text-muted line-through' : 'text-primary'}`}>
          <span>{product.name}</span>
          {hasLabels && (
            <>
              <span className="inline-block w-[6px]" />
              <span className="inline-flex flex-wrap gap-1 items-center">
                {product.labels.slice(0, 2).map((label) => (
                  <LabelBadge key={label} label={label} locale={locale} />
                ))}
              </span>
            </>
          )}
        </h3>

        {/* Price */}
        {hasVariants ? (
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xs text-muted">{t(locale, 'menu.priceFrom')}</span>
            <span className="text-sm font-bold text-accent tabular-nums">
              {Number(Math.min(...product.variants.map((v) => v.price))).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-muted/70">{CURRENCY_SYMBOL}</span>
          </div>
        ) : (
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold text-accent tabular-nums">
              {Number(product.price).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-muted/70">{CURRENCY_SYMBOL}</span>
          </div>
        )}

        {/* Out of stock */}
        {product.out_of_stock && (
          <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-wide">
            {t(locale, 'menu.outOfStock')}
          </p>
        )}

        {/* Description */}
        {product.description && !product.out_of_stock && (
          <p className="text-muted text-[13px] mt-1 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Allergen icons */}
        {hasAllergens && (
          <div className="mt-2">
            <AllergenList allergens={product.allergens} locale={locale} compact />
          </div>
        )}
      </div>

      {/* Image or ordering add badge */}
      <div className="flex-shrink-0 relative">
        {hasImage ? (
          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-bg">
            <Image
              src={product.image_url!}
              alt={product.name}
              width={72}
              height={72}
              className="object-cover w-full h-full"
            />
          </div>
        ) : null}
        {orderingMode && !product.out_of_stock && (
          <div
            className={`flex items-center justify-center text-white text-xl font-bold rounded-full shadow-md ${
              hasImage
                ? 'absolute -bottom-1.5 -right-1.5 w-6 h-6 text-sm'
                : 'w-9 h-9'
            }`}
            style={{ backgroundColor: '#25D366' }}
          >
            +
          </div>
        )}
      </div>
    </article>
  )
}
