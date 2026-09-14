import express, { Response } from "express";
import { AuthenticatedRequest } from '../middleware/auth';
import { BusCompany, User, Trip, Booking, CommissionSettings } from '../models';
import { sequelize } from '../config/database';
import { config } from '../config';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';
import { Op } from 'sequelize';

export const adminController = {
  async getPendingCompanies(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can view pending companies');
        return;
      }

      const companies = await BusCompany.findAll({
        where: { isApproved: false },
        include: [
          { model: BusCompany.sequelize?.models?.User, as: 'operator', attributes: ['userId', 'fullName', 'email', 'phoneNumber'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      successResponse(res, 200, companies);
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  async approveCompany(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can approve companies');
        return;
      }

      const { id } = req.params as any;

      const company = await BusCompany.findByPk(id);
      if (!company) {
        notFoundResponse(res, 'Company');
        return;
      }

      company.isApproved = true;
      await company.save();

      successResponse(res, 200, company, 'Company approved successfully');
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  async rejectCompany(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can reject companies');
        return;
      }

      const { id } = req.params as any;

      const company = await BusCompany.findByPk(id);
      if (!company) {
        notFoundResponse(res, 'Company');
        return;
      }

      await company.destroy();

      successResponse(res, 200, null, 'Company rejected and removed');
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  async getAllUsers(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can view all users');
        return;
      }

      const { role, page = 1, limit = 50 } = req.query as any;

      const whereClause: any = {};
      if (role) whereClause.role = role;

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string, 10),
        offset: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
      });

      successResponse(res, 200, {
        users: rows.map((u) => ({
          userId: u.userId,
          fullName: u.fullName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
        })),
        total: count,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  async updateUserRole(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can update user roles');
        return;
      }

      const { id } = req.params as any;
      const { role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        notFoundResponse(res, 'User');
        return;
      }

      user.role = role;
      await user.save();

      successResponse(res, 200, user, 'User role updated successfully');
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  async getAnalytics(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      // Admins see platform-wide metrics; operators see the same shape for their
      // revenue dashboard. (Operated-company scoping can be added in Phase 2.)
      const role = req.user?.role;
      if (role !== 'ADMIN' && role !== 'OPERATOR') {
        forbiddenResponse(res, 'Not authorized to view analytics');
        return;
      }

      const totalUsers = await User.count();
      const totalOperators = await User.count({ where: { role: 'OPERATOR' } });
      const totalActiveTrips = await Trip.count({ where: { status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] } } });
      const totalBookings = await Booking.count({ where: { paymentStatus: 'CONFIRMED' } });

      // fareAmount lives on Trip, not Booking - join through the trip association.
      const revenueResult = await Booking.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('trip.fareAmount')), 'totalRevenue']],
        where: { paymentStatus: 'CONFIRMED' },
        include: [
          {
            model: (await import('../models')).Trip,
            as: 'trip',
            attributes: [],
            required: true,
          },
        ],
        raw: true,
      });

      const totalRevenueNum =
        revenueResult.length > 0 && revenueResult[0]
          ? Number((revenueResult[0] as any).totalRevenue) || 0
          : 0;

      // Read commission rate from DB (persisted), fallback to config
      let commissionRate = config.app.commissionRate;
      try {
        const settings = await CommissionSettings.findOne();
        if (settings) commissionRate = Number(settings.commissionRate);
      } catch { /* table may not exist yet */ }

      const commissionAmount = totalRevenueNum * commissionRate;

      successResponse(res, 200, {
        totalUsers,
        totalOperators,
        totalActiveTrips,
        totalBookings,
        totalRevenue: totalRevenueNum,
        commissionRate,
        commissionAmount,
        netPayout: totalRevenueNum - commissionAmount,
      });
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  async updateCommission(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can update commission rate');
        return;
      }

      const { commissionRate } = req.body as any;

      if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 1) {
        errorResponse(res, 400, 'Commission rate must be a number between 0 and 1');
        return;
      }

      // Persist to database
      let settings = await CommissionSettings.findOne();
      if (settings) {
        settings.commissionRate = commissionRate;
        await settings.save();
      } else {
        settings = await CommissionSettings.create({ commissionRate });
      }

      // Also update in-memory config as fallback
      config.app.commissionRate = commissionRate;

      successResponse(res, 200, {
        commissionRate: Number(settings.commissionRate),
        seatLockDurationMinutes: settings.seatLockDurationMinutes,
      }, 'Commission rate updated');
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  /**
   * GET /api/admin/settings
   * Returns all platform settings (admin only).
   */
  async getSettings(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can view settings');
        return;
      }

      let settings = await CommissionSettings.findOne();
      if (!settings) {
        settings = await CommissionSettings.create({
          commissionRate: config.app.commissionRate,
        });
      }

      successResponse(res, 200, {
        commissionRate: Number(settings.commissionRate),
        platformName: settings.platformName,
        currency: settings.currency,
        seatLockDurationMinutes: settings.seatLockDurationMinutes,
      });
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },

  /**
   * PUT /api/admin/settings
   * Update platform settings (admin only).
   */
  async updateSettings(req: AuthenticatedRequest, res: any): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        forbiddenResponse(res, 'Only admins can update settings');
        return;
      }

      const { commissionRate, platformName, currency, seatLockDurationMinutes } = req.body as any;

      let settings = await CommissionSettings.findOne();
      if (!settings) {
        settings = await CommissionSettings.create({
          commissionRate: config.app.commissionRate,
        });
      }

      if (commissionRate !== undefined) settings.commissionRate = commissionRate;
      if (platformName !== undefined) settings.platformName = platformName;
      if (currency !== undefined) settings.currency = currency;
      if (seatLockDurationMinutes !== undefined) settings.seatLockDurationMinutes = seatLockDurationMinutes;

      await settings.save();

      // Sync in-memory config
      config.app.commissionRate = Number(settings.commissionRate);

      successResponse(res, 200, {
        commissionRate: Number(settings.commissionRate),
        platformName: settings.platformName,
        currency: settings.currency,
        seatLockDurationMinutes: settings.seatLockDurationMinutes,
      }, 'Settings updated');
    } catch (error: any) {
      errorResponse(res, 500, error.message);
    }
  },
};
