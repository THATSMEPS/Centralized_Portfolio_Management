const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const {
  createMenuGroup, listAllMenuGroups, getMenuGroupById,
  updateMenuGroup, deleteMenuGroup, searchMenuGroups, reorderMenuGroups,
} = require("../../controllers/v1/MenuGroupController.js");

router.get("/menu-groups", authMiddleware(["ADMIN", "EMPLOYEE"]), listAllMenuGroups);
router.get("/menu-groups/:id", authMiddleware(["ADMIN", "EMPLOYEE"]), getMenuGroupById);
router.post("/menu-groups", authMiddleware(["ADMIN"]), createMenuGroup);
router.post("/menu-groups/search", authMiddleware(["ADMIN", "EMPLOYEE"]), searchMenuGroups);
router.put("/menu-groups/:id", authMiddleware(["ADMIN"]), updateMenuGroup);
router.delete("/menu-groups/:id", authMiddleware(["ADMIN"]), deleteMenuGroup);
router.patch("/menu-groups/reorder", authMiddleware(["ADMIN"]), reorderMenuGroups);

module.exports = router;
