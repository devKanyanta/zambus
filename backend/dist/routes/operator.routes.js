"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const models_1 = require("../models");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const validation_1 = require("../middleware/validation");
const registerCompanySchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2).max(150),
    registrationNumber: zod_1.z.string().max(50).optional(),
    contactEmail: zod_1.z.string().email().optional(),
    contactPhone: zod_1.z.string().max(15).optional(),
});
const router = (0, express_1.Router)();
/**
 * POST /api/operators/register-company
 * Allows an OPERATOR user to register their bus company.
 * The company starts as unapproved until an admin approves it.
 */
router.post('/register-company', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR'), (0, validation_1.validate)(registerCompanySchema), async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        if (!operatorId) {
            (0, response_1.errorResponse)(res, 401, 'Not authenticated');
            return;
        }
        const { companyName, registrationNumber, contactEmail, contactPhone } = req.body;
        // Check if operator already has a company
        const existingCompany = await models_1.BusCompany.findOne({ where: { operatorId } });
        if (existingCompany) {
            (0, response_1.errorResponse)(res, 400, 'You already have a registered bus company. Only one company per operator is allowed.');
            return;
        }
        const company = await models_1.BusCompany.create({
            operatorId,
            companyName,
            registrationNumber,
            contactEmail,
            contactPhone,
            isApproved: false,
        });
        (0, response_1.successResponse)(res, 201, {
            companyId: company.companyId,
            companyName: company.companyName,
            registrationNumber: company.registrationNumber,
            contactEmail: company.contactEmail,
            contactPhone: company.contactPhone,
            isApproved: company.isApproved,
            createdAt: company.createdAt,
        }, 'Company registered. Awaiting admin approval.');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, 500, error.message);
    }
});
/**
 * GET /api/operators/my-company
 * Returns the operator's own bus company details.
 */
router.get('/my-company', auth_1.authenticate, (0, auth_1.authorize)('OPERATOR'), async (req, res) => {
    try {
        const operatorId = req.user?.userId;
        const company = await models_1.BusCompany.findOne({ where: { operatorId } });
        if (!company) {
            (0, response_1.successResponse)(res, 200, null, 'No company registered yet');
            return;
        }
        (0, response_1.successResponse)(res, 200, company);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, 500, error.message);
    }
});
exports.default = router;
//# sourceMappingURL=operator.routes.js.map