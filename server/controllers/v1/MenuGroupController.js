const MenuGroupMaster = require("../../models/MenuGroupMaster.js");
const { getReferencingCounts, formatReferenceMessage } = require("../../utils/referenceHelper.js");

const createMenuGroup = async (req, res) => {
  try {
    const { menuGroupName, sequence, isActive, isLink, menuUrl, icon } = req.body;
    if (!menuGroupName) {
      return res.status(400).json({ isOk: false, message: "Menu group name is required" });
    }
    const companyId = req.user.companyId || req.user._id;
    const newGroup = new MenuGroupMaster({
      menuGroupName, sequence: sequence || 0, isActive: isActive !== undefined ? isActive : true,
      isLink: isLink || false, menuUrl: menuUrl || "", icon: icon || "", companyId,
    });
    await newGroup.save();
    res.status(201).json({ isOk: true, data: newGroup });
  } catch (error) {
    console.error("Error creating menu group:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const listAllMenuGroups = async (req, res) => {
  try {
    const groups = await MenuGroupMaster.find().sort({ sequence: 1 });
    res.status(200).json({ isOk: true, data: groups });
  } catch (error) {
    console.error("Error fetching menu groups:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const getMenuGroupById = async (req, res) => {
  try {
    const group = await MenuGroupMaster.findById(req.params.id);
    if (!group) return res.status(404).json({ isOk: false, message: "Menu group not found" });
    res.status(200).json({ isOk: true, data: group });
  } catch (error) {
    console.error("Error fetching menu group:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const updateMenuGroup = async (req, res) => {
  try {
    const { menuGroupName, sequence, isActive, isLink, menuUrl, icon } = req.body;
    const updated = await MenuGroupMaster.findByIdAndUpdate(
      req.params.id,
      { menuGroupName, sequence, isActive, isLink, menuUrl, icon },
      { new: true }
    );
    if (!updated) return res.status(404).json({ isOk: false, message: "Menu group not found" });
    res.status(200).json({ isOk: true, data: updated });
  } catch (error) {
    console.error("Error updating menu group:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const deleteMenuGroup = async (req, res) => {
  try {
    const group = await MenuGroupMaster.findById(req.params.id);
    if (!group) return res.status(404).json({ isOk: false, message: "Menu group not found" });

    const referenceInfo = await getReferencingCounts("MenuGroupMaster", req.params.id);
    if (referenceInfo.totalReferences > 0) {
      return res.status(409).json({
        isOk: false, message: "Cannot delete. Menu group is in use.",
        totalReferences: referenceInfo.totalReferences,
        references: referenceInfo.details,
        formattedMessage: formatReferenceMessage(referenceInfo.details),
      });
    }

    await MenuGroupMaster.findByIdAndDelete(req.params.id);
    res.status(200).json({ isOk: true, message: "Menu group deleted" });
  } catch (error) {
    console.error("Error deleting menu group:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

const searchMenuGroups = async (req, res) => {
  try {
    let { skip, per_page, sorton, sortdir, match, isActive } = req.body;
    let matchCondition = {};
    if (isActive !== undefined && isActive !== null && isActive !== "") {
      matchCondition.isActive = isActive;
    }

    let query = [
      { $match: matchCondition },
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
      query = [{ $match: { $or: [{ menuGroupName: { $regex: match, $options: "i" } }] } }].concat(query);
    }
    if (sorton && sortdir) {
      query = [{ $sort: { [sorton]: sortdir === "desc" ? -1 : 1 } }].concat(query);
    } else {
      query = [{ $sort: { sequence: 1 } }].concat(query);
    }

    const list = await MenuGroupMaster.aggregate(query);
    res.status(200).json({ isOk: true, data: list });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ isOk: false, message: error.message });
  }
};

const reorderMenuGroups = async (req, res) => {
  try {
    const { sequences } = req.body;
    if (!Array.isArray(sequences)) {
      return res.status(400).json({ isOk: false, message: "sequences array is required" });
    }
    const bulkOps = sequences.map(({ id, sequence }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { sequence } } },
    }));
    await MenuGroupMaster.bulkWrite(bulkOps);
    res.status(200).json({ isOk: true, message: "Reordered" });
  } catch (error) {
    console.error("Error reordering:", error);
    res.status(500).json({ isOk: false, message: "Internal server error" });
  }
};

module.exports = {
  createMenuGroup, listAllMenuGroups, getMenuGroupById,
  updateMenuGroup, deleteMenuGroup, searchMenuGroups, reorderMenuGroups,
};
