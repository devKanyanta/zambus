"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.connectDatabase = connectDatabase;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
exports.sequelize = new sequelize_1.Sequelize(index_1.config.database.url, {
    dialect: 'postgres',
    logging: index_1.config.nodeEnv === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
async function connectDatabase() {
    try {
        await exports.sequelize.authenticate();
        console.log('Database connection established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}
//# sourceMappingURL=database.js.map