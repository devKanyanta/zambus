"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionSettings = exports.EmergencyReport = exports.Booking = exports.Trip = exports.Route = exports.Bus = exports.BusCompany = exports.User = void 0;
exports.initModels = initModels;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// Initialize all models
async function initModels() {
    exports.User = database_1.sequelize.define('User', {
        userId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        fullName: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
        phoneNumber: { type: sequelize_1.DataTypes.STRING(15), unique: true, allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING(100), unique: true, allowNull: false },
        passwordHash: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
        role: { type: sequelize_1.DataTypes.ENUM('PASSENGER', 'DRIVER', 'OPERATOR', 'ADMIN'), allowNull: false },
        isActive: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
    }, { tableName: 'users', timestamps: true });
    exports.BusCompany = database_1.sequelize.define('BusCompany', {
        companyId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        operatorId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
        companyName: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
        registrationNumber: { type: sequelize_1.DataTypes.STRING(50) },
        contactEmail: { type: sequelize_1.DataTypes.STRING(100) },
        contactPhone: { type: sequelize_1.DataTypes.STRING(15) },
        isApproved: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
    }, { tableName: 'bus_companies', timestamps: true });
    exports.Bus = database_1.sequelize.define('Bus', {
        busId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        companyId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
        registrationNumber: { type: sequelize_1.DataTypes.STRING(20), unique: true, allowNull: false },
        model: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
        seatCapacity: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        amenities: { type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), defaultValue: [] },
        maintenanceStatus: { type: sequelize_1.DataTypes.ENUM('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'), defaultValue: 'OPERATIONAL' },
    }, { tableName: 'buses', timestamps: true });
    exports.Route = database_1.sequelize.define('Route', {
        routeId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        companyId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
        routeName: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
        origin: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
        destination: { type: sequelize_1.DataTypes.STRING(100), allowNull: false },
        intermediateStops: { type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING), defaultValue: [] },
        estimatedTravelTime: { type: sequelize_1.DataTypes.INTEGER },
    }, { tableName: 'routes', timestamps: true });
    exports.Trip = database_1.sequelize.define('Trip', {
        tripId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        busId: { type: sequelize_1.DataTypes.UUID },
        routeId: { type: sequelize_1.DataTypes.UUID },
        driverId: { type: sequelize_1.DataTypes.UUID },
        departureTime: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        estimatedArrival: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        fareAmount: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: sequelize_1.DataTypes.ENUM('SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'), defaultValue: 'SCHEDULED' },
        isRecurring: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
        recurrencePattern: { type: sequelize_1.DataTypes.STRING(50) },
    }, { tableName: 'trips', timestamps: true });
    exports.Booking = database_1.sequelize.define('Booking', {
        bookingId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        tripId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
        passengerId: { type: sequelize_1.DataTypes.UUID, allowNull: false },
        seatNumber: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
        qrCodeData: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
        paymentStatus: { type: sequelize_1.DataTypes.ENUM('PENDING', 'CONFIRMED', 'REFUNDED'), defaultValue: 'PENDING' },
        boardingStatus: { type: sequelize_1.DataTypes.ENUM('NOT_BOARDED', 'BOARDED', 'DROPPED_OFF'), defaultValue: 'NOT_BOARDED' },
    }, { tableName: 'bookings', timestamps: true, indexes: [{ unique: true, fields: ['tripId', 'seatNumber'], name: 'unique_trip_seat' }] });
    exports.EmergencyReport = database_1.sequelize.define('EmergencyReport', {
        reportId: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
        tripId: { type: sequelize_1.DataTypes.UUID },
        driverId: { type: sequelize_1.DataTypes.UUID },
        emergencyType: { type: sequelize_1.DataTypes.ENUM('BREAKDOWN', 'ACCIDENT', 'SEVERE_DELAY'), allowNull: false },
        description: { type: sequelize_1.DataTypes.TEXT },
        location: { type: sequelize_1.DataTypes.STRING(200) },
    }, { tableName: 'emergency_reports', timestamps: true });
    // Setup associations
    exports.User.hasMany(exports.BusCompany, { foreignKey: 'operatorId', as: 'busCompanies' });
    exports.BusCompany.belongsTo(exports.User, { foreignKey: 'operatorId', as: 'operator' });
    exports.BusCompany.hasMany(exports.Bus, { foreignKey: 'companyId', as: 'buses' });
    exports.Bus.belongsTo(exports.BusCompany, { foreignKey: 'companyId', as: 'company' });
    exports.BusCompany.hasMany(exports.Route, { foreignKey: 'companyId', as: 'routes' });
    exports.Route.belongsTo(exports.BusCompany, { foreignKey: 'companyId', as: 'company' });
    exports.Bus.hasMany(exports.Trip, { foreignKey: 'busId', as: 'trips' });
    exports.Trip.belongsTo(exports.Bus, { foreignKey: 'busId', as: 'bus' });
    exports.Route.hasMany(exports.Trip, { foreignKey: 'routeId', as: 'trips' });
    exports.Trip.belongsTo(exports.Route, { foreignKey: 'routeId', as: 'route' });
    exports.User.hasMany(exports.Trip, { foreignKey: 'driverId', as: 'trips' });
    exports.Trip.belongsTo(exports.User, { foreignKey: 'driverId', as: 'driver' });
    exports.Trip.hasMany(exports.Booking, { foreignKey: 'tripId', as: 'bookings' });
    exports.Booking.belongsTo(exports.Trip, { foreignKey: 'tripId', as: 'trip' });
    exports.User.hasMany(exports.Booking, { foreignKey: 'passengerId', as: 'bookings' });
    exports.Booking.belongsTo(exports.User, { foreignKey: 'passengerId', as: 'passenger' });
    exports.Trip.hasMany(exports.EmergencyReport, { foreignKey: 'tripId', as: 'emergencyReports' });
    exports.EmergencyReport.belongsTo(exports.Trip, { foreignKey: 'tripId', as: 'trip' });
    exports.User.hasMany(exports.EmergencyReport, { foreignKey: 'driverId', as: 'emergencyReports' });
    exports.EmergencyReport.belongsTo(exports.User, { foreignKey: 'driverId', as: 'driver' });
    // Commission settings (singleton row for platform config)
    exports.CommissionSettings = database_1.sequelize.define('CommissionSettings', {
        id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        commissionRate: { type: sequelize_1.DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.10 },
        platformName: { type: sequelize_1.DataTypes.STRING(100), defaultValue: 'ZamBus' },
        currency: { type: sequelize_1.DataTypes.STRING(10), defaultValue: 'ZMW' },
        seatLockDurationMinutes: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 10 },
    }, { tableName: 'commission_settings', timestamps: true });
    console.log('All models initialized and associations set up');
}
//# sourceMappingURL=index.js.map