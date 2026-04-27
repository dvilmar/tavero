export type Restaurant = {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
}

export type Category = {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  sort_order: number
}

export type Product = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  sort_order: number
  availability: number[] // day_of_week values; empty = every day
}
