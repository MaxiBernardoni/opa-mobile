import { Hono } from 'jsr:@hono/hono'
import { cors } from 'jsr:@hono/hono/cors'
import { logger } from 'jsr:@hono/hono/logger'
import { authMiddleware } from './middleware/auth.ts'
import { healthRoutes } from './routes/health.ts'
import { brandRoutes } from './routes/brands.ts'
import { orderRoutes } from './routes/orders.ts'

const app = new Hono().basePath('/api')

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
