"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.get('/manifest/:tripId/pdf', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validateParams)(zod_1.z.object({ tripId: zod_1.z.string().uuid() })), controllers_1.exportController.downloadPdf.bind(controllers_1.exportController));
router.get('/manifest/:tripId/excel', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validateParams)(zod_1.z.object({ tripId: zod_1.z.string().uuid() })), controllers_1.exportController.downloadExcel.bind(controllers_1.exportController));
exports.default = router;
//# sourceMappingURL=export.routes.js.map