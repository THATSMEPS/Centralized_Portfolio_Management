const express = require("express");
const controller = require("../../controllers/v1/EnquiryController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Public (rate-limited at app level)
router.post("/enquiries", controller.submit);

// Admin
router.get("/enquiries", authMiddleware(["ADMIN", "EMPLOYEE"]), controller.getAll);
router.get("/enquiries/stats", authMiddleware(["ADMIN", "EMPLOYEE"]), controller.getStats);
router.get("/enquiries/:id", authMiddleware(["ADMIN", "EMPLOYEE"]), controller.getById);
router.put("/enquiries/:id", authMiddleware(["ADMIN"]), controller.updateStatus);
router.delete("/enquiries/:id", authMiddleware(["ADMIN"]), controller.remove);

module.exports = router;
