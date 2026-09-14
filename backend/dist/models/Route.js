"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const BusCompany_1 = require("./BusCompany");
class Route extends sequelize_1.Model {
}
exports.Route = Route;
Route.init({
    routeId: {
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
    routeName: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
    },
    origin: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    destination: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    intermediateStops: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
        defaultValue: [],
    },
    estimatedTravelTime: {
        type: sequelize_1.DataTypes.INTEGER,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Route',
    tableName: 'routes',
    timestamps: true,
    underscored: true,
});
BusCompany_1.BusCompany.hasMany(Route, { foreignKey: 'companyId', as: 'routes' });
Route.belongsTo(BusCompany_1.BusCompany, { foreignKey: 'companyId', as: 'company' });
//# sourceMappingURL=Route.js.map