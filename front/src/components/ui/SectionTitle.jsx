import React from 'react';

/**
 * SectionTitle
 * -----------------------------------------------
 * Consistent heading block used across sections.
 *
 * Props:
 *   children  — heading text
 *   subtitle  — optional mono-font label above the bar
 */
const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-12">
    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
      {children}
    </h2>
    {subtitle && (
      <p className="text-blue-500 font-mono text-[10px] tracking-[0.3em] uppercase mt-2">
        {subtitle}
      </p>
    )}
    <div className="w-12 h-1 bg-blue-600 mt-4" />
  </div>
);

export default SectionTitle;
