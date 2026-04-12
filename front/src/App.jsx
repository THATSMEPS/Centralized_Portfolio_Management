import React, { useState } from 'react';

// Layout
import { DynamicBackground, Navbar, Footer } from './components/layout';

// Pages
import { HomePage, ArchivePage, EnquirePage, MemberPage } from './pages';

// Theme animations (keyframes, text-outline, etc.)
import './theme/animations.css';

/**
 * App — Root Shell
 * -----------------------------------------------
 * Owns top-level view state & routing.
 * Every section is a standalone page module.
 */
export default function App() {
  const [view, setView] = useState('home');
  const [activeMember, setActiveMember] = useState(null);

  /** Navigate to a view (resets member when going home) */
  const handleNavigate = (viewKey) => {
    setView(viewKey);
    if (viewKey === 'home') setActiveMember(null);
  };

  /** Select a team member → open dossier */
  const handleSelectMember = (member) => {
    setActiveMember(member);
    setView('member');
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <DynamicBackground />

      {/* Global nav — hidden on member dossier (has its own back-bar) */}
      {view !== 'member' && (
        <Navbar view={view} onNavigate={handleNavigate} />
      )}

      <main className="relative z-10 w-full">
        {view === 'home' && (
          <HomePage
            onSelectMember={handleSelectMember}
            onNavigate={handleNavigate}
          />
        )}

        {view === 'projects' && <ArchivePage />}

        {view === 'enquire' && <EnquirePage />}

        {view === 'member' && activeMember && (
          <MemberPage
            member={activeMember}
            onClose={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Footer — hidden on member page */}
      {view !== 'member' && <Footer />}
    </div>
  );
}
