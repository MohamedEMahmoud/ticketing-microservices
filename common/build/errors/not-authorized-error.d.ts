import { CustomError } from './custom-error';
export declare class NotAuthorizedError extends CustomError {
    statusCode: number;
    constructor();
    serializeErrors(): {
        status: number;
        message: string;
        success: boolean;
    }[];
}
