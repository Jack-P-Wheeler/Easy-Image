import { DitherFunction } from "./types";

export const ditheringFloydSteinberg: DitherFunction = async (info, dataBuffer, { colorFunction }) => {
    const width = info.width
    const channels = info.channels

    const data = new Uint16Array(dataBuffer)

    for (let i = 0; i < data.length; i += channels) {
        const { color, error } = colorFunction([data[i], data[i + 1], data[i + 2]])

        for (let j = 0; j < 3; j++) {
            data[i + j] = color[j]

            const thisError = error[j]

            if (data[i + channels + j] !== undefined) data[i + channels + j] += thisError * 7 / 16
            if (data[i + (width * channels) + channels + j] !== undefined) data[i + (width * channels) + channels + j] += thisError * 1 / 16
            if (data[i + (width * channels) - channels + j] !== undefined) data[i + (width * channels) - channels + j] += thisError * 3 / 16
            if (data[i + (width * channels) + j] !== undefined) data[i + (width * channels) + j] += thisError * 5 / 16
        }
    }

    return Buffer.from(data)
}

export const ditheringOrderedBayer: DitherFunction = async (info, dataBuffer, { colorFunction }) => {
    const width = info.width
    const height = info.height
    const channels = info.channels

    const data = new Uint16Array(dataBuffer)

    const bayerMatrix2 = [
        [-0.375, 0.125],
        [0.375, -0.125]
    ]

    const bayerMatrix4 = [
        [-0.46875, 0.03125, -0.34375, 0.15625],
        [0.28125, -0.21875, 0.40625, -0.09375],
        [-0.28125, 0.21875, -0.40625, 0.09375],
        [0.46875, -0.03125, 0.34375, -0.15625]
    ]

    for (let y = 0; y <= height; y++) {
        for (let x = 0; x <= width; x++) {
            const matrixValue = bayerMatrix4[y % bayerMatrix4.length][x % bayerMatrix4[0].length]
            const dataCursor = channels * (y * width + x)
            const { color } = colorFunction([data[dataCursor] + data[dataCursor] * matrixValue, data[dataCursor + 1] + data[dataCursor + 1] * matrixValue, data[dataCursor + 2] + data[dataCursor + 2] * matrixValue])

            for (let c = 0; c <= 2; c++) {
                data[dataCursor + c] = color[c]
            }
        }
    }

    return Buffer.from(data)
}