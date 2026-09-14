"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const trip_controller_1 = require("../controllers/trip.controller");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Public route - search trips
router.get('/', controllers_1.tripController.searchPublic.bind(controllers_1.tripController));
// Driver list for trip assignment (before /:id so 'drivers' is not parsed as an id)
router.get('/drivers', trip_controller_1.getDrivers);
// Protected routes
router.get('/search', auth_1.authenticate, (0, validation_1.validateQuery)(schemas_1.searchTripsSchema), controllers_1.tripController.searchPublic.bind(controllers_1.tripController));
router.get('/:id', auth_1.authenticate, (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), controllers_1.tripController.getById.bind(controllers_1.tripController));
router.get('/:id/seats', auth_1.authenticate, (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), trip_controller_1.getTripSeats);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validate)(schemas_1.createTripSchema), controllers_1.tripController.create.bind(controllers_1.tripController));
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validate)(schemas_1.updateTripSchema), controllers_1.tripController.update.bind(controllers_1.tripController));
// Trip actions (master overrides)
router.post('/:id/open', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), controllers_1.tripController.openTrip.bind(controllers_1.tripController));
router.post('/:id/close', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), controllers_1.tripController.closeTrip.bind(controllers_1.tripController));
router.post('/:id/delay', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validate)(schemas_1.tripActionSchema), controllers_1.tripController.delayTrip.bind(controllers_1.tripController));
router.post('/:id/cancel', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), controllers_1.tripController.cancelTrip.bind(controllers_1.tripController));
// Manifest endpoint
router.get('/:id/manifest', auth_1.authenticate, (0, auth_1.authorize)('DRIVER', 'OPERATOR', 'ADMIN'), controllers_1.tripController.getManifest.bind(controllers_1.tripController));
exports.default = router;
//# sourceMappingURL=trip.routes.js.map