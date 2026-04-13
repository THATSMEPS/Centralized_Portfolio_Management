const express = require("express");
const fs = require("fs");
const controller = require("../../controllers/v1/ProjectController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { createSecureImageUpload } = require("../../middlewares/secureUpload");

const router = express.Router();

const uploadFolder = "uploads/projects";
// Ensure upload directory exists - Wrapped in try-catch for read-only systems (Vercel)
try {
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }
} catch (err) {
  console.warn(`[UPLOAD] Operating in read-only environment. Skipping local folder creation: ${uploadFolder}`);
}

const projectImageUpload = createSecureImageUpload({
  destination: uploadFolder,
  fieldName: "image",
  maxSize: 5 * 1024 * 1024,
  compress: true,
  quality: 85,
});

// Public
router.get("/projects/filters", controller.getFilterTags);
router.get("/projects", controller.getAll);
router.get("/projects/:id", controller.getById);

// Admin
router.post("/projects", authMiddleware(["ADMIN"]), projectImageUpload, controller.create);
router.put("/projects/:id", authMiddleware(["ADMIN"]), projectImageUpload, controller.update);
router.delete("/projects/:id", authMiddleware(["ADMIN"]), controller.remove);

module.exports = router;
