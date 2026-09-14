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
exports.tripController = void 0;
exports.getTripSeats = getTripSeats;
exports.getDrivers = getDrivers;
const models_1 = require("../models");
const booking_service_1 = require("../services/booking.service");
const boarding_service_1 = require("../services/boarding.service");
const response_1 = require("../utils/response");
/**
 * GET /api/trips/:id/seats
 * Returns the seat map for a trip: which seats are available and which are taken.
 * A seat is considered taken if it has ANY booking (pending or confirmed) so that
 * two passengers cannot select the same seat at the same time.
 */
async function getTripSeats(req, res) {
    try {
        const { id } = req.params;
        const Bus = (await Promise.resolve().then(() => __importStar(require('../models')))).Bus;
        const Booking = (await Promise.resolve().then(() => __importStar(require('../models')))).Booking;
        const trip = await models_1.Trip.findByPk(id, {
            include: [{ model: (await Promise.resolve().then(() => __importStar(require('../models')))).Bus, as: 'bus' }],
        });
        if (!trip) {
            (0, response_1.notFoundResponse)(res, 'Trip');
            return;
        }
        const bus = trip.bus;
        const capacity = bus ? bus.seatCapacity : 40;
        // Any booking on the seat (pending or confirmed) blocks selection.
        const bookings = await Booking.findAll({
            where: { tripId: id },
            attributes: ['seatNumber'],
            raw: true,
        });
        const takenSeats = bookings.map((b) => Number(b.seatNumber));
        const seats = Array.from({ length: capacity }, (_, i) => i + 1).map((n) => ({
            seatNumber: n,
            available: !takenSeats.includes(n),
        }));
        (0, response_1.successResponse)(res, 200, {
            tripId: id,
            busCapacity: capacity,
            availableSeats: seats.filter((s) => s.available).map((s) => s.seatNumber),
            takenSeats,
            seats,
        });
    }
    catch (error) {
        (0, response_1.errorResponse)(res, 500, error.message);
    }
}
/**
 * GET /api/trips/drivers
 * Lists all active DRIVER accounts. Used by operators when assigning a driver
 * to a new trip. Must be declared BEFORE the /:id route.
 */
