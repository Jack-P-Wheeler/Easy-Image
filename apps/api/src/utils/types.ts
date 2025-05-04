import { StatusCode } from "hono/utils/http-status";

export interface BasicResponseData {
    code: StatusCode;
    message: string;
}

export type ImageOperations = (
    {
        opperation: 'scale',
    } | {
        opperation: 'rotate'
        angle?: number
    } | {
        opperation: 'flip'
    } | {
        opperation: 'flop'
    }
)