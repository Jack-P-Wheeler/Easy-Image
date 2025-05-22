type NearestColorModes = 'default'

const stepRound = (num: number, step: number, max: number) => Math.floor(num * step / max) * max / step

export const nearestColor = (color: [number, number, number], mode: NearestColorModes = 'default'): { color: [number, number, number], error: [number, number, number] } => {
    switch (mode) {
        case 'default':
            const newColor: [number, number, number] = [stepRound(color[0], 1, 255), stepRound(color[1], 1, 255), stepRound(color[2], 1, 255)]
            return {color: newColor, error: [color[0] - newColor[0], color[1] - newColor[1], color[2] - newColor[2]]}
    }
}

export const clamp = (num: number, max: number, min: number) => Math.max(min, Math.min(max, num))