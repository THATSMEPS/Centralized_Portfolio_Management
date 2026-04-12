const express = require("express");
const controller = require("../../controllers/v1/ServiceController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Public
router.get("/services", controller.getAll);
router.get("/services/:id", controller.getById);

// Admin
router.post("/services", authMiddleware(["ADMIN"]), controller.create);
router.put("/services/:id", authMiddleware(["ADMIN"]), controller.update);
router.delete("/services/:id", authMiddleware(["ADMIN"]), controller.remove);

module.exports = router;
