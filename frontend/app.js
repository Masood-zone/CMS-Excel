// Plesk-compatible entry point for serving the built React application
// This file serves as the main entry point for Plesk Node.js deployment

console.log("🚀 Starting Canteen Management System Frontend...");

// Set default environment variables
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = process.env.PORT || 3000;

// Check if we're in a static-only deployment or hybrid deployment
const fs = await import("fs");
const path = await import("path");
const { fileURLToPath } = await import("url");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if server.js exists for hybrid deployment
const serverPath = path.join(__dirname, "server.js");
const indexPath = path.join(__dirname, "index.html");

if (fs.existsSync(serverPath)) {
  console.log("📡 Hybrid deployment detected - starting Express server...");

  try {
    // Import and start the Express server
    await import("./server.js");
  } catch (error) {
    console.error("❌ Failed to start Express server:", error);
    console.log("🔄 Falling back to static file serving...");

    // Fallback: serve static files directly
    serveStaticFiles();
  }
} else if (fs.existsSync(indexPath)) {
  console.log("📄 Static deployment detected - serving files directly...");
  serveStaticFiles();
} else {
  console.error(
    "❌ No valid deployment found - neither server.js nor index.html exists"
  );
  process.exit(1);
}

function serveStaticFiles() {
  // This is a fallback for pure static deployment
  // In most cases, Apache will handle static files directly
  console.log("ℹ️ Static files should be served by Apache/Nginx");
  console.log("✅ Application structure verified");
}

// Handle process signals
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught exception:", err);
  // Don't exit in production to maintain availability
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚫 Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit in production to maintain availability
});

console.log(
  `✅ Canteen Management System initialized in ${process.env.NODE_ENV} mode`
);
