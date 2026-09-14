"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
exports.authController = {
    async register(req, res) {
        try {
            const { fullName, email, phoneNumber, password, role } = req.body;
            const result = await (0, auth_service_1.registerUser)({
                fullName,
                email,
                phoneNumber,
                password,
                role: role || 'PASSENGER',
            });
            (0, response_1.successResponse)(res, 201, {
                user: {
                    userId: result.user.userId,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    phoneNumber: result.user.phoneNumber,
                    role: result.user.role,
                    isActive: result.user.isActive,
                    createdAt: result.user.createdAt,
                },
                token: result.token,
            }, 'Registration successful');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await (0, auth_service_1.loginUser)({ email, password });
            (0, response_1.successResponse)(res, 200, {
                user: {
                    userId: result.user.userId,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    phoneNumber: result.user.phoneNumber,
                    role: result.user.role,
                    isActive: result.user.isActive,
                    createdAt: result.user.createdAt,
                },
                token: result.token,
            }, 'Login successful');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 401, error.message);
        }
    },
    async me(req, res) {
        try {
            if (!req.user) {
                (0, response_1.errorResponse)(res, 401, 'Not authenticated');
                return;
            }
            const user = await (0, auth_service_1.getUserById)(req.user.userId);
            if (!user) {
                (0, response_1.errorResponse)(res, 404, 'User not found');
                return;
            }
            (0, response_1.successResponse)(res, 200, {
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            });
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                (0, response_1.errorResponse)(res, 401, 'Not authenticated');
                return;
            }
            const { fullName, phoneNumber } = req.body;
            const user = await (0, auth_service_1.updateUserProfile)(req.user.userId, { fullName, phoneNumber });
            (0, response_1.successResponse)(res, 200, {
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            }, 'Profile updated successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map