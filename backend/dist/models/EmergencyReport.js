"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyReport = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class EmergencyReport extends sequelize_1.Model {
}
exports.EmergencyReport = EmergencyReport;
EmergencyReport.init({
    reportId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    tripId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'trips',
            key: 'tripId',
        },
    },
    driverId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: 'users',
            key: 'userId',
        },
    },
    emergencyType: {
        type: sequelize_1.DataTypes.ENUM('BREAKDOWN', 'ACCIDENT', 'SEVERE_DELAY'),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
    location: {
        type: sequelize_1.DataTypes.STRING(200),
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'EmergencyReport',
    tableName: 'emergency_reports',
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=EmergencyReport.js.map