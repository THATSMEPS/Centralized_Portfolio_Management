/**
 * API Endpoint Constants
 * All API endpoints defined in one place for easy maintenance
 */

const V1 = "/api/v1";

export const ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        COMPANY_LOGIN: `${V1}/auth/company/login`,
        EMPLOYEE_LOGIN: `${V1}/auth/employee/login`,
        ME: `${V1}/auth/me`,
        OTP_SEND: `${V1}/auth/otp/send`,
        OTP_VERIFY: `${V1}/auth/otp/verify`,
        PASSWORD_RESET: `${V1}/auth/password/reset`,
        LOGIN_STATUS_BY_EMAIL: `${V1}/auth/login-status-by-email`,
        LOGIN_STATUS: (userId) => `${V1}/auth/login-status/${userId}`,
    },

    // Company endpoints
    COMPANIES: {
        BASE: `${V1}/companies`,
        BY_ID: (id) => `${V1}/companies/${id}`,
    },

    // ========== PORTFOLIO CONTENT ==========
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
        STATS: `${V1}/enquiries/stats`,
    },
    DASHBOARD: {
        ANALYTICS: `${V1}/admin/dashboard/analytics`,
    },

    // ========== SYSTEM / INFRASTRUCTURE ==========
    EMPLOYEES: {
        BASE: `${V1}/employees`,
        BY_ID: (id) => `${V1}/employees/${id}`,
        SEARCH: `${V1}/employees/search`,
        RESET_PASSWORD: (id) => `${V1}/employees/${id}/reset-password`,
    },

    COUNTRIES: {
        BASE: `${V1}/countries`,
        BY_ID: (id) => `${V1}/countries/${id}`,
        SEARCH: `${V1}/countries/search`,
        STATES: (countryId) => `${V1}/countries/${countryId}/states`,
    },

    STATES: {
        BASE: `${V1}/states`,
        BY_ID: (id) => `${V1}/states/${id}`,
        SEARCH: `${V1}/states/search`,
        CITIES: (stateId) => `${V1}/states/${stateId}/cities`,
    },

    CITIES: {
        BASE: `${V1}/cities`,
        BY_ID: (id) => `${V1}/cities/${id}`,
        SEARCH: `${V1}/cities/search`,
    },

    LOCATIONS: {
        BASE: `${V1}/locations`,
    },

    MENU_GROUPS: {
        BASE: `${V1}/menu-groups`,
        BY_ID: (id) => `${V1}/menu-groups/${id}`,
        SEARCH: `${V1}/menu-groups/search`,
        REORDER: `${V1}/menu-groups/reorder`,
    },

    MENUS: {
        BASE: `${V1}/menus`,
        BY_ID: (id) => `${V1}/menus/${id}`,
        SEARCH: `${V1}/menus/search`,
        BY_GROUPS: `${V1}/menus/by-groups`,
    },

    ROLES: {
        BASE: `${V1}/roles`,
        BY_ID: (id) => `${V1}/roles/${id}`,
        SEARCH: `${V1}/roles/search`,
    },

    CURRENCIES: {
        BASE: `${V1}/currencies`,
        BY_ID: (id) => `${V1}/currencies/${id}`,
        SEARCH: `${V1}/currencies/search`,
    },

    EMAIL_SETUPS: {
        BASE: `${V1}/email-setups`,
        BY_ID: (id) => `${V1}/email-setups/${id}`,
        SEARCH: `${V1}/email-setups/search`,
    },

    EMAIL_FOR: {
        BASE: `${V1}/email-for`,
        BY_ID: (id) => `${V1}/email-for/${id}`,
        SEARCH: `${V1}/email-for/search`,
    },

    EMAIL_TEMPLATES: {
        BASE: `${V1}/email-templates`,
        BY_ID: (id) => `${V1}/email-templates/${id}`,
        SEARCH: `${V1}/email-templates/search`,
        UPLOAD_SIGNATURE: `${V1}/email-templates/upload-signature`,
    },

    EMPLOYEE_ROLES: {
        BASE: `${V1}/employee-roles`,
        BY_ID: (id) => `${V1}/employee-roles/${id}`,
    },

    ADMIN: {
        LOGIN_ATTEMPTS: `${V1}/admin/auth/login-attempts`,
        RESET_ATTEMPTS: `${V1}/admin/auth/reset-attempts`,
        UNLOCK_ACCOUNT: `${V1}/admin/auth/unlock`,
        BLOCK_USER: `${V1}/admin/auth/block`,
        UNBLOCK_USER: `${V1}/admin/auth/unblock`,
    },
};

export default ENDPOINTS;
