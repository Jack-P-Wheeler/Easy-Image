import { clamp, nearestColor } from "@utils/helpers";
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

    if (body.file instanceof Blob) {
        const imageBuffer = await body.file.arrayBuffer()

        let width = 0
        let height = 0
        let channels: 1 | 2 | 3 | 4 = 4

        const buffer = await sharp(imageBuffer)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(async ({ info, data: dataBuffer }) => {
                width = info.width
                height = info.height
                channels = info.channels

                const data = [...dataBuffer]

                for (let i = 0; i < data.length; i += channels) {
                    const {color, error} = nearestColor([data[i], data[i + 1], data[i + 2]])

                    for (let j = 0; j < 3; j++) {
                        data[i + j] = color[j]

                        const thisError = clamp(error[j], 255, -255)
                        
                        if (data[i + channels + j] !== undefined) data[i + channels + j] += thisError * 7/16
                        if (data[i + (width * channels) + channels + j] !== undefined) data[i + (width * channels) + channels + j] += thisError * 1/16
                        if (data[i + (width * channels) - channels + j] !== undefined) data[i + (width * channels) - channels + j] += thisError * 3/16
                        if (data[i + (width * channels) + j] !== undefined) data[i + (width * channels) + j] += thisError * 5/16
                    }
                }

                return Buffer.from(data)
            })

        const transformedImageBuffer = await sharp(buffer, {raw: {width, height, channels}})
            .toFormat('png')
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

app.post('*', (c) => {
    const response: BasicResponseData = {
        code: 404,
        message: "no matching transform"
    }
    return c.json(response, response.code)
})

export default app