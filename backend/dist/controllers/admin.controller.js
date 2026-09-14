"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const models_1 = require("../models");
const database_1 = require("../config/database");
const config_1 = require("../config");
const response_1 = require("../utils/response");
const sequelize_1 = require("sequelize");
exports.adminController = {
    async getPendingCompanies(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can view pending companies');
                return;
            }
            const companies = await models_1.BusCompany.findAll({
                where: { isApproved: false },
                include: [
                    { model: models_1.BusCompany.sequelize?.models?.User, as: 'operator', attributes: ['userId', 'fullName', 'email', 'phoneNumber'] },
                ],
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.successResponse)(res, 200, companies);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async approveCompany(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can approve companies');
                return;
            }
            const { id } = req.params;
            const company = await models_1.BusCompany.findByPk(id);
            if (!company) {
                (0, response_1.notFoundResponse)(res, 'Company');
                return;
            }
            company.isApproved = true;
            await company.save();
            (0, response_1.successResponse)(res, 200, company, 'Company approved successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async rejectCompany(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can reject companies');
                return;
            }
            const { id } = req.params;
            const company = await models_1.BusCompany.findByPk(id);
            if (!company) {
                (0, response_1.notFoundResponse)(res, 'Company');
                return;
            }
            await company.destroy();
            (0, response_1.successResponse)(res, 200, null, 'Company rejected and removed');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getAllUsers(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can view all users');
                return;
            }
            const { role, page = 1, limit = 50 } = req.query;
            const whereClause = {};
            if (role)
                whereClause.role = role;
            const { count, rows } = await models_1.User.findAndCountAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit, 10),
                offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            });
            (0, response_1.successResponse)(res, 200, {
                users: rows.map((u) => ({
                    userId: u.userId,
                    fullName: u.fullName,
                    email: u.email,
                    phoneNumber: u.phoneNumber,
                    role: u.role,
                    isActive: u.isActive,
                    createdAt: u.createdAt,
                })),
                total: count,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
            });
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async updateUserRole(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can update user roles');
                return;
            }
            const { id } = req.params;
            const { role } = req.body;
            const user = await models_1.User.findByPk(id);
            if (!user) {
                (0, response_1.notFoundResponse)(res, 'User');
                return;
            }
            user.role = role;
            await user.save();
            (0, response_1.successResponse)(res, 200, user, 'User role updated successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getAnalytics(req, res) {
        try {
            // Admins see platform-wide metrics; operators see the same shape for their
            // revenue dashboard. (Operated-company scoping can be added in Phase 2.)
            const role = req.user?.role;
            if (role !== 'ADMIN' && role !== 'OPERATOR') {
                (0, response_1.forbiddenResponse)(res, 'Not authorized to view analytics');
                return;
            }
            const totalUsers = await models_1.User.count();
            const totalOperators = await models_1.User.count({ where: { role: 'OPERATOR' } });
            const totalActiveTrips = await models_1.Trip.count({ where: { status: { [sequelize_1.Op.notIn]: ['COMPLETED', 'CANCELLED'] } } });
            const totalBookings = await models_1.Booking.count({ where: { paymentStatus: 'CONFIRMED' } });
            // fareAmount lives on Trip, not Booking - join through the trip association.
            const revenueResult = await models_1.Booking.findAll({
                attributes: [[database_1.sequelize.fn('SUM', database_1.sequelize.col('trip.fareAmount')), 'totalRevenue']],
                where: { paymentStatus: 'CONFIRMED' },
                include: [
                    {
                        model: (await Promise.resolve().then(() => __importStar(require('../models')))).Trip,
                        as: 'trip',
                        attributes: [],
                        required: true,
                    },
                ],
                raw: true,
            });
            const totalRevenueNum = revenueResult.length > 0 && revenueResult[0]
                ? Number(revenueResult[0].totalRevenue) || 0
                : 0;
            // Read commission rate from DB (persisted), fallback to config
            let commissionRate = config_1.config.app.commissionRate;
            try {
                const settings = await models_1.CommissionSettings.findOne();
                if (settings)
                    commissionRate = Number(settings.commissionRate);
            }
            catch { /* table may not exist yet */ }
            const commissionAmount = totalRevenueNum * commissionRate;
            (0, response_1.successResponse)(res, 200, {
                totalUsers,
                totalOperators,
                totalActiveTrips,
                totalBookings,
                totalRevenue: totalRevenueNum,
                commissionRate,
                commissionAmount,
                netPayout: totalRevenueNum - commissionAmount,
            });
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async updateCommission(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can update commission rate');
                return;
            }
            const { commissionRate } = req.body;
            if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 1) {
                (0, response_1.errorResponse)(res, 400, 'Commission rate must be a number between 0 and 1');
                return;
            }
            // Persist to database
            let settings = await models_1.CommissionSettings.findOne();
            if (settings) {
                settings.commissionRate = commissionRate;
                await settings.save();
            }
            else {
                settings = await models_1.CommissionSettings.create({ commissionRate });
            }
            // Also update in-memory config as fallback
            config_1.config.app.commissionRate = commissionRate;
            (0, response_1.successResponse)(res, 200, {
                commissionRate: Number(settings.commissionRate),
                seatLockDurationMinutes: settings.seatLockDurationMinutes,
            }, 'Commission rate updated');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    /**
     * GET /api/admin/settings
     * Returns all platform settings (admin only).
     */
    async getSettings(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can view settings');
                return;
            }
            let settings = await models_1.CommissionSettings.findOne();
            if (!settings) {
                settings = await models_1.CommissionSettings.create({
                    commissionRate: config_1.config.app.commissionRate,
                });
            }
            (0, response_1.successResponse)(res, 200, {
                commissionRate: Number(settings.commissionRate),
                platformName: settings.platformName,
                currency: settings.currency,
                seatLockDurationMinutes: settings.seatLockDurationMinutes,
            });
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    /**
     * PUT /api/admin/settings
     * Update platform settings (admin only).
     */
    async updateSettings(req, res) {
        try {
            const isAdmin = req.user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.forbiddenResponse)(res, 'Only admins can update settings');
                return;
            }
            const { commissionRate, platformName, currency, seatLockDurationMinutes } = req.body;
            let settings = await models_1.CommissionSettings.findOne();
            if (!settings) {
                settings = await models_1.CommissionSettings.create({
                    commissionRate: config_1.config.app.commissionRate,
                });
            }
            if (commissionRate !== undefined)
                settings.commissionRate = commissionRate;
            if (platformName !== undefined)
                settings.platformName = platformName;
            if (currency !== undefined)
                settings.currency = currency;
            if (seatLockDurationMinutes !== undefined)
                settings.seatLockDurationMinutes = seatLockDurationMinutes;
            await settings.save();
            // Sync in-memory config
            config_1.config.app.commissionRate = Number(settings.commissionRate);
            (0, response_1.successResponse)(res, 200, {
                commissionRate: Number(settings.commissionRate),
                platformName: settings.platformName,
                currency: settings.currency,
                seatLockDurationMinutes: settings.seatLockDurationMinutes,
            }, 'Settings updated');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map