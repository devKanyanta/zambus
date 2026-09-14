"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrCodeData = generateQrCodeData;
exports.generateQrCodeImage = generateQrCodeImage;
exports.parseQrCodeData = parseQrCodeData;
const qrcode_1 = __importDefault(require("qrcode"));
async function generateQrCodeData(ticket) {
    return JSON.stringify(ticket);
}
async function generateQrCodeImage(data) {
    return qrcode_1.default.toDataURL(data, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });
}
function parseQrCodeData(qrData) {
    try {
        return JSON.parse(qrData);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=qr.service.js.map