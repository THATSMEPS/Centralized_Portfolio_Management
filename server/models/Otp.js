const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    otp: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ["SMS", "EMAIL", "WHATSAPP"],
      default: "SMS",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600,
    },
  },
  {
    timestamps: true,
  },
);



const Otp = mongoose.model("Otp", OtpSchema);

module.exports = Otp;
