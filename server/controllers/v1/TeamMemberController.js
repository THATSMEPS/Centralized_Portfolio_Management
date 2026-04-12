const TeamMember = require("../../models/TeamMember");

exports.getAll = async (req, res) => {
  try {
    const companyId = req.query.companyId || process.env.DEFAULT_COMPANY_ID;
    const filter = { companyId };
    if (req.query.activeOnly !== "false") filter.isActive = true;

    const members = await TeamMember.find(filter).sort({ displayOrder: 1 }).lean();
    return res.json({ isOk: true, data: members });
  } catch (err) {
    console.error("TeamMember.getAll =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id).lean();
    if (!member) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, data: member });
  } catch (err) {
    console.error("TeamMember.getById =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    const data = { ...req.body, companyId };

    if (req.file) {
      data.avatar = req.file.path.replace(/\\/g, "/");
    }

    // Parse JSON strings for array fields if sent as form-data
    const arrayFields = ["education", "experience", "skills", "projects", "certificates", "socialLinks"];
    for (const field of arrayFields) {
      if (typeof data[field] === "string") {
        try { data[field] = JSON.parse(data[field]); } catch { /* keep as-is */ }
      }
    }
    if (typeof data.personal === "string") {
      try { data.personal = JSON.parse(data.personal); } catch { /* keep as-is */ }
    }
    if (typeof data["personal.languages"] === "string") {
      try {
        if (!data.personal) data.personal = {};
        data.personal.languages = JSON.parse(data["personal.languages"]);
        delete data["personal.languages"];
      } catch { /* keep as-is */ }
    }

    const member = await TeamMember.create(data);
    return res.json({ isOk: true, message: "Team member created", data: member });
  } catch (err) {
    console.error("TeamMember.create =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (req.file) {
      data.avatar = req.file.path.replace(/\\/g, "/");
    }

    // Parse JSON strings for array fields
    const arrayFields = ["education", "experience", "skills", "projects", "certificates", "socialLinks"];
    for (const field of arrayFields) {
      if (typeof data[field] === "string") {
        try { data[field] = JSON.parse(data[field]); } catch { /* keep as-is */ }
      }
    }
    if (typeof data.personal === "string") {
      try { data.personal = JSON.parse(data.personal); } catch { /* keep as-is */ }
    }

    const member = await TeamMember.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ isOk: false, message: "Not found" });

    return res.json({ isOk: true, message: "Team member updated", data: member });
  } catch (err) {
    console.error("TeamMember.update =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Team member deleted" });
  } catch (err) {
    console.error("TeamMember.remove =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, displayOrder }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ isOk: false, message: "items array required" });
    }

    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { displayOrder: item.displayOrder },
      },
    }));
    await TeamMember.bulkWrite(ops);

    return res.json({ isOk: true, message: "Reorder successful" });
  } catch (err) {
    console.error("TeamMember.reorder =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};
