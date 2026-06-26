import { Hono } from 'jsr:@hono/hono'
import { cors } from 'jsr:@hono/hono/cors'
import { logger } from 'jsr:@hono/hono/logger'
import { authMiddleware } from './middleware/auth.ts'
import { healthRoutes } from './routes/health.ts'
import { brandRoutes } from './routes/brands.ts'
import { orderRoutes } from './routes/orders.ts'

const app = new Hono().basePath('/api')

// In-memory rate limiter — key: userId+path, window: 60s, max: 20 requests
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
app.use('/orders/POST', async (c, next) => {
  const user = c.get('user')
  if (!user) return next()
  const key = `${user.id}:POST:/orders`
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (entry && now < entry.resetAt) {
    if (entry.count >= 20) return c.json({ error: 'Rate limit exceeded. Try again in a minute.' }, 429)
    entry.count++
  } else {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 })
  }
  return next()
})

// Global middleware
app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:3000',       // opa-web dev
    'https://opa-web.vercel.app',  // opa-web prod (update when domain is confirmed)
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Public routes
app.route('/health', healthRoutes)

// Protected routes — require valid Supabase JWT
app.use('/brands/*', authMiddleware)
app.use('/orders/*', authMiddleware)

app.route('/brands', brandRoutes)
app.route('/orders', orderRoutes)

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Global error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

Deno.serve(app.fetch)
