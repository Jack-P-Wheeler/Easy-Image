import { BasicResponseData } from "@utils/types";
import { Hono } from "hono";
import sharp, { Metadata, ResizeOptions } from "sharp";

const app = new Hono

app.get('/', (c) => {
    const response: BasicResponseData = {
        code: 200,
        message: "image transform index"
    }
    return c.json(response, response.code)
})

app.post('/info', async (c) => {

    const body = await c.req.parseBody()
    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()
        const sharpInstance = sharp(imageBuffer)
        const metadata = await sharpInstance.metadata()

        const response: BasicResponseData & {data: Metadata} = {
            code: 200,
            message: "image metadata",
            data: metadata
        }
        
        return c.json(response, response.code)
    }

    const response: BasicResponseData = {
        code: 400,
        message: "incorrect input"
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

// Handles scaling an image based off an image "file" and a scale value "scale" between 1 and 0 exclusive.
app.post('/scale', async (c) => {
    const body = await c.req.parseBody()

    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()
        const sharpInstance = sharp(imageBuffer)
        const width = (await sharpInstance.metadata()).width

        if (width == undefined || typeof width !== 'number') throw new Error('width is not defined')
        if (body.scale == undefined || typeof body.scale != 'string') throw new Error('scale factor is not defined')

        const newWidth = Math.round(Number(body.scale) * width)

        if (newWidth >= width || newWidth <= 0) throw new Error('unusable new width')

        const resizeOptions: ResizeOptions = {
            width: newWidth,
        }

        const transformedImageBuffer = await sharpInstance
            .resize(resizeOptions)
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

// Handles rotating an image based off an image "file" and degrees.
app.post('/rotate', async (c) => {
    const body = await c.req.parseBody()

    if (body.angle == undefined || typeof body.angle != 'string') throw new Error('angle is not defined')
    if (isNaN(Number(body.angle))) throw new Error('angle is not a number')

    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()
        const sharpInstance = sharp(imageBuffer)

        const transformedImageBuffer = await sharpInstance
            .rotate(Number(body.angle))
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