"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All booking routes require authentication
router.post('/', auth_1.authenticate, (0, validation_1.validate)(schemas_1.createBookingSchema), controllers_1.bookingController.create.bind(controllers_1.bookingController));
router.get('/my', auth_1.authenticate, controllers_1.bookingController.getMyBookings.bind(controllers_1.bookingController));
router.get('/:id', auth_1.authenticate, (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), controllers_1.bookingController.getById.bind(controllers_1.bookingController));
router.post('/:id/confirm', auth_1.authenticate, (0, validation_1.validate)(schemas_1.confirmBookingSchema), controllers_1.bookingController.confirm.bind(controllers_1.bookingController));
router.post('/:id/cancel', auth_1.authenticate, (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), controllers_1.bookingController.cancel.bind(controllers_1.bookingController));
exports.default = router;
//# sourceMappingURL=booking.routes.js.map