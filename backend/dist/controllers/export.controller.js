"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportController = void 0;
const export_service_1 = require("../services/export.service");
exports.exportController = {
    async downloadPdf(req, res) {
        try {
            const { tripId } = req.params;
            await (0, export_service_1.exportManifestPdf)(tripId, res);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ success: false, message: error.message });
            }
            else {
                res.status(500).json({ success: false, message: error.message });
            }
        }
    },
    async downloadExcel(req, res) {
        try {
            const { tripId } = req.params;
            await (0, export_service_1.exportManifestExcel)(tripId, res);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                res.status(404).json({ success: false, message: error.message });
            }
            else {
                res.status(500).json({ success: false, message: error.message });
            }
        }
    },
};
//# sourceMappingURL=export.controller.js.map