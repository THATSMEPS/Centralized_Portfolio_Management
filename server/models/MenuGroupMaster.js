const mongoose = require("mongoose");

const MenuGroupMasterSchema = new mongoose.Schema(
  {
    menuGroupName: {
      type: String,
      required: true,
      trim: true,
    },
    sequence: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isLink: {
      type: Boolean,
      default: false,
    },
    menuUrl: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: true,
    },
  },
  { timestamps: true }
);

MenuGroupMasterSchema.index({ companyId: 1, sequence: 1 });

module.exports = mongoose.model("MenuGroupMaster", MenuGroupMasterSchema);
