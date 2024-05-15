import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { bodyLimit } from 'hono/body-limit'

import { BasicResponseData } from '@utils/types'
import transform from "@routes/transform"

const app = new Hono().basePath('/api')

app.use(logger())

app.get('/', (c) => {
  const response: BasicResponseData = {
    code: 200,
    message: "api is working"
  }
  return c.json(response, response.code)
})

// External routes here
app.use('/transform/*', bodyLimit({
  maxSize: 1024 * 1024 * 10,
  onError(c) {
    const response: BasicResponseData = {
      code: 413,
      message: "image is too large"
    }
    return c.json(response, response.code)
  },
}))
app.route("/transform", transform)

app.all('*', (c) => {
  const response: BasicResponseData = {
    code: 404,
    message: "nothing here"
  }
  return c.json(response, response.code)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
