// Mock the database config first to prevent actual DB connection
jest.mock('../src/config', () => ({
  config: {
    nodeEnv: 'test',
    port: 3000,
    jwt: { secret: 'test-secret', expiresIn: '24h' },
    database: { url: 'postgres://localhost:5432/test' },
    app: {
      name: 'ZamBus Test',
      commissionRate: 0.10,
    },
  },
}));

jest.mock('../src/config/database', () => ({
  sequelize: {
    fn: jest.fn((fn: string, col: string) => `${fn}(${col})`),
    col: jest.fn((col: string) => col),
    Op: { notIn: Symbol('notIn'), like: Symbol('like'), lt: Symbol('lt') },
  },
}));

// Mock the database models
jest.mock('../src/models', () => ({
  BusCompany: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {
    count: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  Trip: {
    count: jest.fn(),
  },
  Booking: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
  CommissionSettings: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('Admin Controller', () => {
  const mockReq = (user: any = { userId: 'admin-001', role: 'ADMIN' }) => ({
    user,
    params: {},
    query: {},
    body: {},
  } as any);

  const mockRes = () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnalytics', () => {
    it('should return analytics data for admin', async () => {
      const { adminController } = require('../src/controllers/admin.controller');
      const { User, Trip, Booking, CommissionSettings } = require('../src/models');

      User.count.mockResolvedValue(10);
      Trip.count.mockResolvedValue(5);
      Booking.count.mockResolvedValue(20);
      Booking.findAll.mockResolvedValue([{ totalRevenue: '15000.00' }]);
      CommissionSettings.findOne.mockResolvedValue({ commissionRate: 0.10 });

      const req = mockReq();
      const res = mockRes();

      await adminController.getAnalytics(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.totalUsers).toBe(10);
      expect(response.data.totalActiveTrips).toBe(5);
      expect(response.data.totalBookings).toBe(20);
    });

    it('should reject non-admin users', async () => {
      const { adminController } = require('../src/controllers/admin.controller');

      const req = mockReq({ userId: 'user-001', role: 'PASSENGER' });
      const res = mockRes();

      await adminController.getAnalytics(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
    });
  });

  describe('updateCommission', () => {
    it('should update commission rate for admin', async () => {
      const { adminController } = require('../src/controllers/admin.controller');
      const { CommissionSettings } = require('../src/models');

      CommissionSettings.findOne.mockResolvedValue(null);
      CommissionSettings.create.mockResolvedValue({
        commissionRate: 0.15,
        seatLockDurationMinutes: 10,
      });

      const req = mockReq();
      req.body = { commissionRate: 0.15 };
      const res = mockRes();

      await adminController.updateCommission(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should reject invalid commission rate', async () => {
      const { adminController } = require('../src/controllers/admin.controller');

      const req = mockReq();
      req.body = { commissionRate: 2.0 }; // > 1
      const res = mockRes();

      await adminController.updateCommission(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
    });
  });

  describe('getSettings', () => {
    it('should return platform settings', async () => {
      const { adminController } = require('../src/controllers/admin.controller');
      const { CommissionSettings } = require('../src/models');

      CommissionSettings.findOne.mockResolvedValue({
        commissionRate: 0.10,
        platformName: 'ZamBus',
        currency: 'ZMW',
        seatLockDurationMinutes: 10,
      });

      const req = mockReq();
      const res = mockRes();

      await adminController.getSettings(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data.commissionRate).toBe(0.10);
      expect(response.data.currency).toBe('ZMW');
    });

    it('should create default settings if none exist', async () => {
      const { adminController } = require('../src/controllers/admin.controller');
      const { CommissionSettings } = require('../src/models');

      CommissionSettings.findOne.mockResolvedValue(null);
      CommissionSettings.create.mockResolvedValue({
        commissionRate: 0.10,
        platformName: 'ZamBus',
        currency: 'ZMW',
        seatLockDurationMinutes: 10,
      });

      const req = mockReq();
      const res = mockRes();

      await adminController.getSettings(req, res);

      expect(CommissionSettings.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });
});
