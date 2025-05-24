import { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import { type OutputInfo } from "sharp";

type WithOptions<F extends (...args: any[]) => any, O> = (
    ...args: [...Parameters<F>, options: O]
) => ReturnType<F>;

export interface BasicResponseData {
    code: ContentfulStatusCode;
    message: string;
}

export type ImageOperations = (
    {
        operation: 'scale',
    } | {
        operation: 'rotate'
        angle?: number
    } | {
        operation: 'flip'
    } | {
        operation: 'flop'
    } | {
        operation: 'dither',
        palette?: Array<RGBTuple>
    }
)

export type RGBTuple = [number, number, number]

export type RawPixelFunction = (info: OutputInfo, data: Buffer<ArrayBufferLike>) => Promise<Buffer>

export type NearestColorModes = 'default' | 'palette'

export type ColorDistanceFunction = (color: RGBTuple) => { color: RGBTuple, error: RGBTuple }

type DitherOptions = {colorFunction: ColorDistanceFunction}

export type DitherFunction = WithOptions<RawPixelFunction, DitherOptions>