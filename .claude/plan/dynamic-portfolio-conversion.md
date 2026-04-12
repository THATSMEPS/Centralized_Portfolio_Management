# Implementation Plan: Converting Static Portfolio to Fully Dynamic System

## Task Type
- [x] Frontend (portfolio - later phase, keep static as fallback)
- [x] Backend (new portfolio models/routes, clean restaurant code)
- [x] Admin Panel (clean restaurant pages, add portfolio management)

## Overview

Transform the current static Vite+React portfolio into a fully dynamic system where ALL content is managed through an admin panel backed by Express+MongoDB APIs. The admin panel and backend are currently from "The Chocolate Room" restaurant project and must be repurposed.

**Guiding Principles:**
- Keep static frontend data as fallback (don't touch `front/` in early sections)
- Preserve reusable infrastructure (auth, file upload, security, layouts, common components)
- Remove ALL restaurant-specific code (models, controllers, routes, admin pages, API files)
- Follow existing patterns (CRUD pages, API layer, model conventions)

---

## Section 1: Backend Cleanup — Remove Restaurant-Specific Code

### Step 1.1: Delete Restaurant-Specific Models
Remove all models that are specific to The Chocolate Room restaurant business:

**DELETE these files from `server/models/`:**
- `AddOnGroupMaster.js` — restaurant add-on groups
- `AddOnMaster.js` — restaurant add-ons
- `CategoryMaster.js` — food categories
- `ComboMaster.js` — food combos
- `FoodItemMaster.js` — food items
- `MenuGroupMaster.js` — restaurant menu groups
- `MenuMaster.js` — restaurant menu items (NOTE: keep the admin menu system in MenuContext, but the DB-driven menus need to be re-seeded for portfolio)
- `StoreMaster.js` — restaurant stores
- `StoreAddOnConfig.js` — store add-on config
- `StoreAddOnGroupConfig.js` — store add-on group config
- `StoreCategoryConfig.js` — store category config
- `StoreComboConfig.js` — store combo config
- `StoreItemConfig.js` — store item config
- `StoreMerchandiseConfig.js` — store merchandise config
- `MerchandiseMaster.js` — merchandise items
- `GiftCardCategory.js` — gift card categories
- `GiftCardMaster.js` — gift cards
- `PurchasedGiftCard.js` — purchased gift cards
- `LoyaltyCard.js` — loyalty cards
- `OfferUsage.js` — offer usage tracking
- `BannerMaster.js` — restaurant banners
- `AboutUsMaster.js` — restaurant about us
- `Cart.js` — shopping cart
- `Wishlist.js` — wishlist
- `Notification.js` — push notifications
- `NotificationCampaign.js` — notification campaigns
- `NotificationTemplate.js` — notification templates
- `AppVersion.js` — mobile app versions

**KEEP these models (reusable infrastructure):**
- `Employee.js` — admin users (rename conceptually to "admin users")
- `EmployeeRoles.js` — role permissions
- `RoleMaster.js` — role definitions
- `Country.js`, `State.js`, `City.js` — location data (useful for contact info)
- `CurrencyMaster.js` — may be useful
- `EmailFor.js`, `EmailSetup.js`, `EmailTemplate.js` — email system
- `LoginAttempt.js` — security audit log

### Step 1.2: Delete Restaurant-Specific Controllers
**DELETE from `server/controllers/v1/`:**
- `AddOnController.js`
- `MenuMasterController.js`
- `MenuGroupController.js`
- `StoreController.js`
- `StoreItemConfigController.js`
- `MerchandiseController.js`
- `BannersController.js`
- `AboutUsController.js`
- `WishlistController.js`
- `CustomerController.js`
- `NotificationController.js`
- `NotificationCampaignController.js`
- `AppVersionController.js`
- `LoyaltyCardController.js`
- `LoyaltyRuleController.js`
- `LoyaltyWalletController.js`

**KEEP:**
- `CurrencyController.js`
- `EmailForController.js`, `EmailSetupController.js`, `EmailTemplateController.js`
- `EmployeeRolesController.js`
- `LocationController.js`
- `OtpController.js`
- `RoleMasterController.js`

### Step 1.3: Delete Restaurant-Specific Routes
**DELETE from `server/routes/v1/`:**
- `CartRoutes.js`
- `CatalogRoutes.js`
- `CategoriesRoutes.js`
- `CustomerAuthRoutes.js`
- `CustomerProfileRoutes.js`
- `CustomerStoreRoutes.js`
- `FoodItemsRoutes.js`
- `MenusRoutes.js`
- `StoresRoutes.js`
- `StoreItemConfigsRoutes.js`
- `WishlistRoutes.js`
- `AboutUsRoutes.js`
- `AppVersionRoutes.js`
- `notificationRoutes.js`

**KEEP:**
- `CurrenciesRoutes.js`
- `EmailsRoutes.js`
- `EmployeeRolesRoutes.js`
- `LocationsRoutes.js`
- `OtpRoutes.js`
- `RolesRoutes.js`
- `LoyaltyCardsRoutes.js` — DELETE (restaurant-specific)

### Step 1.4: Delete Restaurant-Specific Services/Cron/Utils
**DELETE:**
- `server/services/orderWatcher.js` — order watching
- `server/services/NotificationService.js` — push notifications
- `server/cron/loyaltyCron.js` — loyalty cron jobs
- `server/utils/orderNumberGenerator.js` — order numbers
- `server/utils/orderValidation.js` — order validation
- `server/utils/giftCardPdfHelper.js` — gift card PDFs
- `server/utils/transactionHelper.js` — transaction helpers
- `server/config/firebase.js` — Firebase push notifications

**KEEP:**
- `server/utils/referenceHelper.js` — reference checking utility
- `server/utils/socket.js` — WebSocket (useful for live updates)
- `server/services/authService.js` — authentication service
- `server/middlewares/*` — ALL middleware (auth, security, upload, rate limiting, input validation)

### Step 1.5: Update server.js
Remove references to deleted modules:
- Remove `initOrderWatcher()` call
- Remove `initSocket(server)` (optional — can keep for future live features)
- Update package.json name from "chocolateroom-server" to "portfolio-server"

---

## Section 2: Backend — Create Portfolio Models

### Step 2.1: Create `SiteSettings` Model
```
server/models/SiteSettings.js
Schema:
  - heroTitle: String (default: "NEBULA CORE")
  - heroSubtitle: String
  - heroTagline1: String (e.g. "High-Performance Engineering")
  - heroTagline2: String (e.g. "Interactive Systems")
  - brandName: String (default: "Nebula Core")
  - capabilitiesTitle: String
  - capabilitiesSubtitle: String
  - capabilitiesDescription: String
  - ctaBannerTitle: String
  - ctaBannerDescription: String
  - ctaButtonText: String
  - originTitle: String
  - originText: String (paragraph)
  - liveFeedTitle: String
  - liveFeedEntries: [{ text: String, color: String, timestamp: String }]
  - footerText: String
  - footerStatusText: String
  - enquireTitle: String
  - enquireDescription: String
  - enquireButtonText: String
  - navItems: [{ key: String, label: String, type: String (link|button), order: Number }]
  - socialLinks: [{ platform: String, url: String, icon: String }]
  - metaTitle: String
  - metaDescription: String
  - favicon: String
  - companyId: ObjectId ref CompanyMaster (required)
  timestamps: true
```
**Pattern:** Single document per company (upsert on save)

### Step 2.2: Create `TeamMember` Model
```
server/models/TeamMember.js
Schema:
  - name: String (required)
  - role: String (required)
  - accent: String (gradient CSS class)
  - glow: String (rgba color)
  - avatar: String (image URL from upload)
  - bio: String (long text)
  - displayOrder: Number (default: 0)
  - isActive: Boolean (default: true)
  - personal: {
      location: String,
      email: String,
      phone: String,
      website: String,
      languages: [String]
    }
  - education: [{
      degree: String,
      school: String,
      year: String
    }]
  - experience: [{
      company: String,
      role: String,
      period: String,
      desc: String
    }]
  - skills: [{
      name: String,
      level: Number (0-100)
    }]
  - projects: [{
      title: String,
      type: String,
      link: String,
      tags: [String]
    }]
  - certificates: [String]
  - socialLinks: [{ platform: String, url: String }]
  - companyId: ObjectId ref CompanyMaster (required)
  timestamps: true
```

### Step 2.3: Create `Service` Model
```
server/models/Service.js
Schema:
  - category: String (required)
  - title: String (required)
  - iconName: String (Lucide icon name)
  - iconColor: String (Tailwind class)
  - desc: String
  - features: [String]
  - tech: [String]
  - accent: String (color name)
  - displayOrder: Number (default: 0)
  - isActive: Boolean (default: true)
  - companyId: ObjectId ref CompanyMaster (required)
  timestamps: true
```

### Step 2.4: Create `Project` Model
```
server/models/Project.js
Schema:
  - title: String (required)
  - tech: String
  - type: String (e.g. AI/ML, Systems, Interface, Blockchain)
  - impact: String (e.g. "98%")
  - status: String (DEPLOYED, ARCHIVED, STABLE, ACTIVE, INTERNAL, BETA)
  - desc: String
  - image: String (optional image URL)
  - link: String (optional external link)
  - displayOrder: Number (default: 0)
  - isActive: Boolean (default: true)
  - filterTags: [String]
  - companyId: ObjectId ref CompanyMaster (required)
  timestamps: true
```

### Step 2.5: Create `Enquiry` Model
```
server/models/Enquiry.js
Schema:
  - name: String (required)
  - email: String (required)
  - message: String (required)
  - status: String (enum: NEW, READ, REPLIED, ARCHIVED, default: NEW)
  - notes: String (admin internal notes)
  - repliedAt: Date
  - ipAddress: String
  - userAgent: String
  - companyId: ObjectId ref CompanyMaster (required)
  timestamps: true
```

### Step 2.6: Create `ProjectFilterTag` Model (Optional — could be embedded in SiteSettings)
```
server/models/ProjectFilterTag.js
Schema:
  - name: String (required, e.g. "ALL", "AI", "SYSTEMS")
  - displayOrder: Number
  - isActive: Boolean (default: true)
  - companyId: ObjectId ref CompanyMaster (required)
  timestamps: true
```

---

## Section 3: Backend — Create Portfolio Controllers & Routes

### Step 3.1: Create `SiteSettingsController.js`
```
server/controllers/v1/SiteSettingsController.js
Endpoints:
  - GET  /site-settings         → getSiteSettings (public, no auth needed for frontend)
  - PUT  /site-settings         → updateSiteSettings (admin auth required)
  - GET  /site-settings/admin   → getSiteSettingsAdmin (admin auth, includes all fields)
```

### Step 3.2: Create `TeamMemberController.js`
```
server/controllers/v1/TeamMemberController.js
Endpoints:
  - GET    /team-members           → getAll (public, only active, sorted by displayOrder)
  - GET    /team-members/:id       → getById (public)
  - POST   /team-members           → create (admin auth + file upload for avatar)
  - PUT    /team-members/:id       → update (admin auth + file upload)
  - DELETE /team-members/:id       → delete (admin auth)
  - POST   /team-members/reorder   → reorder (admin auth, update displayOrder)
```

### Step 3.3: Create `ServiceController.js`
```
server/controllers/v1/ServiceController.js
Endpoints:
  - GET    /services           → getAll (public)
  - GET    /services/:id       → getById
  - POST   /services           → create (admin auth)
  - PUT    /services/:id       → update (admin auth)
  - DELETE /services/:id       → delete (admin auth)
```

### Step 3.4: Create `ProjectController.js`
```
server/controllers/v1/ProjectController.js
Endpoints:
  - GET    /projects           → getAll (public, with optional type filter)
  - GET    /projects/:id       → getById
  - POST   /projects           → create (admin auth)
  - PUT    /projects/:id       → update (admin auth)
  - DELETE /projects/:id       → delete (admin auth)
  - GET    /projects/filters   → getFilterTags (public)
```

### Step 3.5: Create `EnquiryController.js`
```
server/controllers/v1/EnquiryController.js
Endpoints:
  - POST   /enquiries          → submit (public, rate-limited)
  - GET    /enquiries          → getAll (admin auth, with pagination/filters)
  - GET    /enquiries/:id      → getById (admin auth)
  - PUT    /enquiries/:id      → updateStatus (admin auth)
  - DELETE /enquiries/:id      → delete (admin auth)
```

### Step 3.6: Create Route Files
Create corresponding route files in `server/routes/v1/`:
- `SiteSettingsRoutes.js`
- `TeamMemberRoutes.js`
- `ServiceRoutes.js`
- `ProjectRoutes.js`
- `EnquiryRoutes.js`

Each follows the existing pattern:
```js
const router = require("express").Router();
const controller = require("../../controllers/v1/XxxController");
const authMiddleware = require("../../middlewares/authMiddleware");
const { secureUpload } = require("../../middlewares/secureUpload");

// Public routes (no auth)
router.get("/xxx", controller.getAll);

// Admin routes (auth required)
router.post("/xxx", authMiddleware(["ADMIN", "COMPANY"]), controller.create);
// etc.

module.exports = router;
```

---

## Section 4: Admin Panel Cleanup — Remove Restaurant Pages

### Step 4.1: Delete Restaurant-Specific Admin Pages
**DELETE from `admin/src/pages/`:**
- `Store/` — entire directory (StoreMenuManager, StoreMerchandiseManager, StoreDashboard)
- `Orders/` — entire directory (Orders, LiveOrders)
- `Coupons/` — entire directory
- `Loyalty/` — entire directory (LoyaltyRules, LoyaltyWallets)
- `Master/CategoryMaster.js`
- `Master/SubCategoryMaster.js`
- `Master/MerchandiseSubCategoryMaster.js`
- `Master/AddOnMaster.js`
- `Master/AddOnGroupMaster.js`
- `Master/ComboMaster.js`
- `Master/FoodItemMaster.js`
- `Master/MerchandiseMaster.js`
- `Master/MerchandiseCategoryMaster.js`
- `Master/GiftCardMaster.js`
- `Master/PurchasedGiftCards.js`
- `Master/BannerMaster.js`
- `Master/AboutUsMaster.js`
- `Master/OfferMaster.js`
- `Master/NotificationMaster.js`

**KEEP:**
- `Dashboard/Dashboard.js` — will be repurposed
- `Auth/` — login/admin user management
- `Authentication/` — login page
- `AuthenticationInner/` — auth page templates
- `Setup/` — CompanyDetails, Employee, EmployeeRoles, StoreMaster (rename/repurpose StoreMaster)
- `Master/Country.js`, `Master/State.js`, `Master/City.js` — locations
- `Master/RoleMaster.js` — roles
- `Master/CurrencyMaster.js` — currencies
- `Master/MenuGroup.js`, `Master/MenuMaster.js` — admin menu management (super admin only)
- `Master/LoginAttemptLogs.js` — security logs
- `CMS/EmailSetup.js`, `CMS/EmailFor.js`, `CMS/EmailTemplate.js` — email management

### Step 4.2: Delete Restaurant-Specific API Files
**DELETE from `admin/src/api/`:**
- `foodItems.api.js`
- `storeConfig.api.js`
- `storeItemConfigs.api.js`
- `stores.api.js`
- `orders.api.js`
- `merchandise.api.js`
- `merchandiseConfigs.api.js`
- `banners.api.js`
- `aboutUs.api.js`
- `notificationCampaigns.api.js`
- `dashboard.api.js` — will recreate for portfolio
- `offers.api.js`
- `giftCard.api.js`
- `loyalty.api.js`
- `loyaltyCards.api.js`

**KEEP:**
- `index.js` — axios instance with interceptors
- `endpoints.js` — will be updated
- `auth.api.js` — authentication
- `admin.api.js` — admin utilities
- `companies.api.js` — company management
- `currencies.api.js`
- `emails.api.js`
- `employeeRoles.api.js`
- `employees.api.js`
- `locations.api.js`
- `roles.api.js`
- `menus.api.js` — admin menu system
- `masters.api.js`

### Step 4.3: Delete Restaurant Data Files
**DELETE from `admin/src/common/data/`:**
- ALL files (analytics.js, LandingNFT.js, NFTMarketplace.js, apiKey.js, appsCrm.js, appsJobs.js, etc.) — these are Velzon template demo data, not used

### Step 4.4: Update `admin/src/Routes/allRoutes.js`
Remove all restaurant-specific routes. Update to:
```js
const authProtectedRoutes = [
    // Dashboard
    { path: "/dashboard", component: <Dashboard /> },
    
    // Portfolio Content Management
    { path: "/site-settings", component: <SiteSettings /> },
    { path: "/team-members", component: <TeamMembers /> },
    { path: "/services", component: <Services /> },
    { path: "/projects", component: <Projects /> },
    { path: "/enquiries", component: <Enquiries /> },
    
    // System Setup (kept from original)
    { path: "/profile", component: <UserProfile /> },
    { path: "/company-details", component: <CompanyDetails /> },
    { path: "/employee", component: <Employee /> },
    { path: "/employee-roles", component: <EmployeeRoles /> },
    
    // Master Data (kept)
    { path: "/country", component: <Country /> },
    { path: "/state", component: <State /> },
    { path: "/city", component: <City /> },
    { path: "/role-master", component: <RoleMaster /> },
    { path: "/currency-master", component: <CurrencyMaster /> },
    { path: "/menu-master", component: <MenuMaster /> },
    { path: "/menu-group", component: <MenuGroup /> },
    { path: "/login-attempt-logs", component: <LoginAttemptLogs /> },
    
    // Email CMS (kept)
    { path: "/email-setup", component: <EmailSetup /> },
    { path: "/email-for", component: <EmailFor /> },
    { path: "/email-template", component: <EmailTemplate /> },
    
    // Defaults
    { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
    { path: "*", component: <Navigate to="/dashboard" /> },
];
```

### Step 4.5: Update `admin/src/api/endpoints.js`
Add portfolio endpoints, remove restaurant ones:
```js
// ADD these new endpoint groups:
SITE_SETTINGS: {
    BASE: `${V1}/site-settings`,
    ADMIN: `${V1}/site-settings/admin`,
},
TEAM_MEMBERS: {
    BASE: `${V1}/team-members`,
    BY_ID: (id) => `${V1}/team-members/${id}`,
    REORDER: `${V1}/team-members/reorder`,
},
SERVICES: {
    BASE: `${V1}/services`,
    BY_ID: (id) => `${V1}/services/${id}`,
},
PROJECTS: {
    BASE: `${V1}/projects`,
    BY_ID: (id) => `${V1}/projects/${id}`,
    FILTERS: `${V1}/projects/filters`,
},
ENQUIRIES: {
    BASE: `${V1}/enquiries`,
    BY_ID: (id) => `${V1}/enquiries/${id}`,
},

// REMOVE these endpoint groups:
FOOD_ITEMS, STORE_ITEM_CONFIGS, STORE_MERCHANDISE_CONFIGS,
CATEGORIES, SUB_CATEGORIES, ADDONS, ADDON_GROUPS, COMBOS,
MERCHANDISE, BANNERS, ABOUT_US, STORES, GIFT_CARD_*,
ORDERS, OFFERS, NOTIFICATION_*, DASHBOARD (recreate), LOYALTY
```

### Step 4.6: Update `admin/src/config.js`
```js
module.exports = {
    api: {
        API_URL:
            process.env.NODE_ENV === "production"
                ? (process.env.REACT_APP_API_URL_PROD || "https://portfolio-api.yourdomain.com")
                : (process.env.REACT_APP_API_URL_DEV || "http://localhost:7005"),
    },
};
```

---

## Section 5: Admin Panel — Create Portfolio Management Pages

### Step 5.1: Create `admin/src/api/portfolio.api.js`
New API service files:
- `siteSettings.api.js` — CRUD for site settings
- `teamMembers.api.js` — CRUD for team members
- `services.api.js` — CRUD for services
- `projects.api.js` — CRUD for projects
- `enquiries.api.js` — CRUD + status update for enquiries
- `portfolioDashboard.api.js` — dashboard analytics

### Step 5.2: Create Site Settings Page
```
admin/src/pages/Portfolio/SiteSettings.js
Layout:
  - BreadCrumb: "Portfolio > Site Settings"
  - Card with tabs:
    * Hero Section: heroTitle, heroSubtitle, heroTagline1, heroTagline2
    * Capabilities: capabilitiesTitle, capabilitiesSubtitle, capabilitiesDescription
    * CTA Banner: ctaBannerTitle, ctaBannerDescription, ctaButtonText
    * Origin Story: originTitle, originText (textarea/rich text)
    * Live Feed: liveFeedTitle, liveFeedEntries (dynamic array with add/remove)
    * Footer: footerText, footerStatusText
    * Enquire Page: enquireTitle, enquireDescription, enquireButtonText
    * Navigation: navItems (sortable list with key, label, type)
    * Social Links: socialLinks (dynamic array)
    * SEO: metaTitle, metaDescription, favicon upload
  - Single "Save" button (upsert pattern)
  - Uses FormUpdateFooter component
```

### Step 5.3: Create Team Members Page
```
admin/src/pages/Portfolio/TeamMembers.js
Layout:
  - BreadCrumb: "Portfolio > Team Members"
  - DataTable with columns: Avatar (thumbnail), Name, Role, Active toggle, Order, Actions
  - "Add Member" button opens modal
  - Modal with multiple sections (accordion or tabs):
    * Basic: name, role, bio, accent color picker, glow color picker
    * Avatar: ImageUploader for avatar
    * Personal: location, email, phone, website, languages (tag input)
    * Education: dynamic array (degree, school, year) with add/remove rows
    * Experience: dynamic array (company, role, period, desc)
    * Skills: dynamic array (name, level slider 0-100)
    * Projects: dynamic array (title, type, link, tags)
    * Certificates: dynamic array of strings
    * Social Links: dynamic array (platform dropdown, url)
  - Reorder via drag-and-drop or displayOrder field
  - Uses existing: AuthContext, MenuContext, DeleteModal, FormAddFooter, FormUpdateFooter
```

### Step 5.4: Create Services Page
```
admin/src/pages/Portfolio/Services.js
Layout:
  - BreadCrumb: "Portfolio > Services"
  - DataTable: Category, Title, Icon, Active, Order, Actions
  - Modal form: category, title, iconName (text/dropdown), iconColor, desc, features (tag input), tech (tag input), accent color
  - Standard CRUD pattern
```

### Step 5.5: Create Projects Page
```
admin/src/pages/Portfolio/Projects.js
Layout:
  - BreadCrumb: "Portfolio > Projects"
  - DataTable: Title, Tech, Type, Impact, Status (badge), Active, Actions
  - Modal form: title, tech, type, impact, status (dropdown), desc, image upload, link, filterTags (multi-select)
  - Standard CRUD pattern
```

### Step 5.6: Create Enquiries Page
```
admin/src/pages/Portfolio/Enquiries.js
Layout:
  - BreadCrumb: "Portfolio > Enquiries"
  - DataTable: Name, Email, Date, Status (badge: NEW=info, READ=warning, REPLIED=success, ARCHIVED=secondary)
  - Click row to open detail modal (read-only message, status dropdown, admin notes textarea)
  - Status filter tabs: All | New | Read | Replied | Archived
  - No create button (enquiries come from public form)
```

### Step 5.7: Repurpose Dashboard
```
admin/src/pages/Dashboard/Dashboard.js
Replace restaurant dashboard with portfolio dashboard:
  - Stat cards: Total Team Members, Total Projects, Total Services, New Enquiries
  - Recent enquiries table (last 5)
  - Content overview (active vs inactive counts)
  - Quick links to management pages
```

---

## Section 6: Admin Panel — Update Sidebar Menu & Config

### Step 6.1: Seed Portfolio Menu Groups in Database
The admin uses DB-driven menus (MenuContext). Need to create menu entries:
```
Menu Groups:
  1. "Portfolio Content" (icon: ri-palette-line)
     Menus:
       - Site Settings (/site-settings)
       - Team Members (/team-members)
       - Services (/services)
       - Projects (/projects)
       - Enquiries (/enquiries)
  
  2. "System Setup" (icon: ri-settings-3-line)
     Menus:
       - Company Details (/company-details)
       - Employees (/employee)
       - Employee Roles (/employee-roles)
       - Role Master (/role-master)
  
  3. "Email CMS" (icon: ri-mail-settings-line)
     Menus:
       - Email Setup (/email-setup)
       - Email For (/email-for)
       - Email Templates (/email-template)
  
  4. "Master Data" (icon: ri-database-2-line) [SuperAdmin only]
     Menus:
       - Menu Master (/menu-master)
       - Menu Group (/menu-group)
       - Country (/country)
       - State (/state)
       - City (/city)
       - Currency Master (/currency-master)
       - Login Logs (/login-attempt-logs)
```

### Step 6.2: Create Seed Script
```
server/seeds/portfolioMenuSeed.js
- Connects to MongoDB
- Creates the menu groups and menus above
- Assigns all permissions to ADMIN role
- Run once: `node seeds/portfolioMenuSeed.js`
```

### Step 6.3: Update LayoutMenuData.js (Fallback)
The massive hardcoded `LayoutMenuData.js` acts as fallback when DB menus aren't loaded. Replace its content with a minimal portfolio-focused menu structure matching the DB-driven menus above.

---

## Section 7: Frontend Integration (Future Phase — After Backend+Admin are Working)

> **NOTE:** This section is for FUTURE execution. Do NOT modify frontend yet. Keep static data as fallback.

### Step 7.1: Add API Client to Frontend
```
front/src/api/index.js
- Simple fetch wrapper (no auth needed for public endpoints)
- Base URL from env variable
- Error handling
```

### Step 7.2: Create Data Hooks
```
front/src/hooks/usePortfolioData.js
- useSiteSettings() — fetches site settings, falls back to hardcoded defaults
- useTeamMembers() — fetches team, falls back to data/team.js
- useServices() — fetches services, falls back to data/services.js
- useProjects() — fetches projects, falls back to data/projects.js
- Each hook: loading state, error handling, fallback to static data
```

### Step 7.3: Update Pages to Use Dynamic Data
- HomePage.jsx: Replace TEAM import with useTeamMembers(), replace hardcoded text with useSiteSettings()
- ArchivePage.jsx: Replace ARCHIVE_PROJECTS with useProjects()
- MemberPage.jsx: Already driven by props (no change needed)
- EnquirePage.jsx: Wire form submission to POST /api/v1/enquiries, use dynamic text from useSiteSettings()
- Navbar.jsx: Use navItems from useSiteSettings()
- Footer.jsx: Use footerText from useSiteSettings()

### Step 7.4: Keep Static Data as Fallback
The existing data/ files remain untouched. Hooks fall back to them if API is unreachable:
```js
const useTeamMembers = () => {
  const [data, setData] = useState(STATIC_TEAM); // fallback
  useEffect(() => {
    fetch(`${API_URL}/api/v1/team-members`)
      .then(res => res.json())
      .then(json => { if (json.isOk && json.data.length) setData(json.data); })
      .catch(() => {}); // silently fall back to static
  }, []);
  return data;
};
```

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `server/models/SiteSettings.js` | Create | Site-wide settings schema |
| `server/models/TeamMember.js` | Create | Team member profiles schema |
| `server/models/Service.js` | Create | Services/capabilities schema |
| `server/models/Project.js` | Create | Projects/archive schema |
| `server/models/Enquiry.js` | Create | Contact form submissions schema |
| `server/controllers/v1/SiteSettingsController.js` | Create | CRUD for site settings |
| `server/controllers/v1/TeamMemberController.js` | Create | CRUD for team members |
| `server/controllers/v1/ServiceController.js` | Create | CRUD for services |
| `server/controllers/v1/ProjectController.js` | Create | CRUD for projects |
| `server/controllers/v1/EnquiryController.js` | Create | CRUD for enquiries |
| `server/routes/v1/SiteSettingsRoutes.js` | Create | Site settings routes |
| `server/routes/v1/TeamMemberRoutes.js` | Create | Team member routes |
| `server/routes/v1/ServiceRoutes.js` | Create | Service routes |
| `server/routes/v1/ProjectRoutes.js` | Create | Project routes |
| `server/routes/v1/EnquiryRoutes.js` | Create | Enquiry routes |
| `server/seeds/portfolioMenuSeed.js` | Create | DB seed for admin menus |
| `server/server.js` | Modify | Remove restaurant references |
| `server/package.json` | Modify | Rename to portfolio-server |
| `admin/src/pages/Portfolio/SiteSettings.js` | Create | Site settings management |
| `admin/src/pages/Portfolio/TeamMembers.js` | Create | Team member CRUD |
| `admin/src/pages/Portfolio/Services.js` | Create | Service CRUD |
| `admin/src/pages/Portfolio/Projects.js` | Create | Project CRUD |
| `admin/src/pages/Portfolio/Enquiries.js` | Create | Enquiry management |
| `admin/src/api/siteSettings.api.js` | Create | Site settings API calls |
| `admin/src/api/teamMembers.api.js` | Create | Team member API calls |
| `admin/src/api/services.api.js` | Create | Service API calls |
| `admin/src/api/projects.api.js` | Create | Project API calls |
| `admin/src/api/enquiries.api.js` | Create | Enquiry API calls |
| `admin/src/api/endpoints.js` | Modify | Add portfolio, remove restaurant endpoints |
| `admin/src/Routes/allRoutes.js` | Modify | Remove restaurant routes, add portfolio |
| `admin/src/config.js` | Modify | Update API URL references |
| `admin/src/Layouts/LayoutMenuData.js` | Modify | Replace with portfolio menu fallback |
| `admin/src/pages/Dashboard/Dashboard.js` | Modify | Portfolio dashboard |
| ~30 restaurant model files | Delete | Remove restaurant models |
| ~16 restaurant controller files | Delete | Remove restaurant controllers |
| ~15 restaurant route files | Delete | Remove restaurant routes |
| ~20 restaurant admin pages | Delete | Remove restaurant admin pages |
| ~15 restaurant API files | Delete | Remove restaurant API services |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking admin auth after cleanup | Keep ALL auth-related files (AuthContext, authMiddleware, auth.api.js). Test login before and after. |
| Missing model dependencies | Use `referenceHelper.js` pattern — check references before deleting models. Run server after each batch of deletions. |
| DB-driven menu system breaks | Create seed script early. Keep LayoutMenuData.js as minimal fallback. |
| File upload breaks | Keep secureUpload.js middleware unchanged. Test avatar upload in TeamMembers. |
| Frontend breaks during transition | Do NOT modify frontend in Sections 1-6. Section 7 is future work with static fallback. |
| Loss of restaurant data | This is intentional. No restaurant data needed for portfolio. |

---

## Execution Order

**Phase A (Sections 1-2):** Backend cleanup + new models → Server should start clean
**Phase B (Section 3):** New controllers + routes → API should be testable
**Phase C (Sections 4-5):** Admin cleanup + new pages → Admin should work end-to-end
**Phase D (Section 6):** Menu seeding + sidebar → Full admin navigation
**Phase E (Section 7):** Frontend integration (FUTURE — after admin+backend stable)

---

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: N/A (external model unavailable)
- GEMINI_SESSION: N/A (external model unavailable)
