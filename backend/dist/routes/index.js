"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const route_routes_1 = __importDefault(require("./route.routes"));
const bus_routes_1 = __importDefault(require("./bus.routes"));
const trip_routes_1 = __importDefault(require("./trip.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const boarding_routes_1 = __importDefault(require("./boarding.routes"));
const emergency_routes_1 = __importDefault(require("./emergency.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const export_routes_1 = __importDefault(require("./export.routes"));
const operator_routes_1 = __importDefault(require("./operator.routes"));
const router = (0, express_1.Router)();
// API routes
router.use('/auth', auth_routes_1.default);
router.use('/operators', operator_routes_1.default);
router.use('/routes', route_routes_1.default);
router.use('/buses', bus_routes_1.default);
router.use('/trips', trip_routes_1.default);
router.use('/bookings', booking_routes_1.default);
router.use('/boarding', boarding_routes_1.default);
router.use('/emergency', emergency_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/exports', export_routes_1.default);
// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map