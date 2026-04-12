const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["NEW", "READ", "REPLIED", "ARCHIVED"],
      default: "NEW",
    },
    notes: { type: String, default: "" },
    repliedAt: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: true,
    },
  },
  { timestamps: true }
);

EnquirySchema.index({ companyId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Enquiry", EnquirySchema);
