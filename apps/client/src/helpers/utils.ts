import { RGBTuple } from "@types"

export const rgbToHex = (rgb: RGBTuple) => {
    const r = rgb[0].toString(16)
    const g = rgb[1].toString(16)
    const b = rgb[2].toString(16)

    const hex = (r.length == 1 ? '0' + r : r) + (g.length == 1 ? '0' + g : g) + (b.length == 1 ? '0' + b : b)

    return hex
}

export const textContrastCheck = (rgb: RGBTuple) => {
    return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 186
}