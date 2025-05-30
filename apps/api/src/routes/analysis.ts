import { pixelDistance } from "@utils/helpers";
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
    const SANE_COLOR_LIMIT = 100

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

    let pointCache: Array<[RGBTuple, number]> = []

    const info = buffer.info
    const data = new Uint8Array(buffer.data)

    const { height, width, channels } = info

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dataCursor = channels * (y * width + x)
            const color: RGBTuple = [data[dataCursor], data[dataCursor + 1], data[dataCursor + 2]]

            const occurenceTupleIndex = pointCache.findIndex(([tupleColor]) => {
                return tupleColor[0] === color[0] && tupleColor[1] === color[1] && tupleColor[2] === color[2]
            })

            if (occurenceTupleIndex === -1) {
                pointCache.push([color, 1])
            } else {
                pointCache[occurenceTupleIndex][1] = pointCache[occurenceTupleIndex][1] + 1
            }
        }
    }

    pointCache = pointCache.sort((a, b) => b[1] - a[1])

    const centroids: Array<{
        position: RGBTuple,
        positionAcc: RGBTuple,
        pointCount: number
    }> = []

    for (let i = 0; i < sampleSize; i++) {
        const randomColorIndex = Math.floor(Math.random() * pointCache.length)
        centroids.push({
            position: [pointCache[randomColorIndex][0][0], pointCache[randomColorIndex][0][1], pointCache[randomColorIndex][0][2]],
            positionAcc: [0, 0, 0],
            pointCount: 0
        })
    }

    for (let j = 0; j < 10; j++) {
        for (const [point, count] of pointCache) {
            let minDistance = pixelDistance(point, centroids[0].position)
            let centroidIndex = 0

            for (let i = 1; i < centroids.length; i++) {
                const centroid = centroids[i];
                const testDistance = pixelDistance(point, centroid.position)

                if (testDistance < minDistance) {
                    minDistance = testDistance
                    centroidIndex = i
                }
            }

            const [r, g, b] = centroids[centroidIndex].positionAcc
            centroids[centroidIndex].positionAcc = [r + point[0] * count, g + point[1] * count, b + point[2] * count]
            centroids[centroidIndex].pointCount += count
        }

        for (let i = 0; i < centroids.length; i++) {
            const [r, g, b] = centroids[i].positionAcc
            const count = centroids[i].pointCount
            if (count > 0) centroids[i].position = [Math.round(r / count), Math.round(g / count), Math.round(b / count)]


            centroids[i].pointCount = 0
            centroids[i].positionAcc = [0, 0, 0]
        }

        
    }

    const allColors: Array<RGBTuple> = []

    for (const centroid of centroids) {
        allColors.push(centroid.position)
    }

    const response: BasicResponseData & { data: Array<RGBTuple> } = {
        code: 200,
        message: "palette analysis",
        data: allColors,
    }
    return c.json(response, response.code)
})

export default app