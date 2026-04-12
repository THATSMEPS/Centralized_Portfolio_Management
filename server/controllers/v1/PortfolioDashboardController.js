const TeamMember = require("../../models/TeamMember");
const Service = require("../../models/Service");
const Project = require("../../models/Project");
const Enquiry = require("../../models/Enquiry");

exports.getAnalytics = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.user?.id;

    const [
      totalMembers,
      activeMembers,
      totalServices,
      activeServices,
      totalProjects,
      activeProjects,
      totalEnquiries,
      newEnquiries,
      recentEnquiries,
    ] = await Promise.all([
      TeamMember.countDocuments({ companyId }),
      TeamMember.countDocuments({ companyId, isActive: true }),
      Service.countDocuments({ companyId }),
      Service.countDocuments({ companyId, isActive: true }),
      Project.countDocuments({ companyId }),
      Project.countDocuments({ companyId, isActive: true }),
      Enquiry.countDocuments({ companyId }),
      Enquiry.countDocuments({ companyId, status: "NEW" }),
      Enquiry.find({ companyId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.json({
      isOk: true,
      data: {
        teamMembers: { total: totalMembers, active: activeMembers },
        services: { total: totalServices, active: activeServices },
        projects: { total: totalProjects, active: activeProjects },
        enquiries: { total: totalEnquiries, new: newEnquiries },
        recentEnquiries,
      },
    });
  } catch (err) {
    console.error("PortfolioDashboard.getAnalytics =>", err);
    return res.status(500).json({ isOk: false, message: err.message });
  }
};
