"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const index_1 = require("./config/index");
const PORT = index_1.config.server.port;
app_1.app.listen(PORT, () => {
    logger_1.logger.info(`Server is running on port http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map