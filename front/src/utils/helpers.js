/**
 * Utility / Helper Functions
 * -----------------------------------------------
 * Pure, reusable functions used across the app.
 */

/**
 * Conditionally join class names.
 * Filters out falsy values so you can do:
 *   cn('base', isActive && 'active', className)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Split a full name into first / last for display.
 */
export function splitName(fullName) {
  const parts = fullName.split(' ');
  return {
    first: parts[0] || '',
    last: parts.slice(1).join(' ') || '',
  };
}

/**
 * Generate a personnel reference string.
 */
export function personnelRef(id) {
  const short = String(id).slice(-6).toUpperCase();
  return `NEB-${short}`;
}
