import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { bodyLimit } from 'hono/body-limit'

import { BasicResponseData } from '@utils/types'
import transform from "@routes/transform"
import { cors } from 'hono/cors'
import path from 'node:path'
import fs from 'node:fs/promises'
import { getMimeType } from 'hono/utils/mime'



const app = new Hono()

app.use(logger())
app.use('/api/*', cors())

app.onError((err, c) => {
  if (err instanceof Error) {
    const response: BasicResponseData = {
      code: 500,
      message: err.message
    }
    return c.json(response, response.code)
  }
  const response: BasicResponseData = {
    code: 500,
    message: "server error"
  }
  return c.json(response, response.code)
})

app.get('/api', (c) => {
  const response: BasicResponseData = {
    code: 200,
    message: "api is working"
  }
  return c.json(response, response.code)
})

// External routes here
app.use('/api/*', bodyLimit({
  maxSize: 1024 * 1024 * 70,
  onError(c) {
    const response: BasicResponseData = {
      code: 413,
      message: "image is too large"
    }
    
    return c.json(response, response.code)
  },
}))

app.route("/api/transform", transform)

app.use('/*', async (c, next) => {
    const absPath = path.join(import.meta.dirname, '/frontend', c.req.path == '/' ? 'index.html' : c.req.path)
    try {
        const handle = await fs.open(absPath)
        const content = await handle.readFile()
        await handle.close()

        const mimeGuess = getMimeType(absPath)
        console.log(mimeGuess)
        c.header("Content-Type", mimeGuess);
        return c.body(content)
    } catch (error) {
        console.log(error)
    }
    return await next()
})

app.all('*', (c) => {
  const response: BasicResponseData = {
    code: 404,
    message: "nothing here"
  }
  return c.json(response, response.code)
})

const port = Number(process.env.API_PORT) || 4000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
