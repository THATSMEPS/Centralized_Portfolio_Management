import React from 'react';

/**
 * DynamicBackground
 * -----------------------------------------------
 * Full-screen ambient background with gradient
 * blobs and a dot-grid overlay.
 */
const DynamicBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#020205]">
    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[140px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/5 blur-[140px]" />
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

export default DynamicBackground;
