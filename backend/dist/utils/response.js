"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.notFoundResponse = notFoundResponse;
exports.unauthorizedResponse = unauthorizedResponse;
exports.forbiddenResponse = forbiddenResponse;
function successResponse(res, statusCode, data, message) {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}
function errorResponse(res, statusCode, message, errors) {
    res.status(statusCode).json({
        success: false,
        message,
        errors: errors || undefined,
    });
}
function notFoundResponse(res, resource) {
    errorResponse(res, 404, `${resource} not found`);
}
function unauthorizedResponse(res, message = 'Unauthorized') {
    errorResponse(res, 401, message);
}
function forbiddenResponse(res, message = 'Forbidden') {
    errorResponse(res, 403, message);
}
//# sourceMappingURL=response.js.map