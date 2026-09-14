"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All routes require authentication
router.get('/', auth_1.authenticate, controllers_1.busController.getAll.bind(controllers_1.busController));
router.get('/:id', auth_1.authenticate, (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), controllers_1.busController.getById.bind(controllers_1.busController));
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validate)(schemas_1.createBusSchema), controllers_1.busController.create.bind(controllers_1.busController));
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), (0, validation_1.validate)(schemas_1.updateBusSchema), controllers_1.busController.update.bind(controllers_1.busController));
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR', 'ADMIN'), controllers_1.busController.delete.bind(controllers_1.busController));
exports.default = router;
//# sourceMappingURL=bus.routes.js.map