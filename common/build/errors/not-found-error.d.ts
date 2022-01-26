import { CustomError } from "./custom-error";
export declare class NotFoundError extends CustomError {
    statusCode: number;
    constructor();
    serializeErrors(): {
        status: number;
        message: string;
        success: boolean;
    }[];
}
