"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifestQuerySchema = exports.searchTripsSchema = exports.updateCommissionSchema = exports.updateUserRoleSchema = exports.createEmergencySchema = exports.markBoardedSchema = exports.scanTicketSchema = exports.confirmBookingSchema = exports.createBookingSchema = exports.tripActionSchema = exports.updateTripSchema = exports.createTripSchema = exports.updateBusSchema = exports.createBusSchema = exports.updateRouteSchema = exports.createRouteSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    phoneNumber: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    phoneNumber: zod_1.z.string().min(10).optional(),
});
// Route schemas
exports.createRouteSchema = zod_1.z.object({
    routeName: zod_1.z.string().min(3, 'Route name must be at least 3 characters'),
    origin: zod_1.z.string().min(2, 'Origin is required'),
    destination: zod_1.z.string().min(2, 'Destination is required'),
    intermediateStops: zod_1.z.array(zod_1.z.string()).optional(),
    estimatedTravelTime: zod_1.z.number().optional(),
});
exports.updateRouteSchema = exports.createRouteSchema.partial();
// Bus schemas
exports.createBusSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string().min(1, 'Registration number is required'),
    model: zod_1.z.string().min(2, 'Model is required'),
    seatCapacity: zod_1.z.number().min(1, 'Seat capacity must be at least 1'),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    maintenanceStatus: zod_1.z.enum(['OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE']).optional(),
});
exports.updateBusSchema = exports.createBusSchema.partial();
// Trip schemas
exports.createTripSchema = zod_1.z.object({
    routeId: zod_1.z.string().uuid('Invalid route ID'),
    busId: zod_1.z.string().uuid('Invalid bus ID'),
    driverId: zod_1.z.string().uuid('Invalid driver ID'),
    departureTime: zod_1.z.string().transform((s) => new Date(s)),
    estimatedArrival: zod_1.z.string().transform((s) => new Date(s)),
    fareAmount: zod_1.z.number().min(0, 'Fare must be positive'),
    isRecurring: zod_1.z.boolean().optional(),
    recurrencePattern: zod_1.z.string().optional(),
});
exports.updateTripSchema = exports.createTripSchema.partial();
exports.tripActionSchema = zod_1.z.object({
    newDepartureTime: zod_1.z.string().transform((s) => new Date(s)).optional(),
});
// Booking schemas
exports.createBookingSchema = zod_1.z.object({
    tripId: zod_1.z.string().uuid('Invalid trip ID'),
    seatNumber: zod_1.z.number().min(1, 'Seat number must be positive'),
});
exports.confirmBookingSchema = zod_1.z.object({
    paymentMethod: zod_1.z.string().optional(),
});
// Boarding schemas
exports.scanTicketSchema = zod_1.z.object({
    qrCodeData: zod_1.z.string(),
});
exports.markBoardedSchema = zod_1.z.object({
    bookingId: zod_1.z.string().uuid('Invalid booking ID'),
});
// Emergency schemas
exports.createEmergencySchema = zod_1.z.object({
    emergencyType: zod_1.z.enum(['BREAKDOWN', 'ACCIDENT', 'SEVERE_DELAY']),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    tripId: zod_1.z.string().uuid().optional(),
});
// Admin schemas
exports.updateUserRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['PASSENGER', 'DRIVER', 'OPERATOR', 'ADMIN']),
});
exports.updateCommissionSchema = zod_1.z.object({
    commissionRate: zod_1.z.number().min(0).max(1),
});
// Search/Query schemas
exports.searchTripsSchema = zod_1.z.object({
    origin: zod_1.z.string().optional(),
    destination: zod_1.z.string().optional(),
    travelDate: zod_1.z.string().optional(),
    filter: zod_1.z.enum(['lowestPrice', 'earliestDeparture', 'luxury', 'semiLuxury', 'standard']).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(50).default(20),
});
exports.manifestQuerySchema = zod_1.z.object({
    tripId: zod_1.z.string().uuid('Invalid trip ID'),
});
//# sourceMappingURL=schemas.js.map