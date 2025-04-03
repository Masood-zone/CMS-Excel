"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCronJobs = void 0;
const daily_records_cron_1 = require("./daily-records.cron");
const setupCronJobs = () => {
    (0, daily_records_cron_1.setupDailyRecordCreation)();
};
exports.setupCronJobs = setupCronJobs;
//# sourceMappingURL=index.js.map