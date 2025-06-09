// Production entry point for Plesk deployment
require("dotenv").config();

// Import the compiled server
const { server } = require("./dist/server");

// Export for Plesk compatibility
module.exports = server;
