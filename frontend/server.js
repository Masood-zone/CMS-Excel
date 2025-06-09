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

// Security middleware with adjusted CSP for module scripts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          process.env.VITE_API_BASE_URL ||
            "https://canteenapi.gerizimheights.org",
        ],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:5173",
      "https://canteen.gerizimheights.org",
    ],
    credentials: true,
  })
);

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith(".js")) {
    res.type("application/javascript");
  } else if (req.path.endsWith(".mjs")) {
    res.type("application/javascript");
  } else if (req.path.endsWith(".webmanifest")) {
    res.type("application/manifest+json");
  }
  next();
});

// Serve static files from the dist directory
app.use(
  express.static(path.join(__dirname, "dist"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
      } else if (path.endsWith(".webmanifest")) {
        res.setHeader(
          "Content-Type",
          "application/manifest+json; charset=UTF-8"
        );
      }
    },
  })
);

// Ensure site.webmanifest is valid JSON
const manifestPath = path.join(__dirname, "dist", "site.webmanifest");
if (fs.existsSync(manifestPath)) {
  try {
    const manifestContent = fs.readFileSync(manifestPath, "utf8");
    JSON.parse(manifestContent); // Validate JSON
    console.log("✅ site.webmanifest is valid JSON");
  } catch (error) {
    console.error("❌ site.webmanifest contains invalid JSON:", error.message);
    // Fix the manifest file with a basic valid structure
    const basicManifest = {
      name: "Canteen Management System",
      short_name: "Canteen CMS",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
    };
    fs.writeFileSync(manifestPath, JSON.stringify(basicManifest, null, 2));
    console.log(
      "✅ site.webmanifest has been fixed with a basic valid structure"
    );
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Serve React app for all other routes (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Canteen Management Frontend Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 API Base URL: ${process.env.VITE_API_BASE_URL || "Not configured"}`
  );
});
