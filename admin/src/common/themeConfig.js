/**
 * Centralized Theme Configuration
 * Edit colors here to update the entire admin panel branding.
 */

export const themeConfig = {
    // Primary Branding (Matched to the modern Slate/Blue palette)
    primary: '#2563eb', // Vibrant Blue (Blue 600)
    primaryRgb: '37 99 235',
    primaryHover: '#1d4ed8',

    // Supporting Colors
    secondary: '#0f172a', // Dark Slate (Slate 900)
    secondaryRgb: '15 23 42',
    success: '#10b981', // Emerald 500
    successRgb: '16 185 129',
    info: '#0ea5e9', // Sky 500
    infoRgb: '14 165 233',
    warning: '#f59e0b', // Amber 500
    warningRgb: '245 158 11',
    danger: '#ef4444', // Red 500
    dangerRgb: '239 68 68',

    // Background & Surfaces
    bg: '#f8fafc', // Slate 50 (Very light grayish blue)
    bgRgb: '248 250 252',
    surface: '#FFFFFF',
    surfaceRgb: '255 255 255',

    // Typography
    textMain: '#1e293b', // Slate 800
    textMainRgb: '30 41 59',
    textMuted: '#64748b', // Slate 500

    // UI Accents
    accent: '#3b82f6',
    mellow: '#f1f5f9', // Slate 100
    mellowRgb: '241 245 249',
    neutralLight: '#f1f5f9',
    neutralLightRgb: '241 245 249',
};

/**
 * Utility to apply theme variables to the document root
 */
export const applyTheme = () => {
    const root = document.documentElement;

    Object.entries(themeConfig).forEach(([key, value]) => {
        // Apply as generic variable (e.g. --primary)
        root.style.setProperty(`--${key}`, value);
    });

    // Map to framework-specific prefixes (Bootstrap & Velzon)
    const mappings = {
        // Core Colors
        "--bs-primary": themeConfig.primary,
        "--bs-primary-rgb": themeConfig.primaryRgb,
        "--bs-primary-hover": themeConfig.primaryHover,
        "--vz-primary": themeConfig.primary,
        "--vz-primary-rgb": themeConfig.primaryRgb.replace(/ /g, ", "),
        "--vz-primary-hover": themeConfig.primaryHover,

        "--bs-secondary": themeConfig.secondary,
        "--vz-secondary": themeConfig.secondary,

        "--bs-body-bg": themeConfig.bg,
        "--vz-body-bg": themeConfig.bg,

        "--bs-body-color": themeConfig.textMain,
        "--vz-body-color": themeConfig.textMain,

        "--vz-card-bg-custom": themeConfig.surface,

        // Layout & Sidebar (Matching the dark "AI Core" sidebar)
        "--vz-vertical-menu-bg": themeConfig.secondary,
        "--vz-vertical-menu-item-color": "#94a3b8", // Slate 400
        "--vz-vertical-menu-item-hover-color": "#ffffff",
        "--vz-vertical-menu-item-active-color": "#ffffff",
        "--vz-vertical-menu-title-color": "#64748b", // Slate 500

        "--vz-header-bg": themeConfig.surface,
        "--vz-header-item-color": themeConfig.textMain,

        // Premium Rounded Corners
        "--bs-border-radius": "12px",
        "--bs-border-radius-lg": "16px",
        "--bs-border-radius-sm": "8px",
        "--vz-card-border-radius": "12px",

        // Subtle Shadows
        "--bs-box-shadow": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "--vz-card-box-shadow": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",

        // Typography
        "--vz-font-sans-serif": "'Plus Jakarta Sans', sans-serif",
        "--bs-font-sans-serif": "'Plus Jakarta Sans', sans-serif",
    };

    Object.entries(mappings).forEach(([cssVar, val]) => {
        root.style.setProperty(cssVar, val);
    });

    // Global Overrides
    document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
};
