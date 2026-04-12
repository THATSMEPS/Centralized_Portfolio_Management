const express = require("express");
const controller = require("../../controllers/v1/SiteSettingsController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Public
router.get("/site-settings", controller.getSiteSettings);

// Admin
router.get("/site-settings/admin", authMiddleware(["ADMIN", "EMPLOYEE"]), controller.getSiteSettingsAdmin);
router.put("/site-settings", authMiddleware(["ADMIN"]), controller.updateSiteSettings);

module.exports = router;
