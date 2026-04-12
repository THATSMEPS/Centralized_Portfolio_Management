const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares/authMiddleware.js");
const {
  createMenu, listAllMenus, getMenuById,
  updateMenu, deleteMenu, searchMenus, getMenusByGroups,
} = require("../../controllers/v1/MenuMasterController.js");

router.get("/menus", authMiddleware(["ADMIN", "EMPLOYEE"]), listAllMenus);
router.get("/menus/by-groups", authMiddleware(["ADMIN", "EMPLOYEE"]), getMenusByGroups);
router.get("/menus/:id", authMiddleware(["ADMIN", "EMPLOYEE"]), getMenuById);
router.post("/menus", authMiddleware(["ADMIN"]), createMenu);
router.post("/menus/search", authMiddleware(["ADMIN", "EMPLOYEE"]), searchMenus);
router.put("/menus/:id", authMiddleware(["ADMIN"]), updateMenu);
router.delete("/menus/:id", authMiddleware(["ADMIN"]), deleteMenu);

module.exports = router;
