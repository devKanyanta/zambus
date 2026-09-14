"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const schemas_1 = require("../utils/schemas");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_1.validate)(schemas_1.registerSchema), controllers_1.authController.register.bind(controllers_1.authController));
router.post('/login', (0, validation_1.validate)(schemas_1.loginSchema), controllers_1.authController.login.bind(controllers_1.authController));
// Protected routes
router.get('/me', auth_1.authenticate, controllers_1.authController.me.bind(controllers_1.authController));
router.put('/profile', auth_1.authenticate, (0, validation_1.validate)(schemas_1.updateProfileSchema), controllers_1.authController.updateProfile.bind(controllers_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map