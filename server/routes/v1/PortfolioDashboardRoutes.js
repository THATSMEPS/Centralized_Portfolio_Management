const express = require("express");
const controller = require("../../controllers/v1/PortfolioDashboardController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.get("/admin/dashboard/analytics", authMiddleware(["ADMIN", "EMPLOYEE"]), controller.getAnalytics);

module.exports = router;
