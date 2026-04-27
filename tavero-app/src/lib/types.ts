export type Restaurant = {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type Product = {
  id: string
  category_id: string
  restaurant_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProductAvailability = {
  id: string
  product_id: string
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
}
