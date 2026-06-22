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

  // Whitelist updatable fields
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

// GET /api/brands/me/metrics — placeholder for brand analytics
brandRoutes.get('/me/metrics', async (c) => {
  // TODO: aggregate likes, saves, profile visits, product clicks, conversions
  return c.json({ message: 'Metrics not yet implemented' }, 501)
})
