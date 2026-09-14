"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            const err = error;
            const errors = (err?.issues || []).map((issue) => ({
                path: issue.path || [],
                message: issue.message || 'Validation error',
            }));
            res.status(400).json({ success: false, message: 'Validation failed', errors });
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            const err = error;
            const errors = (err?.issues || []).map((issue) => ({
                path: issue.path || [],
                message: issue.message || 'Validation error',
            }));
            res.status(400).json({ success: false, message: 'Validation failed', errors });
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            const err = error;
            const errors = (err?.issues || []).map((issue) => ({
                path: issue.path || [],
                message: issue.message || 'Validation error',
            }));
            res.status(400).json({ success: false, message: 'Validation failed', errors });
        }
    };
}
//# sourceMappingURL=validation.js.map