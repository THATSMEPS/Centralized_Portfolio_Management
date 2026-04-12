const Enquiry = require("../../models/Enquiry");

exports.submit = async (req, res) => {
  try {
    const companyId = req.body.companyId || process.env.DEFAULT_COMPANY_ID;
    if (!companyId) {
      return res.status(400).json({ isOk: false, message: "companyId is required" });
    }

    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ isOk: false, message: "name, email and message are required" });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      message,
      companyId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.json({ isOk: true, message: "Enquiry submitted successfully", data: { id: enquiry._id } });
  } catch (err) {
    console.error("Enquiry.submit =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { companyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const s = req.query.search;
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(filter),
    ]);

    return res.json({
      isOk: true,
      data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Enquiry.getAll =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).lean();
    if (!enquiry) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, data: enquiry });
  } catch (err) {
    console.error("Enquiry.getById =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    if (status === "REPLIED") update.repliedAt = new Date();

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!enquiry) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Enquiry updated", data: enquiry });
  } catch (err) {
    console.error("Enquiry.updateStatus =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ isOk: false, message: "Not found" });
    return res.json({ isOk: true, message: "Enquiry deleted" });
  } catch (err) {
    console.error("Enquiry.remove =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    const [total, newCount, readCount, repliedCount] = await Promise.all([
      Enquiry.countDocuments({ companyId }),
      Enquiry.countDocuments({ companyId, status: "NEW" }),
      Enquiry.countDocuments({ companyId, status: "READ" }),
      Enquiry.countDocuments({ companyId, status: "REPLIED" }),
    ]);
    return res.json({ isOk: true, data: { total, new: newCount, read: readCount, replied: repliedCount } });
  } catch (err) {
    console.error("Enquiry.getStats =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};