async function getDrivers(req, res) {
    try {
        const User = (await Promise.resolve().then(() => __importStar(require('../models')))).User;
        const drivers = await User.findAll({
            where: { role: 'DRIVER', isActive: true },
            attributes: ['userId', 'fullName', 'phoneNumber', 'email'],
            order: [['fullName', 'ASC']],
        });
        (0, response_1.successResponse)(res, 200, drivers);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, 500, error.message);
    }
}
exports.tripController = {
    async searchPublic(req, res) {
        try {
            const { origin, destination, travelDate, filter, page, limit } = req.query;
            const result = await (0, booking_service_1.searchTrips)({
                origin: origin,
                destination: destination,
                travelDate: travelDate,
                filter: filter,
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            (0, response_1.successResponse)(res, 200, result);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const trip = await models_1.Trip.findByPk(id, {
                include: [
                    { model: (await Promise.resolve().then(() => __importStar(require('../models')))).Bus, as: 'bus' },
                    { model: (await Promise.resolve().then(() => __importStar(require('../models')))).Route, as: 'route' },
                    { model: (await Promise.resolve().then(() => __importStar(require('../models')))).User, as: 'driver', attributes: ['userId', 'fullName', 'phoneNumber'] },
                ],
            });
            if (!trip) {
                (0, response_1.notFoundResponse)(res, 'Trip');
                return;
            }
            (0, response_1.successResponse)(res, 200, trip);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async create(req, res) {
        try {
            const { routeId, busId, driverId, departureTime, estimatedArrival, fareAmount, isRecurring = false, recurrencePattern } = req.body;
            const operatorId = req.user?.userId;
            if (!operatorId) {
                (0, response_1.errorResponse)(res, 401, 'Operator authentication required');
                return;
            }
            const User = (await Promise.resolve().then(() => __importStar(require('../models')))).User;
            const user = await User.findByPk(operatorId);
            if (!user || user.role !== 'OPERATOR' && user.role !== 'ADMIN') {
                (0, response_1.errorResponse)(res, 403, 'Only operators can create trips');
                return;
            }
            const BusCompany = (await Promise.resolve().then(() => __importStar(require('../models')))).BusCompany;
            const busCompany = await BusCompany.findOne({ where: { operatorId } });
            if (!busCompany) {
                (0, response_1.errorResponse)(res, 400, 'Operator must have a bus company');
                return;
            }
            const Bus = (await Promise.resolve().then(() => __importStar(require('../models')))).Bus;
            const bus = await Bus.findOne({ where: { busId, companyId: busCompany.companyId } });
            if (!bus) {
                (0, response_1.errorResponse)(res, 400, 'Bus not found or not owned by operator');
                return;
            }
            const Route = (await Promise.resolve().then(() => __importStar(require('../models')))).Route;
            const route = await Route.findOne({ where: { routeId, companyId: busCompany.companyId } });
            if (!route) {
                (0, response_1.errorResponse)(res, 400, 'Route not found or not owned by operator');
                return;
            }
            const Driver = (await Promise.resolve().then(() => __importStar(require('../models')))).User;
            const driver = await Driver.findOne({ where: { userId: driverId, role: 'DRIVER' } });
            if (!driver) {
                (0, response_1.errorResponse)(res, 400, 'Driver not found or invalid role');
                return;
            }
            const trip = await models_1.Trip.create({
                routeId,
                busId,
                driverId,
                departureTime: new Date(departureTime),
                estimatedArrival: new Date(estimatedArrival),
                fareAmount,
                isRecurring,
                recurrencePattern,
                status: 'SCHEDULED',
            });
            (0, response_1.successResponse)(res, 201, trip, 'Trip created successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const trip = await models_1.Trip.findByPk(id);
            if (!trip) {
                (0, response_1.notFoundResponse)(res, 'Trip');
                return;
            }
            await trip.update(updates);
            (0, response_1.successResponse)(res, 200, trip, 'Trip updated successfully');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async openTrip(req, res) {
        try {
            const { id } = req.params;
            const trip = await models_1.Trip.findByPk(id);
            if (!trip) {
                (0, response_1.notFoundResponse)(res, 'Trip');
                return;
            }
            trip.status = 'BOARDING';
            await trip.save();
            (0, response_1.successResponse)(res, 200, trip, 'Trip opened for boarding');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async closeTrip(req, res) {
        try {
            const { id } = req.params;
            const trip = await models_1.Trip.findByPk(id);
            if (!trip) {
                (0, response_1.notFoundResponse)(res, 'Trip');
                return;
            }
            trip.status = 'COMPLETED';
            await trip.save();
            (0, response_1.successResponse)(res, 200, trip, 'Trip closed');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async delayTrip(req, res) {
        try {
            const { id } = req.params;
            const { newDepartureTime } = req.body;
            if (!newDepartureTime) {
                (0, response_1.errorResponse)(res, 400, 'New departure time is required');
                return;
            }
            const trip = await models_1.Trip.findByPk(id);
            if (!trip) {
                (0, response_1.notFoundResponse)(res, 'Trip');
                return;
            }
            trip.departureTime = new Date(newDepartureTime);
            await trip.save();
            (0, response_1.successResponse)(res, 200, trip, 'Trip delayed');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async cancelTrip(req, res) {
        try {
            const { id } = req.params;
            const trip = await models_1.Trip.findByPk(id);
            if (!trip) {
                (0, response_1.notFoundResponse)(res, 'Trip');
                return;
            }
            trip.status = 'CANCELLED';
            await trip.save();
            (0, response_1.successResponse)(res, 200, trip, 'Trip cancelled');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getManifest(req, res) {
        try {
            const { id } = req.params;
            const manifest = await (0, boarding_service_1.getManifest)(id);
            (0, response_1.successResponse)(res, 200, manifest);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
};
//# sourceMappingURL=trip.controller.js.map