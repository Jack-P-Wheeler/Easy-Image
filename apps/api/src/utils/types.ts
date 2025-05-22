import { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

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
        operation: 'dither'
    }
)