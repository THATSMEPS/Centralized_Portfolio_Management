import { Navigate } from "react-router-dom";
import Login from "../pages/Authentication/Login";
import UserProfile from "../pages/Authentication/user-profile";
import CompanyDetails from "../pages/Setup/CompanyDetails";

// Portfolio Content Management
import TeamMembers from "../pages/Portfolio/TeamMembers";
import MemberExperience from "../pages/Portfolio/team/MemberExperience";
import MemberProjects from "../pages/Portfolio/team/MemberProjects";
import MemberAchievements from "../pages/Portfolio/team/MemberAchievements";
import Services from "../pages/Portfolio/Services";
import Projects from "../pages/Portfolio/Projects";
import Enquiries from "../pages/Portfolio/Enquiries";

// Site Settings (individual sections)
import HeroSettings from "../pages/Portfolio/settings/HeroSettings";
import CapabilitiesSettings from "../pages/Portfolio/settings/CapabilitiesSettings";
import CtaBannerSettings from "../pages/Portfolio/settings/CtaBannerSettings";
import OriginStorySettings from "../pages/Portfolio/settings/OriginStorySettings";
import LiveFeedSettings from "../pages/Portfolio/settings/LiveFeedSettings";
import FooterSettings from "../pages/Portfolio/settings/FooterSettings";
import EnquirePageSettings from "../pages/Portfolio/settings/EnquirePageSettings";
import NavigationSettings from "../pages/Portfolio/settings/NavigationSettings";
import SocialLinksSettings from "../pages/Portfolio/settings/SocialLinksSettings";
import SeoSettings from "../pages/Portfolio/settings/SeoSettings";

// Dashboard
import Dashboard from "../pages/Dashboard/Dashboard";

// Master Data
import Country from "../pages/Master/Country";
import State from "../pages/Master/State";
import City from "../pages/Master/City";
import RoleMaster from "../pages/Master/RoleMaster";
import CurrencyMaster from "../pages/Master/CurrencyMaster";
import MenuGroup from "../pages/Master/MenuGroup";
import MenuMaster from "../pages/Master/MenuMaster";
import LoginAttemptLogs from "../pages/Master/LoginAttemptLogs";

// Setup
import EmployeeRoles from "../pages/Setup/EmployeeRoles";
import Employee from "../pages/Setup/Employee";

// CMS
import EmailSetup from "../pages/CMS/EmailSetup";
import EmailFor from "../pages/CMS/EmailFor";
import EmailTemplate from "../pages/CMS/EmailTemplate";

const authProtectedRoutes = [
    // Dashboard
    { path: "/dashboard", component: <Dashboard /> },

    // Portfolio Content Management
    { path: "/team-members", component: <TeamMembers />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/team/experience", component: <MemberExperience />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/team/projects", component: <MemberProjects />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/team/achievements", component: <MemberAchievements />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/services", component: <Services />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/projects", component: <Projects />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/enquiries", component: <Enquiries />, allowedRoles: ["ADMIN", "SUPERADMIN"] },

    // Site Settings (individual sections)
    { path: "/settings/hero", component: <HeroSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/capabilities", component: <CapabilitiesSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/cta-banner", component: <CtaBannerSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/origin-story", component: <OriginStorySettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/live-feed", component: <LiveFeedSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/footer", component: <FooterSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/enquire-page", component: <EnquirePageSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/navigation", component: <NavigationSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/social-links", component: <SocialLinksSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/settings/seo", component: <SeoSettings />, allowedRoles: ["ADMIN", "SUPERADMIN"] },

    // System Setup
    { path: "/profile", component: <UserProfile /> },
    { path: "/company-details", component: <CompanyDetails />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/employee", component: <Employee />, allowedRoles: ["ADMIN", "SUPERADMIN"] },
    { path: "/employee-roles", component: <EmployeeRoles />, allowedRoles: ["ADMIN", "SUPERADMIN"] },

    // Master Data
    { path: "/country", component: <Country /> },
    { path: "/state", component: <State /> },
    { path: "/city", component: <City /> },
    { path: "/role-master", component: <RoleMaster /> },
    { path: "/currency-master", component: <CurrencyMaster /> },
    { path: "/menu-master", component: <MenuMaster /> },
    { path: "/menu-group", component: <MenuGroup /> },
    { path: "/login-attempt-logs", component: <LoginAttemptLogs /> },

    // Email CMS
    { path: "/email-setup", component: <EmailSetup /> },
    { path: "/email-for", component: <EmailFor /> },
    { path: "/email-template", component: <EmailTemplate /> },

    // Defaults
    {
        path: "/",
        exact: true,
        component: <Navigate to="/dashboard" />,
    },
    {
        path: "*",
        component: <Navigate to="/dashboard" />,
    },
];

const publicRoutes = [
    { path: "/", component: <Login /> },
    { path: "/login", component: <Login /> },
];

export { authProtectedRoutes, publicRoutes };
