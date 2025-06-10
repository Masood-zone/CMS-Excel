import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3400,
  },
  cors: {
    // Allow all origins in production
    origin: process.env.CORS_ORIGIN || "*",
    optionsSuccessStatus: 200,
  },
  jwt: {
    secret: process.env.TOKEN_SECRET || "default_secret_change_in_production",
    expiresIn: "2d",
  },
  mailer: {
    // Add your mailer configuration here
  },
};
