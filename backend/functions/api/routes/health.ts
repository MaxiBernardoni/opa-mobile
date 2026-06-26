import { Hono } from 'jsr:@hono/hono'

export const healthRoutes = new Hono()

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'opa-api',
    timestamp: new Date().toISOString(),
  })
})
