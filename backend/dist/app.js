"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const models_1 = require("./models");
const routes_1 = __importDefault(require("./routes"));
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging in development
if (config_1.config.nodeEnv === 'development') {
    app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}
// API routes
app.use('/api', routes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: config_1.config.app.name,
        version: '1.0.0',
        status: 'running',
    });
});
// Error handling
app.use(middleware_1.errorHandler);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
async function startServer() {
    try {
        // Connect to database
        await database_1.sequelize.authenticate();
        console.log('Database connected successfully');
        // Initialize models
        await (0, models_1.initModels)();
        console.log('Models initialized');
        // Auto-sync database tables (development only)
        await database_1.sequelize.sync({ alter: true });
        console.log('Database tables synchronized');
        // Start server
        app.listen(config_1.config.port, () => {
            console.log(`${config_1.config.app.name} server running on port ${config_1.config.port}`);
            console.log(`Environment: ${config_1.config.nodeEnv}`);
            console.log(`API available at: http://localhost:${config_1.config.port}/api`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Start server if run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=app.js.map