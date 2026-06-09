// Types aligned to the real Supabase schema (tables in Spanish)

// ─── Core entities ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  instagram_handle: string | null
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
  description: string | null
  logo_url: string | null
  owner_id: string | null
  instagram_handle: string | null
  website: string | null
  location: string | null
  tags: string[]
  created_at: string
}

export interface Garment {
  id: string
  brand_id: string
  name: string
  description: string | null
  price: number
  category: string | null
  style: string | null
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
  saves_count: number
  created_at: string
  creator?: Profile
  garments?: OutfitItemWithData[]
}

// outfit_items — links outfits to garments by slot (no position coordinates)
export interface OutfitItem {
  id: string
  outfit_id: string
  garment_id: string
  slot: string | null  // torso | piernas | calzado | extras
}

export interface OutfitItemWithData extends OutfitItem {
  garment: Garment
}

// prendas_armario — user's personal wardrobe (simplified schema)
export interface WardrobeItem {
  id: string
  user_id: string
  garment_id: string
  added_at: string
  garment?: Garment
}

// ─── Social & commerce ───────────────────────────────────────────────────────

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface SavedOutfit {
  user_id: string
  outfit_id: string
  created_at: string
  outfit?: Outfit
}

export interface CartItem {
  id: string
  user_id: string
  garment_id: string
  quantity: number
  created_at: string
  garment?: Garment
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: string
  created_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  garment_id: string
  quantity: number
  price: number
  garment?: Garment
}

export interface Review {
  id: string
  user_id: string
  garment_id: string
  rating: number
  comment: string | null
  created_at: string
}
