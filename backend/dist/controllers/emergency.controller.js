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
exports.emergencyController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
exports.emergencyController = {
    async report(req, res) {
        try {
            if (!req.user) {
                (0, response_1.errorResponse)(res, 401, 'Authentication required');
                return;
            }
            const { emergencyType, description, location, tripId } = req.body;
            const driverId = req.user.userId;
            const User = (await Promise.resolve().then(() => __importStar(require('../models')))).User;
            const driver = await User.findByPk(driverId);
            if (!driver || driver.role !== 'DRIVER') {
                (0, response_1.errorResponse)(res, 403, 'Only drivers can report emergencies');
                return;
            }
            const report = await models_1.EmergencyReport.create({
                tripId: tripId || null,
                driverId,
                emergencyType: emergencyType,
                description: description || null,
                location: location || null,
            });
            (0, response_1.successResponse)(res, 201, report, 'Emergency reported successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async getReports(req, res) {
        try {
            const { tripId, limit = 50, offset = 0 } = req.query;
            const whereClause = {};
            if (tripId)
                whereClause.tripId = tripId;
            const reports = await models_1.EmergencyReport.findAll({
                where: whereClause,
                include: [
                    { model: (await Promise.resolve().then(() => __importStar(require('../models')))).User, as: 'driver', attributes: ['userId', 'fullName', 'phoneNumber'] },
                    { model: (await Promise.resolve().then(() => __importStar(require('../models')))).Trip, as: 'trip' },
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
            });
            (0, response_1.successResponse)(res, 200, reports);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
};
//# sourceMappingURL=emergency.controller.js.map