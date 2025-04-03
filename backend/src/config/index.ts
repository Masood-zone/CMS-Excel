import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
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
  mailer: {
    // Add your mailer configuration here
  },
};
