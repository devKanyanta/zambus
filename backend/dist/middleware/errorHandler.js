"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const response_1 = require("../utils/response");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, _next) {
    console.error('Error:', err);
    if (err instanceof AppError) {
        (0, response_1.errorResponse)(res, err.statusCode, err.message);
        return;
    }
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        (0, response_1.errorResponse)(res, 400, 'Invalid JSON');
        return;
    }
    (0, response_1.errorResponse)(res, 500, 'Internal server error');
}
//# sourceMappingURL=errorHandler.js.map