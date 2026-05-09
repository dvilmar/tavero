export type CartItem = {
  productId: string
  productName: string
  variantId?: string
  variantName?: string
  price: number
  qty: number
}

export function cartKey(item: Pick<CartItem, 'productId' | 'variantId'>) {
  return item.variantId ? `${item.productId}-${item.variantId}` : item.productId
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
