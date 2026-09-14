"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const booking_service_1 = require("../services/booking.service");
const response_1 = require("../utils/response");
exports.bookingController = {
    async create(req, res) {
        try {
            if (!req.user) {
                (0, response_1.errorResponse)(res, 401, 'Authentication required');
                return;
            }
            const { tripId, seatNumber } = req.body;
            const passengerId = req.user.userId;
            const booking = await (0, booking_service_1.createBooking)({ tripId, passengerId, seatNumber });
            (0, response_1.successResponse)(res, 201, booking, 'Seat reserved. Please confirm payment.');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async confirm(req, res) {
        try {
            const { id } = req.params;
            const { paymentMethod } = req.body;
            const booking = await (0, booking_service_1.confirmBooking)(id);
            (0, response_1.successResponse)(res, 200, booking, 'Payment confirmed. Booking is now active.');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const bookingDetails = await (0, booking_service_1.getBookingById)(id);
            if (!bookingDetails) {
                (0, response_1.notFoundResponse)(res, 'Booking');
                return;
            }
            const t = bookingDetails.trip;
            const p = bookingDetails.passenger;
            (0, response_1.successResponse)(res, 200, {
                booking: {
                    bookingId: bookingDetails.booking.bookingId,
                    tripId: bookingDetails.booking.tripId,
                    passengerId: bookingDetails.booking.passengerId,
                    seatNumber: bookingDetails.booking.seatNumber,
                    qrCodeData: bookingDetails.booking.qrCodeData,
                    paymentStatus: bookingDetails.booking.paymentStatus,
                    boardingStatus: bookingDetails.booking.boardingStatus,
                    createdAt: bookingDetails.booking.createdAt,
                },
                trip: t ? {
                    tripId: t.tripId,
                    routeName: t.route ? t.route.routeName : undefined,
                    origin: t.route ? t.route.origin : undefined,
                    destination: t.route ? t.route.destination : undefined,
                    departureTime: t.departureTime,
                    estimatedArrival: t.estimatedArrival,
                    fareAmount: t.fareAmount,
                    busReg: t.bus ? t.bus.registrationNumber : undefined,
                    busModel: t.bus ? t.bus.model : undefined,
                } : null,
                passenger: p ? {
                    fullName: p.fullName,
                    phoneNumber: p.phoneNumber,
                    email: p.email,
                } : null,
            });
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async getMyBookings(req, res) {
        try {
            if (!req.user) {
                (0, response_1.errorResponse)(res, 401, 'Authentication required');
                return;
            }
            const bookings = await (0, booking_service_1.getPassengerBookings)(req.user.userId);
            const formattedBookings = bookings.map((b) => {
                const t = b.trip;
                return {
                    bookingId: b.booking.bookingId,
                    tripId: b.booking.tripId,
                    seatNumber: b.booking.seatNumber,
                    qrCodeData: b.booking.qrCodeData,
                    paymentStatus: b.booking.paymentStatus,
                    boardingStatus: b.booking.boardingStatus,
                    createdAt: b.booking.createdAt,
                    trip: t ? {
                        tripId: t.tripId,
                        routeName: t.route ? t.route.routeName : undefined,
                        origin: t.route ? t.route.origin : undefined,
                        destination: t.route ? t.route.destination : undefined,
                        departureTime: t.departureTime,
                        estimatedArrival: t.estimatedArrival,
                        fareAmount: t.fareAmount,
                        busReg: t.bus ? t.bus.registrationNumber : undefined,
                        busModel: t.bus ? t.bus.model : undefined,
                    } : null,
                };
            });
            (0, response_1.successResponse)(res, 200, formattedBookings);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    },
    async cancel(req, res) {
        try {
            const { id } = req.params;
            const booking = await (0, booking_service_1.cancelBooking)(id);
            (0, response_1.successResponse)(res, 200, booking, 'Booking cancelled. Refund processed.');
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    },
};
//# sourceMappingURL=booking.controller.js.map