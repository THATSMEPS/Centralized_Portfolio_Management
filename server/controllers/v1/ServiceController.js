const Service = require("../../models/Service");

exports.getAll = async (req, res) => {
  try {
    const companyId = req.query.companyId || process.env.DEFAULT_COMPANY_ID;
    const filter = { companyId };
    if (req.query.activeOnly !== "false") filter.isActive = true;

    const services = await Service.find(filter).sort({ displayOrder: 1 }).lean();
    return res.json({ isOk: true, data: services });
  } catch (err) {
    console.error("Service.getAll =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, data: service });
  } catch (err) {
    console.error("Service.getById =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    const data = { ...req.body, companyId };

    // Parse array fields if sent as strings
    for (const field of ["features", "tech"]) {
      if (typeof data[field] === "string") {
        try { data[field] = JSON.parse(data[field]); } catch { /* keep as-is */ }
      }
    }

    const service = await Service.create(data);
    return res.json({ isOk: true, message: "Service created", data: service });
  } catch (err) {
    console.error("Service.create =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = { ...req.body };

    for (const field of ["features", "tech"]) {
      if (typeof data[field] === "string") {
        try { data[field] = JSON.parse(data[field]); } catch { /* keep as-is */ }
      }
    }

    const service = await Service.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Service updated", data: service });
  } catch (err) {
    console.error("Service.update =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Service deleted" });
  } catch (err) {
    console.error("Service.remove =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};
