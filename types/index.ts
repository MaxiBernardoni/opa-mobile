export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  style_tags: string[]
  followers_count: number
  following_count: number
  outfits_count: number
  created_at: string
}

export interface Brand {
  id: string
  name: string
  logo_url: string | null
  verified: boolean
  created_at: string
}

export interface Garment {
  id: string
  brand_id: string
  name: string
  price: number
  slot: 'torso' | 'piernas' | 'calzado' | 'extras'
  image_url: string | null
  colors: string[]
  sizes: string[]
  style_tags: string[]
  created_at: string
  brand?: Brand
}

export interface Outfit {
  id: string
  creator_id: string
  brand_id: string
  title: string
  description: string | null
  image_url: string
  total_price: number
  discount_percent: number
  occasion: string[]
  style_tags: string[]
  likes_count: number
  saves_count: number
  published_at: string
  brand?: Brand
  creator?: Profile
  garments?: OutfitGarmentWithData[]
}

export interface OutfitGarment {
  outfit_id: string
  garment_id: string
  position_x: number
  position_y: number
}

export interface OutfitGarmentWithData extends OutfitGarment {
  garment: Garment
}
