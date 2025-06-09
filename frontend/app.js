// Simple entry point for Plesk Node.js
// This file serves as the main entry point that Plesk expects

console.log("🚀 Starting Canteen Management Frontend Application...");

// Import and start the main server
import("./server.js").catch((error) => {
  console.error("❌ Failed to start server:", error);

  // Fallback: try to serve static files directly
  console.log("🔄 Attempting fallback static file server...");

  import("express")
    .then(({ default: express }) => {
      import("path").then(({ default: path }) => {
        import("url").then(({ fileURLToPath }) => {
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);

          const app = express();
          const PORT = process.env.PORT || 3000;

          // Simple static file serving
          app.use(express.static(__dirname));

          app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "index.html"));
          });

          app.listen(PORT, () => {
            console.log(`🆘 Fallback server running on port ${PORT}`);
          });
        });
      });
    })
    .catch((fallbackError) => {
      console.error("❌ Fallback server also failed:", fallbackError);
      process.exit(1);
    });
});
