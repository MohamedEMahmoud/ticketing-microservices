import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";
export declare class RequestValidationError extends CustomError {
    errors: ValidationError[];
    statusCode: number;
    constructor(errors: ValidationError[]);
    serializeErrors(): {
        status: number;
        message: any;
        field: string;
        success: boolean;
    }[];
}
