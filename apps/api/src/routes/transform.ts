import { ditheringFloydSteinberg } from "@utils/dithering";
import { clamp, nearestColor, nearestPaletteColor } from "@utils/helpers";
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

        const response: BasicResponseData & { data: Metadata } = {
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

// RPC to cover actual image operations (currently just to test validation)
app.post('/', async (c) => {
    const response: BasicResponseData = {
        code: 200,
        message: "RPC call"
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
            kernel: "cubic"
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

app.post('/flip', async (c) => {
    const body = await c.req.parseBody()

    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()
        const sharpInstance = sharp(imageBuffer)

        const transformedImageBuffer = await sharpInstance
            .flip()
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

app.post('/flop', async (c) => {
    const body = await c.req.parseBody()

    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()
        const sharpInstance = sharp(imageBuffer)

        const transformedImageBuffer = await sharpInstance
            .flop()
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

app.post('/dither', async (c) => {
    const body = await c.req.parseBody()

    if (!(body.file instanceof Blob)) {
        const response: BasicResponseData = {
            code: 400,
            message: "incorrect input"
        }
        return c.json(response, response.code)
    }

    const imageBuffer = await body.file.arrayBuffer()

    if (body.palette == undefined || typeof body.palette != 'string') throw new Error('angle is not defined')

    const palette = JSON.parse(body.palette)

    const buffer = await sharp(imageBuffer)
        .ensureAlpha()
        .resize({ width: 600 })
        .raw()
        .toBuffer({ resolveWithObject: true })

    const { width, height, channels } = buffer.info

    const ditheredImageBuffer = await ditheringFloydSteinberg(buffer.info, buffer.data, { colorFunction: nearestPaletteColor(palette) })

    const transformedImageBuffer = await sharp(ditheredImageBuffer, { raw: { width, height, channels } })
        .png({ colors: 16, compressionLevel: 9, palette: true })
        .toBuffer()

    c.header('Content-Type', 'image/png')
    return c.body(transformedImageBuffer)
})

app.post('*', (c) => {
    const response: BasicResponseData = {
        code: 404,
        message: "no matching transform"
    }
    return c.json(response, response.code)
})

export default app