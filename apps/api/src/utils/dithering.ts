import { DitherFunction } from "./types";

export const ditheringFloydSteinberg: DitherFunction = async (info, dataBuffer, {colorFunction}) => {
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