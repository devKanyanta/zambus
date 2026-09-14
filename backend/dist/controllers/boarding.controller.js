"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardingController = void 0;
const boarding_service_1 = require("../services/boarding.service");
const response_1 = require("../utils/response");
exports.boardingController = {
    async scan(req, res) {
        try {
            const { qrCodeData, tripId } = req.body;
            const result = await (0, boarding_service_1.validateScannedTicket)(qrCodeData, tripId);
            (0, response_1.successResponse)(res, 200, {
                valid: result.valid,
                status: result.status,
                message: result.message,
                booking: result.booking ? {
                    bookingId: result.booking.bookingId,
                    seatNumber: result.booking.seatNumber,
                    passengerName: result.booking.passenger?.fullName,
                    boardingStatus: result.booking.boardingStatus,
                } : null,
            });
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async markBoarded(req, res) {
        try {
            const { bookingId } = req.body;
            const booking = await (0, boarding_service_1.markAsBoarded)(bookingId);
            (0, response_1.successResponse)(res, 200, booking, 'Passenger marked as boarded');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async markDroppedOff(req, res) {
        try {
            const { bookingId } = req.body;
            const booking = await (0, boarding_service_1.markAsDroppedOff)(bookingId);
            (0, response_1.successResponse)(res, 200, booking, 'Passenger marked as dropped off');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async getManifest(req, res) {
        try {
            const { tripId } = req.query;
            if (!tripId) {
                (0, response_1.errorResponse)(res, 400, 'Trip ID is required');
                return;
            }
            const manifest = await (0, boarding_service_1.getManifest)(tripId);
            (0, response_1.successResponse)(res, 200, manifest);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
};
//# sourceMappingURL=boarding.controller.js.map