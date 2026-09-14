"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// All admin routes require admin role
router.get('/companies/pending', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), controllers_1.adminController.getPendingCompanies.bind(controllers_1.adminController));
router.post('/companies/:id/approve', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), controllers_1.adminController.approveCompany.bind(controllers_1.adminController));
router.post('/companies/:id/reject', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validation_1.validateParams)(zod_1.z.object({ id: zod_1.z.string().uuid() })), controllers_1.adminController.rejectCompany.bind(controllers_1.adminController));
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), controllers_1.adminController.getAllUsers.bind(controllers_1.adminController));
router.put('/users/:id/role', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validation_1.validate)(schemas_1.updateUserRoleSchema), controllers_1.adminController.updateUserRole.bind(controllers_1.adminController));
router.get('/analytics', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), controllers_1.adminController.getAnalytics.bind(controllers_1.adminController));
router.put('/settings/commission', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validation_1.validate)(schemas_1.updateCommissionSchema), controllers_1.adminController.updateCommission.bind(controllers_1.adminController));
// Platform settings
router.get('/settings', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), controllers_1.adminController.getSettings.bind(controllers_1.adminController));
router.put('/settings', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), controllers_1.adminController.updateSettings.bind(controllers_1.adminController));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map