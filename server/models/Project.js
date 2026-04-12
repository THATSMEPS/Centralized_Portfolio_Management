const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tech: { type: String, default: "" },
    type: { type: String, default: "" },
    impact: { type: String, default: "" },
    status: {
      type: String,
      enum: ["DEPLOYED", "ARCHIVED", "STABLE", "ACTIVE", "INTERNAL", "BETA"],
      default: "ACTIVE",
    },
    desc: { type: String, default: "" },
    image: { type: String, default: null },
    link: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    filterTags: [{ type: String }],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: true,
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ companyId: 1, displayOrder: 1 });

module.exports = mongoose.model("Project", ProjectSchema);
