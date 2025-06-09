import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log("🖥️ Initializing Express server for built React application...");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: [
          "'self'",
          process.env.VITE_API_BASE_URL ||
            "https://canteenapi.gerizimheights.org",
          "https://canteenapi.gerizimheights.org",
        ],
        manifestSrc: ["'self'"],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// CORS middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "https://canteen.gerizimheights.org",
      "https://canteen.gerizimheights.org",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Set proper MIME types middleware
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();

  switch (ext) {
    case ".js":
    case ".mjs":
      res.type("application/javascript");
      break;
    case ".css":
      res.type("text/css");
      break;
    case ".webmanifest":
      res.type("application/manifest+json");
      break;
    case ".json":
      res.type("application/json");
      break;
    case ".svg":
      res.type("image/svg+xml");
      break;
    case ".webp":
      res.type("image/webp");
      break;
  }
  next();
});

// Serve static files from the current directory (which contains the built app)
app.use(
  express.static(__dirname, {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    index: ["index.html"],
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      // Set proper headers for different file types
      switch (ext) {
        case ".js":
        case ".mjs":
          res.setHeader(
            "Content-Type",
            "application/javascript; charset=UTF-8"
          );
          break;
        case ".css":
          res.setHeader("Content-Type", "text/css; charset=UTF-8");
          break;
        case ".webmanifest":
          res.setHeader(
            "Content-Type",
            "application/manifest+json; charset=UTF-8"
          );
          break;
        case ".json":
          res.setHeader("Content-Type", "application/json; charset=UTF-8");
          break;
        case ".html":
          res.setHeader("Content-Type", "text/html; charset=UTF-8");
          // Don't cache HTML files
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          break;
      }
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  const indexExists = fs.existsSync(path.join(__dirname, "index.html"));
  const assetsExist = fs.existsSync(path.join(__dirname, "assets"));

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    deployment: {
      indexHtml: indexExists,
      assetsDirectory: assetsExist,
      staticFiles: "served from root directory",
    },
  });
});

// API status endpoint (for debugging)
app.get("/api-status", (req, res) => {
  res.json({
    apiBaseUrl: process.env.VITE_API_BASE_URL || "Not configured",
    corsOrigin: process.env.CORS_ORIGIN || "Not configured",
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

// Serve React app for all other routes (SPA routing)
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: "Application not found",
      message: "index.html is missing from the deployment",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Graceful shutdown handlers
const gracefulShutdown = () => {
  console.log("🛑 Shutting down gracefully...");
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Canteen Management Frontend Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 API Base URL: ${process.env.VITE_API_BASE_URL || "Not configured"}`
  );
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
