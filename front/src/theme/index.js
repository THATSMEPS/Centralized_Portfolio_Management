/**
 * Theme Configuration
 * --------------------------------------------------
 * Central source of truth for all design tokens.
 * Import this wherever you need brand-consistent values.
 * When we build an admin panel, these can be swapped
 * dynamically via a ThemeProvider / context.
 */

const theme = {
  colors: {
    // Core palette
    background: '#020205',
    backgroundAlt: '#05050a',
    surface: 'rgba(255, 255, 255, 0.02)',
    surfaceHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.05)',
    borderHover: 'rgba(255, 255, 255, 0.2)',

    // Brand accent
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      glow: 'rgba(59, 130, 246, 0.2)',
    },

    // Semantic accents
    accent: {
      blue: { base: 'blue', gradient: 'from-blue-600 to-cyan-400', glow: 'rgba(6, 182, 212, 0.4)' },
      purple: { base: 'purple', gradient: 'from-purple-600 to-pink-500', glow: 'rgba(217, 70, 239, 0.4)' },
      emerald: { base: 'emerald', gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.4)' },
    },

    // Text
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.6)',
      muted: '#6b7280', // gray-500
      link: '#3b82f6',
    },
  },

  fonts: {
    // Can be swapped for Google Fonts or custom typefaces
    heading: 'inherit', // falls back to Tailwind sans
    body: 'inherit',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  spacing: {
    sectionPadding: 'py-32 px-10 lg:px-24',
    containerMax: 'max-w-7xl mx-auto',
    cardRadius: 'rounded-[40px]',
    buttonRadius: 'rounded-full',
  },

  animation: {
    duration: {
      fast: '300ms',
      normal: '500ms',
      slow: '700ms',
      verySlow: '1000ms',
    },
    easing: 'ease-out',
  },

  nav: {
    labels: [
      { key: 'home', label: 'Collective' },
      { key: 'projects', label: 'Archive' },
      { key: 'enquire', label: 'Enquire' },
    ],
  },
};

export default theme;
