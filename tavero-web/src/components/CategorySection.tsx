import { ProductCard } from '@/components/ProductCard'
import type { Category, Product } from '@/lib/types'

type Props = {
  category: Category
  products: Product[]
}

export function CategorySection({ category, products }: Props) {
  if (products.length === 0) return null

  return (
    <section id={`cat-${category.id}`} className="scroll-mt-16">
      <div className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md px-6 py-3 border-b border-border">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          {category.name}
        </h2>
      </div>
      <div className="px-6 bg-surface">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
