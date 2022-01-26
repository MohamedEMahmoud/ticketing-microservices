import { CustomError } from "./custom-error";
export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    serializeErrors() {
        return [{ status: this.statusCode, message: this.message, success: false }];
    }
}