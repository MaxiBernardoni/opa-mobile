import { Hono } from 'jsr:@hono/hono'

// Order / purchase flow routes
// All routes require auth (applied in index.ts)
export const orderRoutes = new Hono()

// GET /api/orders — list orders for the authenticated user
orderRoutes.get('/', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  const { data, error } = await supabase
    .from('orders')
    .select('*, productos_orden(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)

  return c.json(data)
})

// POST /api/orders — create a new order from the user's cart
// TODO: implement full checkout flow (validate stock, calculate total, decrement stock_por_talle)
orderRoutes.post('/', async (c) => {
  return c.json({ message: 'Checkout not yet implemented' }, 501)
})

// PATCH /api/orders/:id/status — update order status (brand owner only)
orderRoutes.patch('/:id/status', async (c) => {
  return c.json({ message: 'Order status update not yet implemented' }, 501)
})
