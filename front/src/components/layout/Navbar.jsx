import React from 'react';
import { useSiteSettings } from '../../hooks/usePortfolioData';
import { cn } from '../../utils/helpers';

/**
 * Navbar
 * -----------------------------------------------
 * Floating pill-style navigation bar.
 *
 * Props:
 *   view        — current active view key
 *   onNavigate  — (viewKey) => void
 */
const Navbar = ({ view, onNavigate }) => {
  const { data: settings } = useSiteSettings();
  const navItems = [...(settings.navItems || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  const links = navItems.filter((item) => item.type !== 'button');
  const buttons = navItems.filter((item) => item.type === 'button');

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-2xl">
      {links.map((item) => (
        <NavButton
          key={item.key}
          active={view === item.key}
          onClick={() => onNavigate(item.key)}
        >
          {item.label}
        </NavButton>
      ))}

      {buttons.length > 0 && <div className="w-px h-4 bg-white/20 mx-2" />}

      {buttons.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={cn(
            'px-6 py-2 rounded-full text-xs font-bold uppercase transition-all',
            view === item.key
              ? 'bg-white text-black'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

/**
 * Internal helper — standard nav pill button
 */
const NavButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-6 py-2 rounded-full text-xs font-bold uppercase transition-all',
      active
        ? 'bg-white text-black'
        : 'hover:bg-white/10 text-white/60'
    )}
  >
    {children}
  </button>
);

export default Navbar;
