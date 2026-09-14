"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.busController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
exports.busController = {
    async getAll(req, res) {
        try {
            const operatorId = req.user?.userId;
            const companyId = req.query.companyId;
            const whereClause = {};
            if (operatorId) {
                const company = await models_1.BusCompany.findOne({ where: { operatorId } });
                if (company) {
                    whereClause.companyId = company.companyId;
                }
            }
            if (companyId) {
                whereClause.companyId = companyId;
            }
            const buses = await models_1.Bus.findAll({
                where: whereClause,
                include: [{ model: models_1.Bus.sequelize?.models?.BusCompany, as: 'company' }],
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.successResponse)(res, 200, buses);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const bus = await models_1.Bus.findByPk(id, {
                include: [{ model: models_1.Bus.sequelize?.models?.BusCompany, as: 'company' }],
            });
            if (!bus) {
                (0, response_1.notFoundResponse)(res, 'Bus');
                return;
            }
            (0, response_1.successResponse)(res, 200, bus);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async create(req, res) {
        try {
            const { registrationNumber, model, seatCapacity, amenities = [], maintenanceStatus = "OPERATIONAL" } = req.body;
            const operatorId = req.user?.userId;
            if (!operatorId) {
                (0, response_1.errorResponse)(res, 401, 'Operator authentication required');
                return;
            }
            const user = await (models_1.Bus.sequelize?.models?.User).findByPk(operatorId);
            if (!user || user.role !== 'OPERATOR' && user.role !== 'ADMIN') {
                (0, response_1.errorResponse)(res, 403, 'Only operators can register buses');
                return;
            }
            const busCompany = await models_1.BusCompany.findOne({ where: { operatorId } });
            if (!busCompany) {
                (0, response_1.errorResponse)(res, 400, 'Operator must have a bus company registered first');
                return;
            }
            const bus = await models_1.Bus.create({
                companyId: busCompany.companyId,
                registrationNumber,
                model,
                seatCapacity,
                amenities,
                maintenanceStatus,
            });
            (0, response_1.successResponse)(res, 201, bus, 'Bus registered successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const operatorId = req.user?.userId;
            if (!operatorId) {
                (0, response_1.errorResponse)(res, 401, 'Authentication required');
                return;
            }
            const bus = await models_1.Bus.findByPk(id);
            if (!bus) {
                (0, response_1.notFoundResponse)(res, 'Bus');
                return;
            }
            // Check ownership
            const busCompany = await models_1.BusCompany.findOne({ where: { operatorId } });
            const isAdmin = (await (models_1.Bus.sequelize?.models?.User).findByPk(operatorId))?.role === 'ADMIN';
            if (!isAdmin && bus.companyId !== busCompany?.companyId) {
                (0, response_1.errorResponse)(res, 403, 'Not authorized to update this bus');
                return;
            }
            await bus.update(updates);
            await bus.save();
            (0, response_1.successResponse)(res, 200, bus, 'Bus updated successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            const operatorId = req.user?.userId;
            if (!operatorId) {
                (0, response_1.errorResponse)(res, 401, 'Authentication required');
                return;
            }
            const bus = await models_1.Bus.findByPk(id);
            if (!bus) {
                (0, response_1.notFoundResponse)(res, 'Bus');
                return;
            }
            // Check ownership
            const busCompany = await models_1.BusCompany.findOne({ where: { operatorId } });
            const isAdmin = (await (models_1.Bus.sequelize?.models?.User).findByPk(operatorId))?.role === 'ADMIN';
            if (!isAdmin && bus.companyId !== busCompany?.companyId) {
                (0, response_1.errorResponse)(res, 403, 'Not authorized to delete this bus');
                return;
            }
            // Check if trip exists for this bus
            const Trip = models_1.Bus.sequelize?.models?.Trip;
            const tripCount = await Trip.count({ where: { busId: id } });
            if (tripCount > 0) {
                (0, response_1.errorResponse)(res, 400, 'Cannot delete bus with scheduled trips');
                return;
            }
            await bus.destroy();
            (0, response_1.successResponse)(res, 200, null, 'Bus deleted successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
};
//# sourceMappingURL=bus.controller.js.map