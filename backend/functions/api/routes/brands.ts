import { Hono } from 'jsr:@hono/hono'

// Brand management routes — for opa-web brand panel
// All routes require auth (applied in index.ts)
export const brandRoutes = new Hono()

// GET /api/brands/me — get the brand owned by the authenticated user
brandRoutes.get('/me', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  const { data, error } = await supabase
    .from('marcas')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (error) return c.json({ error: error.message }, 400)
  if (!data) return c.json({ error: 'No brand found for this user' }, 404)

  return c.json(data)
})

// PATCH /api/brands/me — update brand info
brandRoutes.patch('/me', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const body = await c.req.json()

  const allowed = ['name', 'description', 'instagram_handle', 'website', 'location', 'tags']
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const { data, error } = await supabase
    .from('marcas')
    .update(updates)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)

  return c.json(data)
})

// GET /api/brands/me/metrics — brand analytics (likes + saves; no visit/click tables yet)
brandRoutes.get('/me/metrics', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  // Get the brand owned by this user
  const { data: brand, error: brandError } = await supabase
    .from('marcas')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (brandError || !brand) return c.json({ error: 'No brand found for this user' }, 404)

  // Get all outfit_ids that contain at least one garment from this brand
  const { data: garments } = await supabase
    .from('prendas')
    .select('id')
    .eq('brand_id', brand.id)

  const garmentIds = (garments ?? []).map((g: { id: string }) => g.id)

  if (garmentIds.length === 0) {
    return c.json({ likes: 0, saves: 0, note: 'No garments found for this brand. Visit/click tracking not yet implemented.' })
  }

  // Outfits containing at least one brand garment
  const { data: outfitItems } = await supabase
    .from('outfit_items')
    .select('outfit_id')
    .in('garment_id', garmentIds)

  const outfitIds = [...new Set((outfitItems ?? []).map((oi: { outfit_id: string }) => oi.outfit_id))]

  if (outfitIds.length === 0) {
    return c.json({ likes: 0, saves: 0, note: 'Visit/click tracking not yet implemented.' })
  }

  // Count likes and saves across those outfits
  const [likesRes, savesRes] = await Promise.all([
    supabase.from('outfit_likes').select('id', { count: 'exact', head: true }).in('outfit_id', outfitIds),
    supabase.from('outfits_guardados').select('id', { count: 'exact', head: true }).in('outfit_id', outfitIds),
  ])

  return c.json({
    likes: likesRes.count ?? 0,
    saves: savesRes.count ?? 0,
    outfits_with_brand_garments: outfitIds.length,
    note: 'Visit/click/conversion tracking not yet implemented — no DB table for it yet.',
  })
})

// GET /api/brands/me/prendas — list garments for the authenticated brand
brandRoutes.get('/me/prendas', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  const { data: brand, error: brandError } = await supabase
    .from('marcas')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (brandError || !brand) return c.json({ error: 'No brand found for this user' }, 404)

  const { data, error } = await supabase
    .from('prendas')
    .select('*')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)

  return c.json(data)
})

// POST /api/brands/me/prendas — create a garment for the authenticated brand
brandRoutes.post('/me/prendas', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const body = await c.req.json()

  const { data: brand, error: brandError } = await supabase
    .from('marcas')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (brandError || !brand) return c.json({ error: 'No brand found for this user' }, 404)

  const { sale_mode = 'direct', external_url } = body
  if (sale_mode === 'redirect' && !external_url) {
    return c.json({ error: 'external_url is required when sale_mode is redirect' }, 422)
  }

  const allowed = ['name', 'description', 'price', 'image_url', 'category', 'color', 'style',
    'available_sizes', 'stock_por_talle', 'size_guide_id', 'sale_mode', 'external_url']
  const fields = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { data, error } = await supabase
    .from('prendas')
    .insert({ ...fields, brand_id: brand.id })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)

  return c.json(data, 201)
})

// PATCH /api/brands/me/prendas/:id — update a garment (brand owner only)
brandRoutes.patch('/me/prendas/:id', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const garmentId = c.req.param('id')
  const body = await c.req.json()

  // Verify ownership via brand
  const { data: brand, error: brandError } = await supabase
    .from('marcas')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (brandError || !brand) return c.json({ error: 'No brand found for this user' }, 404)

  const { sale_mode, external_url } = body
  if (sale_mode === 'redirect' && external_url === null) {
    return c.json({ error: 'external_url is required when sale_mode is redirect' }, 422)
  }

  const allowed = ['name', 'description', 'price', 'image_url', 'category', 'color', 'style',
    'available_sizes', 'stock_por_talle', 'size_guide_id', 'sale_mode', 'external_url']
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { data, error } = await supabase
    .from('prendas')
    .update(updates)
    .eq('id', garmentId)
    .eq('brand_id', brand.id)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  if (!data) return c.json({ error: 'Garment not found or not owned by this brand' }, 404)

  return c.json(data)
})

