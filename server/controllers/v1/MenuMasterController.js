const MenuMaster = require("../../models/MenuMaster.js");
const MenuGroupMaster = require("../../models/MenuGroupMaster.js");
const { getReferencingCounts, formatReferenceMessage } = require("../../utils/referenceHelper.js");

const createMenu = async (req, res) => {
  try {
    const { menuName, menuGroup, menuUrl, sequence, isActive, isParent, parentMenu, icon } = req.body;
    if (!menuName || !menuGroup) {
      return res.status(400).json({ isOk: false, message: "Menu name and group are required" });
    }
    const companyId = req.user.companyId || req.user._id;
    const newMenu = new MenuMaster({
      menuName, menuGroup, menuUrl: menuUrl || "", sequence: sequence || 0,
      isActive: isActive !== undefined ? isActive : true,
      isParent: isParent || false, parentMenu: parentMenu || null,
      icon: icon || "", companyId,
    });
    await newMenu.save();
    res.status(201).json({ isOk: true, data: newMenu });
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const listAllMenus = async (req, res) => {
  try {
    const menus = await MenuMaster.find()
      .populate("menuGroup", "menuGroupName")
      .populate("parentMenu", "menuName")
      .sort({ sequence: 1 });
    res.status(200).json({ isOk: true, data: menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const getMenuById = async (req, res) => {
  try {
    const menu = await MenuMaster.findById(req.params.id)
      .populate("menuGroup", "menuGroupName")
      .populate("parentMenu", "menuName");
    if (!menu) return res.status(404).json({ isOk: false, message: "Menu not found" });
    res.status(200).json({ isOk: true, data: menu });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const updateMenu = async (req, res) => {
  try {
    const { menuName, menuGroup, menuUrl, sequence, isActive, isParent, parentMenu, icon } = req.body;
    const updated = await MenuMaster.findByIdAndUpdate(
      req.params.id,
      { menuName, menuGroup, menuUrl, sequence, isActive, isParent, parentMenu: parentMenu || null, icon },
      { new: true }
    );
    if (!updated) return res.status(404).json({ isOk: false, message: "Menu not found" });
    res.status(200).json({ isOk: true, data: updated });
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const deleteMenu = async (req, res) => {
  try {
    const menu = await MenuMaster.findById(req.params.id);
    if (!menu) return res.status(404).json({ isOk: false, message: "Menu not found" });

    const referenceInfo = await getReferencingCounts("MenuMaster", req.params.id);
    if (referenceInfo.totalReferences > 0) {
      return res.status(409).json({
        isOk: false, message: "Cannot delete. Menu is in use.",
        totalReferences: referenceInfo.totalReferences,
        references: referenceInfo.details,
        formattedMessage: formatReferenceMessage(referenceInfo.details),
      });
    }

    await MenuMaster.findByIdAndDelete(req.params.id);
    res.status(200).json({ isOk: true, message: "Menu deleted" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const searchMenus = async (req, res) => {
  try {
    let { skip, per_page, sorton, sortdir, match, isActive } = req.body;
    let matchCondition = {};
    if (isActive !== undefined && isActive !== null && isActive !== "") {
      matchCondition.isActive = isActive;
    }

    let query = [
      { $match: matchCondition },
      {
        $lookup: {
          from: "menugroupmasters", localField: "menuGroup",
          foreignField: "_id", as: "menuGroupData",
        },
      },
      { $unwind: { path: "$menuGroupData", preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [{ $skip: skip }, { $limit: per_page }],
        },
      },
      { $unwind: "$stage1" },
      { $project: { count: "$stage1.count", data: "$stage2" } },
    ];

    if (match) {
      query = [{ $match: { $or: [{ menuName: { $regex: match, $options: "i" } }] } }].concat(query);
    }
    if (sorton && sortdir) {
      query = [{ $sort: { [sorton]: sortdir === "desc" ? -1 : 1 } }].concat(query);
    } else {
      query = [{ $sort: { sequence: 1 } }].concat(query);
    }

    const list = await MenuMaster.aggregate(query);
    res.status(200).json({ isOk: true, data: list });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ isOk: false, message: error.message });
  }
};

const getMenusByGroups = async (req, res) => {
  try {
    const groups = await MenuGroupMaster.find({ isActive: true }).sort({ sequence: 1 });
    const menus = await MenuMaster.find({ isActive: true }).sort({ sequence: 1 });

    const result = groups.map((group) => {
      const groupMenus = menus.filter(
        (m) => m.menuGroup.toString() === group._id.toString() && !m.parentMenu
      );

      const buildChildren = (parentId) => {
        return menus
          .filter((m) => m.parentMenu && m.parentMenu.toString() === parentId.toString())
          .map((child) => ({
            id: child._id.toString(),
            name: child.menuName,
            url: child.menuUrl,
            sequence: child.sequence,
            isParent: child.isParent,
            icon: child.icon,
            children: buildChildren(child._id),
          }));
      };

      return {
        groupId: group._id.toString(),
        groupName: group.menuGroupName,
        sequence: group.sequence,
        icon: group.icon,
        isLink: group.isLink,
        url: group.menuUrl,
        menus: groupMenus.map((m) => ({
          id: m._id.toString(),
          name: m.menuName,
          url: m.menuUrl,
          sequence: m.sequence,
          isParent: m.isParent,
          icon: m.icon,
          children: buildChildren(m._id),
        })),
      };
    });

    res.status(200).json({ isOk: true, data: result });
  } catch (error) {
    console.error("Error fetching menus by groups:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

module.exports = {
  createMenu, listAllMenus, getMenuById, updateMenu,
  deleteMenu, searchMenus, getMenusByGroups,
};
