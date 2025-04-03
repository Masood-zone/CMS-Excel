import { app } from "./app";
import { logger } from "./utils/logger";
import { config } from "./config/index";

const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port http://localhost:${PORT}`);
});
