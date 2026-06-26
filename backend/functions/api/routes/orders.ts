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

// POST /api/orders — checkout: validate stock, calculate total, create order, clear cart
orderRoutes.post('/', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')

  // 1. Read user's cart
  const { data: cartItems, error: cartError } = await supabase
    .from('productos_carrito')
    .select('*, garment:prendas(id, price, stock_por_talle, name)')
    .eq('user_id', user.id)

  if (cartError) return c.json({ error: cartError.message }, 400)
  if (!cartItems || cartItems.length === 0) return c.json({ error: 'Cart is empty' }, 422)

  // 2. Validate stock for each item
  for (const item of cartItems) {
    const garment = item.garment
    if (!garment) return c.json({ error: `Garment ${item.garment_id} not found` }, 422)

    const stock = garment.stock_por_talle as Record<string, number> | null
    if (item.size && stock) {
      const available = stock[item.size] ?? 0
      if (available < item.quantity) {
        return c.json({
          error: `Insufficient stock for "${garment.name}" in size ${item.size}. Available: ${available}`,
        }, 422)
      }
    }
  }

  // 3. Calculate total
  const total = cartItems.reduce((sum: number, item: any) => {
    return sum + (item.garment?.price ?? 0) * item.quantity
  }, 0)

  // 4. Create order row
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, total, status: 'pending' })
    .select()
    .single()

  if (orderError) return c.json({ error: orderError.message }, 400)

  // 5. Insert productos_orden rows
  const orderItems = cartItems.map((item: any) => ({
    order_id: order.id,
    garment_id: item.garment_id,
    quantity: item.quantity,
    size: item.size ?? null,
    unit_price: item.garment?.price ?? 0,
  }))

  const { error: itemsError } = await supabase.from('productos_orden').insert(orderItems)
  if (itemsError) return c.json({ error: itemsError.message }, 400)

  // 6. Decrement stock_por_talle for sized items
  for (const item of cartItems) {
    const garment = item.garment
    const stock = garment?.stock_por_talle as Record<string, number> | null
    if (item.size && stock && stock[item.size] !== undefined) {
      const updated = { ...stock, [item.size]: stock[item.size] - item.quantity }
      await supabase
        .from('prendas')
        .update({ stock_por_talle: updated })
        .eq('id', item.garment_id)
    }
  }

  // 7. Clear cart
  await supabase.from('productos_carrito').delete().eq('user_id', user.id)

  return c.json({ ...order, items: orderItems }, 201)
})

// PATCH /api/orders/:id/status — brand owner updates order status
orderRoutes.patch('/:id/status', async (c) => {
  const user = c.get('user')
  const supabase = c.get('supabase')
  const orderId = c.req.param('id')
  const body = await c.req.json()
  const { status } = body

  const validStatuses = ['pending', 'shipped', 'delivered']
  if (!status || !validStatuses.includes(status)) {
    return c.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, 422)
  }

  // Verify the caller owns a brand that has a garment in this order
  const { data: orderItems } = await supabase
    .from('productos_orden')
    .select('garment_id')
    .eq('order_id', orderId)

  if (!orderItems || orderItems.length === 0) {
    return c.json({ error: 'Order not found or has no items' }, 404)
  }

  const garmentIds = orderItems.map((oi: { garment_id: string }) => oi.garment_id)

  const { data: brand } = await supabase
    .from('marcas')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!brand) return c.json({ error: 'No brand found for this user' }, 403)

  const { data: ownedGarments } = await supabase
    .from('prendas')
    .select('id')
    .eq('brand_id', brand.id)
    .in('id', garmentIds)

  if (!ownedGarments || ownedGarments.length === 0) {
    return c.json({ error: 'You do not own any garments in this order' }, 403)
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  if (!data) return c.json({ error: 'Order not found' }, 404)

  return c.json(data)
})

