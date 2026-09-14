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
exports.releaseExpiredSeatLocks = releaseExpiredSeatLocks;
exports.getSeatLockDuration = getSeatLockDuration;
const sequelize_1 = require("sequelize");
/**
 * Seat Lock Expiration Service
 *
 * PENDING bookings lock a seat for a configurable duration (default: 10 minutes).
 * This service releases seats whose PENDING bookings have exceeded the TTL,
 * preventing indefinite seat locks when passengers abandon the checkout flow.
 *
 * The check runs on-demand (called before seat availability queries) and
 * optionally on a timer for proactive cleanup.
 */
const DEFAULT_LOCK_MINUTES = 10;
/**
 * Release PENDING bookings that have exceeded the seat lock duration.
 * Returns the number of bookings released.
 */
async function releaseExpiredSeatLocks() {
    const { Booking, CommissionSettings } = await Promise.resolve().then(() => __importStar(require('../models')));
    // Read configured lock duration (fallback to default)
    let lockMinutes = DEFAULT_LOCK_MINUTES;
    try {
        const settings = await CommissionSettings.findOne();
        if (settings && settings.seatLockDurationMinutes) {
            lockMinutes = settings.seatLockDurationMinutes;
        }
    }
    catch {
        // Settings table may not exist yet — use default
    }
    const cutoff = new Date(Date.now() - lockMinutes * 60 * 1000);
    const expired = await Booking.findAll({
        where: {
            paymentStatus: 'PENDING',
            createdAt: { [sequelize_1.Op.lt]: cutoff },
        },
    });
    if (expired.length === 0)
        return 0;
    // Delete expired PENDING bookings to free seats
    const deleted = await Booking.destroy({
        where: {
            paymentStatus: 'PENDING',
            createdAt: { [sequelize_1.Op.lt]: cutoff },
        },
    });
    console.log(`[SeatLock] Released ${deleted} expired PENDING bookings (lock TTL: ${lockMinutes}m)`);
    return deleted;
}
/**
 * Get the current seat lock duration in minutes.
 */
async function getSeatLockDuration() {
    const { CommissionSettings } = await Promise.resolve().then(() => __importStar(require('../models')));
    try {
        const settings = await CommissionSettings.findOne();
        if (settings && settings.seatLockDurationMinutes) {
            return settings.seatLockDurationMinutes;
        }
    }
    catch {
        // fallback
    }
    return DEFAULT_LOCK_MINUTES;
}
//# sourceMappingURL=seat-lock.service.js.map