// Matches actual Supabase schema (tables in Spanish)
export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  tags: string[]
  followers_count: number
  following_count: number
  outfits_count: number
  is_brand: boolean
  created_at: string
}

export interface Brand {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  tags: string[]
  created_at: string
}

export interface Garment {
  id: string
  brand_id: string
  name: string
  price: number
  category: string | null
  image_url: string | null
  color: string | null
  available_sizes: string[]
  created_at: string
  brand?: Brand
}

export interface Outfit {
  id: string
  creator_id: string | null
  title: string | null
  description: string | null
  cover_image_url: string | null
  occasion: string | null
  style: string | null
  likes_count: number
  created_at: string
  creator?: Profile
  garments?: OutfitItemWithData[]
}

export interface OutfitItem {
  id: string
  outfit_id: string
  garment_id: string
  slot: string | null
}

export interface OutfitItemWithData extends OutfitItem {
  garment: Garment
}
