"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Booking extends sequelize_1.Model {
}
exports.Booking = Booking;
Booking.init({
    bookingId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    tripId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'trips',
            key: 'tripId',
        },
    },
    passengerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId',
        },
    },
    seatNumber: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    qrCodeData: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('PENDING', 'CONFIRMED', 'REFUNDED'),
        defaultValue: 'PENDING',
    },
    boardingStatus: {
        type: sequelize_1.DataTypes.ENUM('NOT_BOARDED', 'BOARDED', 'DROPPED_OFF'),
        defaultValue: 'NOT_BOARDED',
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['tripId', 'seatNumber'],
            name: 'unique_trip_seat',
        },
        {
            fields: ['tripId'],
            name: 'idx_bookings_trip',
        },
        {
            fields: ['passengerId'],
            name: 'idx_bookings_passenger',
        },
    ],
});
//# sourceMappingURL=Booking.js.map