"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    error: (message, ...args) => {
        if (message instanceof Error) {
            console.error(`[ERROR] ${message.message}`, message.stack, ...args);
        }
        else {
            console.error(`[ERROR] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        console.debug(`[DEBUG] ${message}`, ...args);
    },
};
//# sourceMappingURL=logger.js.map