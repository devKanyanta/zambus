"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBusModel = createBusModel;
const sequelize_1 = require("sequelize");
function createBusModel(sequelize) {
    class Bus extends sequelize_1.Model {
    }
    Bus.init({
        busId: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'bus_companies',
                key: 'companyId',
            },
        },
        registrationNumber: {
            type: sequelize_1.DataTypes.STRING(20),
            unique: true,
            allowNull: false,
        },
        model: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        seatCapacity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        amenities: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
            defaultValue: [],
        },
        maintenanceStatus: {
            type: sequelize_1.DataTypes.ENUM('OPERATIONAL', 'MAINTENANCE', 'OUT_OF_SERVICE'),
            defaultValue: 'OPERATIONAL',
        },
    }, {
        sequelize,
        modelName: 'Bus',
        tableName: 'buses',
        timestamps: true,
        underscored: true,
    });
    return Bus;
}
//# sourceMappingURL=Bus.js.map