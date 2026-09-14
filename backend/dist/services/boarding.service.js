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
exports.validateScannedTicket = validateScannedTicket;
exports.markAsBoarded = markAsBoarded;
exports.markAsDroppedOff = markAsDroppedOff;
exports.getManifest = getManifest;
const qr_service_1 = require("./qr.service");
async function validateScannedTicket(qrData, tripId) {
    const { Booking, Trip } = await Promise.resolve().then(() => __importStar(require('../models')));
    const ticketData = (0, qr_service_1.parseQrCodeData)(qrData);
    if (!ticketData) {
        return {
            valid: false,
            message: 'Invalid QR code data',
            booking: null,
            status: 'NOT_FOUND',
        };
    }
    const booking = await Booking.findByPk(ticketData.bookingId);
    if (!booking) {
        return {
            valid: false,
            message: 'Booking not found',
            booking: null,
            status: 'NOT_FOUND',
        };
    }
    if (booking.boardingStatus === 'BOARDED') {
        return {
            valid: false,
            message: 'Ticket already used for boarding',
            booking,
            status: 'DUPLICATE',
        };
    }
    if (tripId && booking.tripId !== tripId) {
        return {
            valid: false,
            message: 'Ticket is for a different trip',
            booking,
            status: 'INVALID_ROUTE',
        };
    }
    const trip = await Trip.findByPk(booking.tripId);
    if (trip && trip.departureTime) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const departureDate = new Date(trip.departureTime);
        departureDate.setHours(0, 0, 0, 0);
        if (departureDate.getTime() !== today.getTime()) {
            return {
                valid: false,
                message: 'Ticket is not for today\'s travel',
                booking,
                status: 'WRONG_DATE',
            };
        }
    }
    return {
        valid: true,
        message: 'Valid ticket',
        booking,
        status: 'VALID',
    };
}
async function markAsBoarded(bookingId) {
    const { Booking } = await Promise.resolve().then(() => __importStar(require('../models')));
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.boardingStatus === 'BOARDED') {
        throw new Error('Passenger is already marked as boarded');
    }
    booking.boardingStatus = 'BOARDED';
    await booking.save();
    return booking;
}
async function markAsDroppedOff(bookingId) {
    const { Booking, Trip, User } = await Promise.resolve().then(() => __importStar(require('../models')));
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.boardingStatus !== 'BOARDED') {
        throw new Error('Passenger must be boarded before being marked as dropped off');
    }
    booking.boardingStatus = 'DROPPED_OFF';
    await booking.save();
    return booking;
}
async function getManifest(tripId) {
    const { Trip, Booking, User, Bus, Route } = await Promise.resolve().then(() => __importStar(require('../models')));
    const trip = await Trip.findByPk(tripId, {
        include: [
            { model: Bus, as: 'bus' },
            { model: Route, as: 'route' },
        ],
    });
    if (!trip) {
        throw new Error('Trip not found');
    }
    const bookings = await Booking.findAll({
        where: { tripId },
        order: [['seatNumber', 'ASC']],
    });
    const passengers = await Promise.all(bookings.map(async (b) => {
        const passenger = await User.findByPk(b.passengerId);
        return {
            bookingId: b.bookingId,
            seatNumber: b.seatNumber,
            passengerName: passenger?.fullName || 'Unknown',
            passengerPhone: passenger?.phoneNumber || '',
            qrCodeData: b.qrCodeData,
            boardingStatus: b.boardingStatus,
            paymentStatus: b.paymentStatus,
        };
    }));
    return {
        trip: {
            tripId: trip.tripId,
            routeName: trip.route ? trip.route.routeName : undefined,
            origin: trip.route ? trip.route.origin : undefined,
            destination: trip.route ? trip.route.destination : undefined,
            departureTime: trip.departureTime,
            busReg: trip.bus ? trip.bus.registrationNumber : undefined,
            busModel: trip.bus ? trip.bus.model : undefined,
        },
        passengers,
        totals: {
            totalPassengers: bookings.length,
            boarded: bookings.filter((b) => b.boardingStatus === 'BOARDED').length,
            notBoarded: bookings.filter((b) => b.boardingStatus === 'NOT_BOARDED').length,
            droppedOff: bookings.filter((b) => b.boardingStatus === 'DROPPED_OFF').length,
        },
    };
}
//# sourceMappingURL=boarding.service.js.map