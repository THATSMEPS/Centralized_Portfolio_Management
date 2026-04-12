/**
 * Centralized Theme Configuration
 * Edit colors here to update the entire admin panel branding.
 */

export const themeConfig = {
    // Primary Branding (Matched to your logo/image)
    primary: '#004B96',
    primaryRgb: '0 75 150',
    primaryHover: '#003a75',

    // Supporting Colors
    secondary: '#000000',
    secondaryRgb: '0 0 0',
    success: '#0ab39c',
    successRgb: '10 179 156',
    info: '#299cdb',
    infoRgb: '41 156 219',
    warning: '#f7b84b',
    warningRgb: '247 184 75',
    danger: '#ef4444',
    dangerRgb: '239 68 68',

    // Background & Surfaces
    bg: '#f3f3f9',
    bgRgb: '243 243 249',
    surface: '#FFFFFF',
    surfaceRgb: '255 255 255',
    
    // Typography
    textMain: '#212529',
    textMainRgb: '33 37 41',
    textMuted: '#878a99',
    
    // UI Accents
    accent: '#3577f1',
    mellow: '#f3f6f9',
    mellowRgb: '243 246 249',
    neutralLight: '#f3f3f9',
    neutralLightRgb: '243 243 249',
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
        "--bs-primary": themeConfig.primary,
        "--bs-primary-rgb": themeConfig.primaryRgb,
        "--bs-primary-hover": themeConfig.primaryHover,
        "--vz-primary": themeConfig.primary,
        "--vz-primary-rgb": themeConfig.primaryRgb.replace(/ /g, ","),
        "--vz-primary-hover": themeConfig.primaryHover,
        
        "--bs-secondary": themeConfig.secondary,
        "--vz-secondary": themeConfig.secondary,
        
        "--bs-body-bg": themeConfig.bg,
        "--vz-body-bg": themeConfig.bg,
        
        "--bs-body-color": themeConfig.textMain,
        "--vz-body-color": themeConfig.textMain,

        "--vz-card-bg-custom": themeConfig.surface,
    };

    Object.entries(mappings).forEach(([cssVar, val]) => {
        root.style.setProperty(cssVar, val);
    });
};
