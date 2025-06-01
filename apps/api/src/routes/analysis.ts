import { kMeansSampling } from "@utils/sampling";
import { BasicResponseData, RGBTuple } from "@utils/types";
import { Hono } from "hono";
import sharp, { Metadata } from "sharp";

const app = new Hono

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

app.post('/sample-palette', async (c) => {
    const body = await c.req.parseBody()

    if (!(body.file instanceof Blob)) {
        const response: BasicResponseData = {
            code: 400,
            message: "incorrect input",
        }
        return c.json(response, response.code)
    }

    if (body.sampleSize == undefined || typeof body.sampleSize != 'string') throw new Error('angle is not defined')

    const imageBuffer = await body.file.arrayBuffer()

    const buffer = await sharp(imageBuffer)
        .ensureAlpha()
        .resize({ width: 200 })
        .raw()
        .toBuffer({ resolveWithObject: true })

    const sampleSize = Number(body.sampleSize)

    const allColors = await kMeansSampling(buffer.info, buffer.data, {sampleSize})

    const response: BasicResponseData & { data: Array<RGBTuple> } = {
        code: 200,
        message: "palette analysis",
        data: allColors,
    }
    return c.json(response, response.code)
})

export default app