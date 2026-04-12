const mongoose = require("mongoose");

const MenuMasterSchema = new mongoose.Schema(
  {
    menuName: {
      type: String,
      required: true,
      trim: true,
    },
    menuGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuGroupMaster",
      required: true,
    },
    menuUrl: {
      type: String,
      default: "",
    },
    sequence: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isParent: {
      type: Boolean,
      default: false,
    },
    parentMenu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuMaster",
      default: null,
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

MenuMasterSchema.index({ companyId: 1, menuGroup: 1, sequence: 1 });

module.exports = mongoose.model("MenuMaster", MenuMasterSchema);
