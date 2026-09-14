"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const router = (0, express_1.Router)();
// All boarding routes require authentication
router.post('/scan', auth_1.authenticate, (0, auth_1.authorize)('DRIVER'), (0, validation_1.validate)(schemas_1.scanTicketSchema), controllers_1.boardingController.scan.bind(controllers_1.boardingController));
router.post('/board', auth_1.authenticate, (0, auth_1.authorize)('DRIVER'), (0, validation_1.validate)(schemas_1.markBoardedSchema), controllers_1.boardingController.markBoarded.bind(controllers_1.boardingController));
router.post('/dropoff', auth_1.authenticate, (0, auth_1.authorize)('DRIVER'), (0, validation_1.validate)(schemas_1.markBoardedSchema), controllers_1.boardingController.markDroppedOff.bind(controllers_1.boardingController));
router.get('/manifest', auth_1.authenticate, (0, auth_1.authorize)('DRIVER', 'OPERATOR', 'ADMIN'), controllers_1.boardingController.getManifest.bind(controllers_1.boardingController));
exports.default = router;
//# sourceMappingURL=boarding.routes.js.map