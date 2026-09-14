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
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUserById = getUserById;
exports.updateUserProfile = updateUserProfile;
exports.createBusCompanyIfNotExists = createBusCompanyIfNotExists;
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
async function registerUser(input) {
    const { User, BusCompany } = await Promise.resolve().then(() => __importStar(require('../models')));
    const { Op } = await Promise.resolve().then(() => __importStar(require('sequelize')));
    const { fullName, email, phoneNumber, password, role = 'PASSENGER' } = input;
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { phoneNumber }],
        },
    });
    if (existingUser) {
        throw new Error('User with this email or phone already exists');
    }
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await User.create({
        fullName,
        email,
        phoneNumber,
        passwordHash,
        role,
        isActive: true,
    });
    const token = (0, jwt_1.generateToken)({
        userId: user.userId,
        email: user.email,
        role: user.role,
    });
    return { user, token };
}
async function loginUser(input) {
    const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
    const { email, password } = input;
    const user = await User.findOne({
        where: { email, isActive: true },
    });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isValid = await (0, password_1.verifyPassword)(password, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    const token = (0, jwt_1.generateToken)({
        userId: user.userId,
        email: user.email,
        role: user.role,
    });
    return { user, token };
}
async function getUserById(userId) {
    const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
    return User.findByPk(userId);
}
async function updateUserProfile(userId, updates) {
    const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
    const { Op } = await Promise.resolve().then(() => __importStar(require('sequelize')));
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (updates.fullName) {
        user.fullName = updates.fullName;
    }
    if (updates.phoneNumber) {
        const existingUser = await User.findOne({
            where: { phoneNumber: updates.phoneNumber, userId: { [Op.ne]: userId } },
        });
        if (existingUser) {
            throw new Error('Phone number already in use');
        }
        user.phoneNumber = updates.phoneNumber;
    }
    await user.save();
    return user;
}
async function createBusCompanyIfNotExists(operatorId, companyName) {
    const { BusCompany } = await Promise.resolve().then(() => __importStar(require('../models')));
    const existingCompany = await BusCompany.findOne({
        where: { operatorId },
    });
    if (existingCompany) {
        return existingCompany;
    }
    const company = await BusCompany.create({
        operatorId,
        companyName,
        isApproved: false,
    });
    return company;
}
//# sourceMappingURL=auth.service.js.map