"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, response_1.unauthorizedResponse)(res, 'No token provided');
        return;
    }
    const token = authHeader.substring(7);
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        (0, response_1.unauthorizedResponse)(res, 'Invalid or expired token');
        return;
    }
    req.user = decoded;
    next();
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.unauthorizedResponse)(res, 'Not authenticated');
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_1.errorResponse)(res, 403, 'Insufficient permissions');
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map