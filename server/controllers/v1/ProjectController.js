const Project = require("../../models/Project");

exports.getAll = async (req, res) => {
  try {
    const companyId = req.query.companyId || process.env.DEFAULT_COMPANY_ID;
    const filter = { companyId };
    if (req.query.activeOnly !== "false") filter.isActive = true;
    if (req.query.type && req.query.type !== "ALL") {
      filter.type = { $regex: req.query.type, $options: "i" };
    }

    const projects = await Project.find(filter).sort({ displayOrder: 1 }).lean();
    return res.json({ isOk: true, data: projects });
  } catch (err) {
    console.error("Project.getAll =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, data: project });
  } catch (err) {
    console.error("Project.getById =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    const data = { ...req.body, companyId };

    if (typeof data.filterTags === "string") {
      try { data.filterTags = JSON.parse(data.filterTags); } catch { /* keep as-is */ }
    }

    if (req.file) {
      data.image = req.file.path.replace(/\\/g, "/");
    }

    const project = await Project.create(data);
    return res.json({ isOk: true, message: "Project created", data: project });
  } catch (err) {
    console.error("Project.create =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    if (typeof data.filterTags === "string") {
      try { data.filterTags = JSON.parse(data.filterTags); } catch { /* keep as-is */ }
    }

    if (req.file) {
      data.image = req.file.path.replace(/\\/g, "/");
    }

    const project = await Project.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Project updated", data: project });
  } catch (err) {
    console.error("Project.update =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Project deleted" });
  } catch (err) {
    console.error("Project.remove =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getFilterTags = async (req, res) => {
  try {
    const companyId = req.query.companyId || process.env.DEFAULT_COMPANY_ID;
    const tags = await Project.distinct("filterTags", { companyId, isActive: true });
    return res.json({ isOk: true, data: ["ALL", ...tags.filter(Boolean)] });
  } catch (err) {
    console.error("Project.getFilterTags =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};
