import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
    statusCode = 404;
    constructor() {
        super("Route Not Found");
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors() {
        return [{ status: this.statusCode, message: "Not Found", success: false }];
    }
}