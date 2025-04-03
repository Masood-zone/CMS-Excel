import { setupDailyRecordCreation } from "./daily-records.cron";

export const setupCronJobs = () => {
  setupDailyRecordCreation();
};
