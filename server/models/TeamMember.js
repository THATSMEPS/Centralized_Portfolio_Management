const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    accent: { type: String, default: "from-blue-600 to-cyan-400" },
    glow: { type: String, default: "rgba(6, 182, 212, 0.4)" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    personal: {
      location: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      website: { type: String, default: "" },
      languages: [{ type: String }],
    },

    skills: [
      {
        name: { type: String, default: "" },
        level: { type: Number, default: 50 },
      },
    ],

    experience: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        period: { type: String, default: "" },
        desc: { type: String, default: "" },
        location: { type: String, default: "" },
      },
    ],

    education: [
      {
        degree: { type: String, default: "" },
        school: { type: String, default: "" },
        year: { type: String, default: "" },
      },
    ],

    projects: [
      {
        title: { type: String, default: "" },
        type: { type: String, default: "" },
        description: { type: String, default: "" },
        thumbnail: { type: String, default: "" },
        images: [{ type: String }],
        videoUrl: { type: String, default: "" },
        liveUrl: { type: String, default: "" },
        githubUrl: { type: String, default: "" },
        link: { type: String, default: "" },
        tags: [{ type: String }],
        featured: { type: Boolean, default: false },
      },
    ],

    certificates: [
      {
        title: { type: String, default: "" },
        issuer: { type: String, default: "" },
        date: { type: String, default: "" },
        credentialUrl: { type: String, default: "" },
        image: { type: String, default: "" },
      },
    ],

    socialLinks: [
      {
        platform: { type: String, default: "" },
        url: { type: String, default: "" },
        icon: { type: String, default: "" },
      },
    ],

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyMaster" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
