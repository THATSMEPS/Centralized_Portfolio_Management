const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    iconName: { type: String, default: "Cpu" },
    iconColor: { type: String, default: "text-blue-500" },
    desc: { type: String, default: "" },
    features: [{ type: String }],
    tech: [{ type: String }],
    accent: { type: String, default: "blue" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: true,
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ companyId: 1, displayOrder: 1 });

module.exports = mongoose.model("Service", ServiceSchema);
