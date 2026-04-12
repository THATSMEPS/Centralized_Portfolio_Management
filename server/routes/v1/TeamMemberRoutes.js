const express = require("express");
const fs = require("fs");
const controller = require("../../controllers/v1/TeamMemberController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { createSecureImageUpload } = require("../../middlewares/secureUpload");

const router = express.Router();

const uploadFolder = "uploads/teamMembers";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const avatarUpload = createSecureImageUpload({
  destination: uploadFolder,
  fieldName: "avatar",
  maxSize: 5 * 1024 * 1024,
  compress: true,
  quality: 85,
});

// Public
router.get("/team-members", controller.getAll);
router.get("/team-members/:id", controller.getById);

// Admin
router.post("/team-members", authMiddleware(["ADMIN"]), avatarUpload, controller.create);
router.put("/team-members/:id", authMiddleware(["ADMIN"]), avatarUpload, controller.update);
router.delete("/team-members/:id", authMiddleware(["ADMIN"]), controller.remove);
router.post("/team-members/reorder", authMiddleware(["ADMIN"]), controller.reorder);

module.exports = router;
