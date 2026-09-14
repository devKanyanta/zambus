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
exports.createBooking = createBooking;
exports.confirmBooking = confirmBooking;
exports.getBookingById = getBookingById;
exports.getPassengerBookings = getPassengerBookings;
exports.cancelBooking = cancelBooking;
exports.getAvailableSeats = getAvailableSeats;
exports.searchTrips = searchTrips;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const qr_service_1 = require("./qr.service");
const seat_lock_service_1 = require("./seat-lock.service");
async function createBooking(input) {
    // Release any expired seat locks before creating a new booking
    await (0, seat_lock_service_1.releaseExpiredSeatLocks)();
    const Transaction = database_1.sequelize;
    const Sequelize = database_1.sequelize;
    const transaction = await database_1.sequelize.transaction();
    try {
        const Trip = (await Promise.resolve().then(() => __importStar(require('../models')))).Trip;
        const Booking = (await Promise.resolve().then(() => __importStar(require('../models')))).Booking;
        const Bus = (await Promise.resolve().then(() => __importStar(require('../models')))).Bus;
        const trip = await Trip.findOne({
            where: { tripId: input.tripId },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!trip) {
            throw new Error('Trip not found');
        }
        if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
            throw new Error('This trip is no longer available for booking');
        }
        const existingBooking = await Booking.findOne({
            where: {
                tripId: input.tripId,
                seatNumber: input.seatNumber,
            },
            transaction,
        });
        if (existingBooking) {
            throw new Error('Seat is already booked');
        }
        const tripWithBus = await Trip.findByPk(input.tripId, {
            include: [{ model: Bus, as: 'bus' }],
            transaction,
        });
        if (!tripWithBus) {
            throw new Error('Trip not found');
        }
        const busData = tripWithBus.bus;
        const busCapacity = busData ? busData.seatCapacity : 40;
        if (busData && input.seatNumber > busCapacity) {
            throw new Error(`Seat number exceeds bus capacity of ${busCapacity}`);
        }
        const qrData = await (0, qr_service_1.generateQrCodeData)({
            bookingId: 'pending',
            passengerName: 'Pending',
            seatNumber: input.seatNumber,
            route: tripWithBus.route ? tripWithBus.route.routeName : 'Unknown Route',
            busReg: busData ? busData.registrationNumber : 'Unknown',
            departureTime: tripWithBus.departureTime.toISOString(),
            boardingStatus: 'NOT_BOARDED',
        });
        const booking = await Booking.create({
            tripId: input.tripId,
            passengerId: input.passengerId,
            seatNumber: input.seatNumber,
            qrCodeData: qrData,
            paymentStatus: 'PENDING',
            boardingStatus: 'NOT_BOARDED',
        }, { transaction });
        await transaction.commit();
        return booking;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
}
async function confirmBooking(bookingId) {
    const { Trip, Booking, User, Bus, Route } = await Promise.resolve().then(() => __importStar(require('../models')));
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.paymentStatus === 'CONFIRMED') {
        throw new Error('Booking is already confirmed');
    }
    booking.paymentStatus = 'CONFIRMED';
    await booking.save();
    const trip = await Trip.findByPk(booking.tripId, {
        include: [{ model: Bus, as: 'bus' }, { model: Route, as: 'route' }],
    });
    const passenger = await User.findByPk(booking.passengerId);
    const qrData = await (0, qr_service_1.generateQrCodeData)({
        bookingId: booking.bookingId,
        passengerName: passenger?.fullName || 'Unknown',
        seatNumber: booking.seatNumber,
        route: trip?.route ? trip.route.routeName : 'Unknown Route',
        busReg: trip?.bus ? trip.bus.registrationNumber : 'Unknown',
        departureTime: trip?.departureTime?.toISOString() || '',
        boardingStatus: booking.boardingStatus,
    });
    booking.qrCodeData = qrData;
    await booking.save();
    return booking;
}
async function getBookingById(bookingId) {
    const { Trip, Booking, User, Bus, Route } = await Promise.resolve().then(() => __importStar(require('../models')));
    const booking = await Booking.findByPk(bookingId);
    if (!booking)
        return null;
    const trip = await Trip.findByPk(booking.tripId, {
        include: [{ model: Bus, as: 'bus' }, { model: Route, as: 'route' }],
    });
    const passenger = await User.findByPk(booking.passengerId);
    return { booking, trip, passenger };
}
async function getPassengerBookings(passengerId) {
    const { Trip, Booking, User, Bus, Route } = await Promise.resolve().then(() => __importStar(require('../models')));
    const bookings = await Booking.findAll({
        where: { passengerId },
        order: [['createdAt', 'DESC']],
    });
    const results = await Promise.all(bookings.map(async (b) => {
        const trip = await Trip.findByPk(b.tripId, {
            include: [{ model: Bus, as: 'bus' }, { model: Route, as: 'route' }],
        });
        const passenger = await User.findByPk(b.passengerId);
        return { booking: b, trip, passenger };
    }));
    return results;
}
async function cancelBooking(bookingId) {
    const { Booking } = await Promise.resolve().then(() => __importStar(require('../models')));
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.boardingStatus !== 'NOT_BOARDED') {
        throw new Error('Cannot cancel a booking that has already been used for boarding');
    }
    booking.paymentStatus = 'REFUNDED';
    await booking.save();
    return booking;
}
async function getAvailableSeats(tripId, busCapacity) {
    const { Booking } = await Promise.resolve().then(() => __importStar(require('../models')));
    const bookedSeats = await Booking.findAll({
        where: {
            tripId,
            paymentStatus: 'CONFIRMED',
        },
        attributes: ['seatNumber'],
        raw: true,
    });
    const bookedSeatNumbers = new Set(bookedSeats.map((b) => b.seatNumber));
    const availableSeats = [];
    for (let i = 1; i <= busCapacity; i++) {
        if (!bookedSeatNumbers.has(i)) {
            availableSeats.push(i);
        }
    }
    return availableSeats;
}
async function searchTrips(options) {
    const { Trip, Booking, Bus, Route } = await Promise.resolve().then(() => __importStar(require('../models')));
    // Op is imported from 'sequelize' at the top of this file
    const { origin, destination, travelDate, filter, page = 1, limit = 20 } = options;
    // Trip-level filters
    const tripWhere = {};
    if (travelDate) {
        const date = new Date(travelDate);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        tripWhere.departureTime = {
            [sequelize_1.Op.between]: [startOfDay, endOfDay],
        };
    }
    tripWhere.status = { [sequelize_1.Op.notIn]: ['CANCELLED'] };
    // Route-level filters (origin/destination live on the Route model)
    const routeWhere = {};
    if (origin)
        routeWhere.origin = { [sequelize_1.Op.iLike]: `%${origin}%` };
    if (destination)
        routeWhere.destination = { [sequelize_1.Op.iLike]: `%${destination}%` };
    const hasRouteFilter = Object.keys(routeWhere).length > 0;
    let order = [['departureTime', 'ASC']];
    if (filter === 'lowestPrice') {
        order = [['fareAmount', 'ASC']];
    }
    const include = [
        {
            model: Bus,
            as: 'bus',
            attributes: ['busId', 'registrationNumber', 'model', 'seatCapacity', 'maintenanceStatus', 'amenities'],
        },
        {
            model: Route,
            as: 'route',
            where: hasRouteFilter ? routeWhere : undefined,
            attributes: ['routeId', 'routeName', 'origin', 'destination'],
        },
    ];
    const { count, rows } = await Trip.findAndCountAll({
        where: tripWhere,
        include,
        order,
        limit,
        offset: (page - 1) * limit,
        distinct: true,
    });
    const tripsWithSeats = await Promise.all(rows.map(async (trip) => {
        const bookedCount = await Booking.count({
            where: {
                tripId: trip.tripId,
                paymentStatus: 'CONFIRMED',
            },
        });
        const busData = trip.bus;
        const busCapacity = busData ? busData.seatCapacity : 40;
        const remainingSeats = Math.max(0, busCapacity - bookedCount);
        return {
            ...trip.toJSON(),
            remainingSeats,
            busCategory: getBusCategory(busData ? busData.amenities : []),
        };
    }));
    return {
        trips: tripsWithSeats,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
    };
}
function getBusCategory(amenities) {
    if (!amenities || !Array.isArray(amenities))
        return 'Standard';
    const safeAmenities = amenities.filter((a) => typeof a === 'string');
    const luxuryAmenities = ['wifi', 'tv', 'toilet', 'ac'];
    const hasLuxury = luxuryAmenities.every((a) => safeAmenities.some((am) => am.toLowerCase().includes(a)));
    if (hasLuxury)
        return 'Luxury';
    const hasSome = safeAmenities.some((am) => am.toLowerCase().includes('ac') || am.toLowerCase().includes('wifi'));
    if (hasSome)
        return 'Semi-Luxury';
    return 'Standard';
}
//# sourceMappingURL=booking.service.js.map