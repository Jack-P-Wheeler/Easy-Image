import { RGBTuple } from "./types"

type NearestColorModes = 'default'

const stepRound = (num: number, step: number, max: number) => Math.floor(num * step / max) * max / step

export const nearestColor = (color: RGBTuple, mode: NearestColorModes = 'default'): { color: RGBTuple, error: RGBTuple } => {
    switch (mode) {
        case 'default':
            const newColor: RGBTuple = [stepRound(color[0], 1, 255), stepRound(color[1], 1, 255), stepRound(color[2], 1, 255)]
            return {color: newColor, error: [color[0] - newColor[0], color[1] - newColor[1], color[2] - newColor[2]]}
    }
}

export const clamp = (num: number, max: number, min: number) => Math.max(min, Math.min(max, num))

export const pixelDistance = (p1: RGBTuple, p2: RGBTuple) => {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[2] - p1[2], 2))
}