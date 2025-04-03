"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    server: {
        port: process.env.PORT || 3400,
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        optionsSuccessStatus: 200,
    },
    jwt: {
        secret: process.env.TOKEN_SECRET || "default_secret_change_in_production",
        expiresIn: "2d",
    },
    mailer: {},
};
//# sourceMappingURL=index.js.map