"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
exports.routeController = {
    async getAll(req, res) {
        try {
            const routes = await models_1.Route.findAll({
                include: [{ model: models_1.Route.sequelize?.models?.BusCompany, as: 'company' }],
                order: [['createdAt', 'DESC']],
            });
            (0, response_1.successResponse)(res, 200, routes);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const route = await models_1.Route.findByPk(id, {
                include: [{ model: models_1.Route.sequelize?.models?.BusCompany, as: 'company' }],
            });
            if (!route) {
                (0, response_1.notFoundResponse)(res, 'Route');
                return;
            }
            (0, response_1.successResponse)(res, 200, route);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async create(req, res) {
        try {
            const { routeName, origin, destination, intermediateStops = [], estimatedTravelTime } = req.body;
            const operatorId = req.user?.userId;
            if (!operatorId) {
                (0, response_1.errorResponse)(res, 401, 'Operator authentication required');
                return;
            }
            const user = await (models_1.Route.sequelize?.models?.User).findByPk(operatorId);
            if (!user || user.role !== 'OPERATOR' && user.role !== 'ADMIN') {
                (0, response_1.errorResponse)(res, 403, 'Only operators can create routes');
                return;
            }
            const busCompany = await (models_1.Route.sequelize?.models?.BusCompany).findOne({
                where: { operatorId },
            });
            if (!busCompany) {
                (0, response_1.errorResponse)(res, 400, 'Operator must have a bus company registered first');
                return;
            }
            const route = await models_1.Route.create({
                companyId: busCompany.companyId,
                routeName,
                origin,
                destination,
                intermediateStops,
                estimatedTravelTime,
            });
            (0, response_1.successResponse)(res, 201, route, 'Route created successfully');
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
            const route = await models_1.Route.findByPk(id);
            if (!route) {
                (0, response_1.notFoundResponse)(res, 'Route');
                return;
            }
            const user = await (models_1.Route.sequelize?.models?.User).findByPk(operatorId);
            const isAdmin = user?.role === 'ADMIN';
            if (!isAdmin) {
                (0, response_1.errorResponse)(res, 403, 'Not authorized to update this route');
                return;
            }
            await route.update(updates);
            await route.save();
            (0, response_1.successResponse)(res, 200, route, 'Route updated successfully');
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
            const route = await models_1.Route.findByPk(id);
            if (!route) {
                (0, response_1.notFoundResponse)(res, 'Route');
                return;
            }
            const Trip = models_1.Route.sequelize?.models?.Trip;
            const tripCount = await Trip.count({ where: { routeId: id } });
            if (tripCount > 0) {
                (0, response_1.errorResponse)(res, 400, 'Cannot delete route with scheduled trips');
                return;
            }
            await route.destroy();
            (0, response_1.successResponse)(res, 200, null, 'Route deleted successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
};
//# sourceMappingURL=route.controller.js.map