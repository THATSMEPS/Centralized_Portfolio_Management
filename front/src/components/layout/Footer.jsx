import React from 'react';
import { useSiteSettings } from '../../hooks/usePortfolioData';

/**
 * Footer
 * -----------------------------------------------
 * Minimalist footer with dynamic text and social links.
 */
const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="relative z-10 border-t border-white/5 py-12 px-10 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          © {new Date().getFullYear()} {settings.footerText}
        </p>
        <div className="flex items-center gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
            {settings.footerStatusText}
          </span>
        </div>
      </div>
      {(settings.socialLinks || []).length > 0 && (
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 mt-6">
          {settings.socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
            >
              {link.platform}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
};

export default Footer;
