const mongoose = require("mongoose");

const LiveFeedEntrySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    color: { type: String, default: "text-gray-500" },
    timestamp: { type: String, default: "" },
  },
  { _id: false }
);

const NavItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["link", "button"], default: "link" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SocialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: "" },
  },
  { _id: false }
);

const SiteSettingsSchema = new mongoose.Schema(
  {
    // Hero Section
    heroTitle: { type: String, default: "NEBULA CORE" },
    heroSubtitle: { type: String, default: "" },
    heroTagline1: { type: String, default: "High-Performance Engineering" },
    heroTagline2: { type: String, default: "Interactive Systems" },
    brandName: { type: String, default: "Nebula Core" },

    // Capabilities Section
    capabilitiesLabel: { type: String, default: "Tactical Deployment" },
    capabilitiesTitle: { type: String, default: "Operational Capabilities." },
    capabilitiesDescription: { type: String, default: "" },

    // CTA Banner
    ctaBannerTitle: { type: String, default: "Bespoke Strategic Retainers" },
    ctaBannerDescription: { type: String, default: "" },
    ctaButtonText: { type: String, default: "Discuss Engagement" },

    // Origin Story
    originLabel: { type: String, default: "Genesis & Story" },
    originTitle: { type: String, default: "BORN FROM THE VOID." },
    originText: { type: String, default: "" },

    // Live Feed
    liveFeedTitle: { type: String, default: "SYSTEM OVERSIGHT." },
    liveFeedEntries: [LiveFeedEntrySchema],

    // Footer
    footerText: { type: String, default: "" },
    footerStatusText: { type: String, default: "Status: Operational" },

    // Enquire Page
    enquireTitle: { type: String, default: "LET'S BUILD." },
    enquireDescription: { type: String, default: "" },
    enquireButtonText: { type: String, default: "Initiate Transmission" },

    // Navigation
    navItems: [NavItemSchema],

    // Social Links
    socialLinks: [SocialLinkSchema],

    // SEO
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    favicon: { type: String, default: "" },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: true,
    },
  },
  { timestamps: true }
);

// One settings document per company
SiteSettingsSchema.index({ companyId: 1 }, { unique: true });

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
