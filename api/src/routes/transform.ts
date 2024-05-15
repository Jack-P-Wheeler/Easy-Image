import { BasicResponseData } from "@utils/types";
import { Hono } from "hono";
import sharp from "sharp";

const app = new Hono

app.get('/', (c) => {
    const response: BasicResponseData = {
        code: 200,
        message: "image transform index"
    }
    return c.json(response, response.code)
})

app.post('/original', async (c) => {
    const body = await c.req.parseBody()
    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()

        c.header('Content-Type', 'image/png')
        return c.body(imageBuffer)
    }

    const response: BasicResponseData = {
        code: 400,
        message: "incorrect input"
    }
    return c.json(response, response.code)
})

app.post('/resize', async (c) => {
    const body = await c.req.parseBody()
    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()
        const sharpInstance = sharp(imageBuffer)
        const width = (await sharpInstance.metadata()).width

        const transformedImageBuffer = await sharpInstance
        .resize(typeof width == 'number' ? Math.round(width / 4) : null)
        .toBuffer()

        c.header('Content-Type', 'image/png')
        return c.body(transformedImageBuffer)
    }

    const response: BasicResponseData = {
        code: 400,
        message: "incorrect input"
    }
    return c.json(response, response.code)
})

app.get('*', (c) => {
    const response: BasicResponseData = {
        code: 404,
        message: "no matching transform"
    }
    return c.json(response, response.code)
})

export default app