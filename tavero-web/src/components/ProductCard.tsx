import Image from 'next/image'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const hasImage = !!product.image_url

  return (
    <article className="group flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-primary text-[15px] leading-snug">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-muted text-[13px] mt-1 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-2.5 inline-flex items-baseline gap-1">
          <span className="text-base font-bold text-accent tabular-nums">
            {Number(product.price).toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-accent/70">€</span>
        </div>
      </div>

      {hasImage && (
        <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-bg ring-1 ring-border">
          <Image
            src={product.image_url!}
            alt={product.name}
            width={96}
            height={96}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
    </article>
  )
}
