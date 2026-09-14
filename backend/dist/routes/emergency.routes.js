"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('DRIVER'), (0, validation_1.validate)(schemas_1.createEmergencySchema), controllers_1.emergencyController.report.bind(controllers_1.emergencyController));
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('DRIVER', 'OPERATOR', 'ADMIN'), controllers_1.emergencyController.getReports.bind(controllers_1.emergencyController));
exports.default = router;
//# sourceMappingURL=emergency.routes.js.map