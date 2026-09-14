"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusCompany = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const User_1 = require("./User");
class BusCompany extends sequelize_1.Model {
}
exports.BusCompany = BusCompany;
BusCompany.init({
    companyId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    operatorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId',
        },
    },
    companyName: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: false,
    },
    registrationNumber: {
        type: sequelize_1.DataTypes.STRING(50),
    },
    contactEmail: {
        type: sequelize_1.DataTypes.STRING(100),
    },
    contactPhone: {
        type: sequelize_1.DataTypes.STRING(15),
    },
    isApproved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'BusCompany',
    tableName: 'bus_companies',
    timestamps: true,
    underscored: true,
});
User_1.User.hasMany(BusCompany, { foreignKey: 'operatorId', as: 'busCompanies' });
BusCompany.belongsTo(User_1.User, { foreignKey: 'operatorId', as: 'operator' });
//# sourceMappingURL=BusCompany.js.map