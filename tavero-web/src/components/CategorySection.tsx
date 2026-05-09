'use client'

import Image from 'next/image'
import { ProductCard } from '@/components/ProductCard'
import type { Category, Product } from '@/lib/types'
import type { Locale } from '@/lib/i18n'

type Props = {
  category: Category
  products: Product[]
  locale: Locale
  onProductClick: (product: Product) => void
  orderingMode?: boolean
}

export function CategorySection({ category, products, locale, onProductClick, orderingMode }: Props) {
  if (products.length === 0) return null

  return (
    <section id={`cat-${category.id}`} className="scroll-mt-12">
      {category.image_url ? (
        <div className="relative w-full h-28 overflow-hidden">
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-2.5">
            <h2 className="text-lg font-semibold text-white leading-tight drop-shadow">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-[12px] text-white/80 mt-0.5 drop-shadow">{category.description}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-md px-5 pt-4 pb-2">
          <h2 className="text-lg font-semibold text-primary leading-tight">
            {category.name}
          </h2>
          {category.description && (
            <p className="text-[13px] text-muted mt-0.5 leading-snug">{category.description}</p>
          )}
          <div className="mt-2 h-[2px] bg-accent/20" />
        </div>
      )}

      <div className="bg-surface">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            onClick={() => onProductClick(product)}
            orderingMode={orderingMode}
          />
        ))}
      </div>
    </section>
  )
}
