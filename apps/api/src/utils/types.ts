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
    } | {
        operation: 'ordered',
        palette?: Array<RGBTuple>
    }  | {
        operation: 'sample-palette',
        sampleSize?: number
    }
)

export type ImageAnalysis = (
    {
        operation: 'info'
    } | {
        operation: 'sample-palette'
    }
)

export type RGBTuple = [number, number, number]

export type RawPixelFunction = (info: OutputInfo, data: Buffer<ArrayBufferLike>) => Promise<Buffer>

export type RawPixelAnalysisFunction<T> = (info: OutputInfo, data: Buffer<ArrayBufferLike>) => Promise<T>

export type NearestColorModes = 'default' | 'palette'

export type ColorDistanceFunction = (color: RGBTuple) => { color: RGBTuple, error: RGBTuple }

type DitherOptions = {colorFunction: ColorDistanceFunction}

export type DitherFunction = WithOptions<RawPixelFunction, DitherOptions>

type SampleOptions = {sampleSize: number}

export type SampleFunction = WithOptions<RawPixelAnalysisFunction<Array<RGBTuple>>, SampleOptions>