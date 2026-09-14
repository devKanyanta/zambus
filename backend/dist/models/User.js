"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
class User extends sequelize_1.Model {
    async setPassword(password) {
        const salt = await bcrypt_1.default.genSalt(10);
        this.passwordHash = await bcrypt_1.default.hash(password, salt);
    }
    async validatePassword(password) {
        return bcrypt_1.default.compare(password, this.passwordHash);
    }
}
exports.User = User;
User.init({
    userId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING(15),
        unique: true,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    passwordHash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('PASSENGER', 'DRIVER', 'OPERATOR', 'ADMIN'),
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
});
//# sourceMappingURL=User.js.map