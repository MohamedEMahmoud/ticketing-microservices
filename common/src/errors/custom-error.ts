export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract serializeErrors(): { status: number; message: string; field?: string; success: boolean; }[];
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}