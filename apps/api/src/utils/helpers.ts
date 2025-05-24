import { ColorDistanceFunction, RGBTuple } from "./types"

const stepRound = (num: number, step: number, max: number) => Math.floor(num * step / max) * max / step

const pixelDistance = (p1: RGBTuple, p2: RGBTuple): number => {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[2] - p1[2], 2))
}

export const nearestColor: ColorDistanceFunction = (color) => {
    const newColor: RGBTuple = [stepRound(color[0], 1, 255), stepRound(color[1], 1, 255), stepRound(color[2], 1, 255)]
    const errorAmount: RGBTuple = [color[0] - newColor[0], color[1] - newColor[1], color[2] - newColor[2]]

    return { color: newColor, error: errorAmount }
}

export const nearestPaletteColor = (palette: Array<RGBTuple>): ColorDistanceFunction => {
    const colorFunction: ColorDistanceFunction = (color)  => {
        let newColor: RGBTuple = palette[0]

    let leastDistance = pixelDistance(color, palette[0])

    for (let index = 1; index < palette.length; index++) {
        let distance = pixelDistance(color, palette[index])
        if (distance < leastDistance) {
            leastDistance = distance
            newColor = palette[index]
        }
    }

    const errorAmount: RGBTuple = [
        clamp(color[0] - newColor[0], 255 , 0),
        clamp(color[1] - newColor[1], 255 , 0),
        clamp(color[2] - newColor[2], 255 , 0)
    ]


    return { color: newColor, error: errorAmount }
    }

    return colorFunction
}

export const clamp = (num: number, max: number, min: number) => Math.max(min, Math.min(max, num))