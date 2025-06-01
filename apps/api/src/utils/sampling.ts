import { pixelDistance } from "./helpers";
import { RGBTuple, SampleFunction } from "./types";

export const kMeansSampling: SampleFunction = async (info, data, {sampleSize}) => {
    let pointCache: Array<[RGBTuple, number]> = []

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

    for (let j = 0; j < 6; j++) {
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

    return allColors
}