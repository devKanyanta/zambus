import { Router } from 'express';
import { adminController } from '../controllers';
import { validate, validateParams } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { updateUserRoleSchema, updateCommissionSchema } from '../utils/schemas';
import { z } from 'zod';

const router = Router();

// All admin routes require admin role
router.get('/companies/pending', authenticate, authorize('ADMIN'), adminController.getPendingCompanies.bind(adminController));
router.post('/companies/:id/approve', authenticate, authorize('ADMIN'), validateParams(z.object({ id: z.string().uuid() })), adminController.approveCompany.bind(adminController));
router.post('/companies/:id/reject', authenticate, authorize('ADMIN'), validateParams(z.object({ id: z.string().uuid() })), adminController.rejectCompany.bind(adminController));

router.get('/users', authenticate, authorize('ADMIN'), adminController.getAllUsers.bind(adminController));
router.put('/users/:id/role', authenticate, authorize('ADMIN'), validate(updateUserRoleSchema), adminController.updateUserRole.bind(adminController));

router.get('/analytics', authenticate, authorize('ADMIN'), adminController.getAnalytics.bind(adminController));
router.put('/settings/commission', authenticate, authorize('ADMIN'), validate(updateCommissionSchema), adminController.updateCommission.bind(adminController));

// Platform settings
router.get('/settings', authenticate, authorize('ADMIN'), adminController.getSettings.bind(adminController));
router.put('/settings', authenticate, authorize('ADMIN'), adminController.updateSettings.bind(adminController));

export default router;
