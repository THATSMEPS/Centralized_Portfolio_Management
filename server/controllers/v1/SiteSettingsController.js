const SiteSettings = require("../../models/SiteSettings");

exports.getSiteSettings = async (req, res) => {
  try {
    const companyId = req.query.companyId || process.env.DEFAULT_COMPANY_ID;
    if (!companyId) {
      return res.status(400).json({ isOk: false, message: "companyId is required" });
    }

    const settings = await SiteSettings.findOne({ companyId }).lean();
    return res.json({ isOk: true, data: settings || {} });
  } catch (err) {
    console.error("getSiteSettings =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.getSiteSettingsAdmin = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    if (!companyId) {
      return res.status(400).json({ isOk: false, message: "Unauthorized" });
    }

    const settings = await SiteSettings.findOne({ companyId }).lean();
    return res.json({ isOk: true, data: settings || {} });
  } catch (err) {
    console.error("getSiteSettingsAdmin =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};

exports.updateSiteSettings = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;
    if (!companyId) {
      return res.status(400).json({ isOk: false, message: "Unauthorized" });
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { companyId },
      { ...req.body, companyId },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ isOk: true, message: "Site settings updated", data: settings });
  } catch (err) {
    console.error("updateSiteSettings =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};
