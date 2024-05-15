import { StatusCode } from "hono/utils/http-status";

export interface BasicResponseData {
    code: StatusCode;
    message: string;
}