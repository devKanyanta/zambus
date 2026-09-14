"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trip = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Trip extends sequelize_1.Model {
}
exports.Trip = Trip;
Trip.init({
    tripId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    busId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'buses',
            key: 'busId',
        },
    },
    routeId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'routes',
            key: 'routeId',
        },
    },
    driverId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'users',
            key: 'userId',
        },
    },
    departureTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    estimatedArrival: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    fareAmount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'SCHEDULED',
    },
    isRecurring: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    recurrencePattern: {
        type: sequelize_1.DataTypes.STRING(50),
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Trip',
    tableName: 'trips',
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=Trip.js.map