const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

dotenv.config();

const { securityHeaders, additionalSecurityHeaders, getCorsConfig, sanitizeErrors } = require("./middlewares/securityHeaders.js");
const { generalRateLimiter } = require("./middlewares/rateLimiter.js");
const { setupSwagger } = require("./config/swagger.js");
const { securityFeatures } = require("./config/security.config.js");

const app = express();
const PORT = process.env.PORT || 7005;

// Security middleware
if (securityFeatures.securityHeaders) {
  app.use(securityHeaders);
  app.use(additionalSecurityHeaders);
}

// CORS
const corsOptions = getCorsConfig(process.env.ALLOWED_ORIGINS?.split(",") || []);
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(morgan("dev"));

// MongoDB NoSQL injection protection
if (securityFeatures.mongoSanitization) {
  app.use(mongoSanitize());
}

// HTTP Parameter Pollution protection
if (securityFeatures.hppProtection) {
  app.use(hpp());
}

// Rate limiting
if (securityFeatures.rateLimiting) {
  app.use("/api/", generalRateLimiter);
}

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger docs
if (securityFeatures.swaggerDocs) {
  setupSwagger(app);
}

// Auto-load all route files from routes/v1/
const routesDir = path.join(__dirname, "routes", "v1");
if (fs.existsSync(routesDir)) {
  fs.readdirSync(routesDir)
    .filter((file) => file.endsWith("Routes.js"))
    .forEach((file) => {
      const route = require(path.join(routesDir, file));
      app.use("/api/v1", route);
      console.log(`  Loaded route: ${file}`);
    });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ isOk: true, message: "Portfolio API is healthy", timestamp: new Date() });
});

app.get("/api", (req, res) => {
  res.json({ isOk: true, message: "Portfolio API is running" });
});

// Error handler
app.use(sanitizeErrors);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const dbUri = process.env.DATABASE;
    if (!dbUri) {
      console.error("DATABASE environment variable is not set");
      process.exit(1);
    }

    await mongoose.connect(dbUri);
    console.log("MongoDB connected");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false, () => {
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
