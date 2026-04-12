import React from 'react';
import { Activity, Radio, Workflow } from 'lucide-react';
import { useSiteSettings, useTeamMembers, useServices } from '../hooks/usePortfolioData';
import ServiceCard from '../components/ui/ServiceCard';

/**
 * HomePage
 * -----------------------------------------------
 * The landing view — hero with team avatars,
 * capabilities section, and origin story block.
 *
 * Props:
 *   onSelectMember — (memberObj) => void
 *   onNavigate     — (viewKey) => void
 */
const HomePage = ({ onSelectMember, onNavigate }) => {
  const { data: settings } = useSiteSettings();
  const { data: team } = useTeamMembers();
  const { data: services } = useServices();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── HERO ─── */}
      <HeroSection team={team} settings={settings} onSelectMember={onSelectMember} />

      {/* ─── CAPABILITIES ─── */}
      <CapabilitiesSection services={services} settings={settings} onNavigate={onNavigate} />

      {/* ─── ORIGIN STORY + LIVE FEED ─── */}
      <StorySection settings={settings} />
    </div>
  );
};

/* ======================================================
   Sub-sections (private to this file)
   ====================================================== */

const HeroSection = ({ team, settings, onSelectMember }) => (
  <section className="h-screen flex flex-col items-center justify-center px-10 relative">
    <div className="text-center mb-16 animate-in fade-in zoom-in duration-1000">
      <h1 className="text-[14vw] leading-[0.75] font-black tracking-tighter mix-blend-difference mb-6">
        {settings.heroTitle}<br />
        <span className="text-outline text-transparent">{settings.heroSubtitle}</span>
      </h1>
      <div className="flex items-center justify-center gap-4 text-gray-500 font-mono tracking-[0.4em] uppercase text-[10px]">
        <span>{settings.heroTagline1}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span>{settings.heroTagline2}</span>
      </div>
    </div>

    <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
      {team.map((m) => (
        <div
          key={m._id || m.id}
          onClick={() => onSelectMember(m)}
          className="group cursor-pointer relative"
        >
          <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-full border border-white/5 p-2 transition-all duration-700 group-hover:border-blue-500/50 relative overflow-hidden bg-white/[0.02] backdrop-blur-xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${m.accent} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <img
              src={m.avatar}
              alt={m.name}
              className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-700 object-cover scale-110 group-hover:scale-100"
            />
          </div>
          <div className="mt-6 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <h3 className="text-xl font-black italic">{m.name}</h3>
            <p className="text-blue-500 font-mono text-[10px] uppercase font-bold tracking-widest">
              {m.role}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const CapabilitiesSection = ({ services, settings, onNavigate }) => (
  <section className="py-32 px-10 lg:px-24 bg-white/[0.01] border-y border-white/5">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10">
        <div className="max-w-2xl">
          <p className="text-blue-500 font-mono text-xs uppercase tracking-[0.4em] mb-4 font-black">
            {settings.capabilitiesLabel}
          </p>
          <h2 className="text-6xl lg:text-7xl font-black italic tracking-tighter leading-tight uppercase whitespace-pre-line">
            {settings.capabilitiesTitle}
          </h2>
        </div>
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest max-w-sm text-left lg:text-right">
          {settings.capabilitiesDescription}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard key={service._id || service.id} service={service} />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-20 p-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-[32px]">
        <div className="bg-[#05050a] rounded-[30px] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Workflow className="text-blue-400" size={24} />
            </div>
            <div>
              <h4 className="text-xl font-black italic uppercase">{settings.ctaBannerTitle}</h4>
              <p className="text-gray-500 text-sm">{settings.ctaBannerDescription}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('enquire')}
            className="px-10 py-4 bg-white text-black font-black italic uppercase text-xs rounded-full hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap"
          >
            {settings.ctaButtonText}
          </button>
        </div>
      </div>
    </div>
  </section>
);

const StorySection = ({ settings }) => (
  <section className="py-32 px-10 lg:px-24">
    {/* Origin Text + Visual */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-32">
      <div className="lg:col-span-5">
        <p className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-6 font-bold">
          {settings.originLabel}
        </p>
        <h2 className="text-6xl font-black italic tracking-tighter mb-8 leading-tight whitespace-pre-line">
          {settings.originTitle}
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          {settings.originText}
        </p>
      </div>
      <div className="lg:col-span-7 flex items-center justify-center">
        <div className="relative w-full aspect-video rounded-[40px] bg-white/5 border border-white/10 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity
              size={80}
              className="text-white/10 group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div className="absolute bottom-8 left-8">
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              Global Ops Node
            </p>
            <p className="text-xl font-black italic">ACTIVE_SESSION.v2</p>
          </div>
        </div>
      </div>
    </div>

    {/* Live Feed */}
    <div className="bg-black/40 rounded-[40px] border border-white/5 p-8 lg:p-16">
      <div className="flex flex-col lg:flex-row justify-between gap-12">
        <div className="max-w-md">
          <div className="flex items-center gap-2 text-blue-500 mb-6">
            <Radio size={16} className="animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-black">
              Live Pulse
            </span>
          </div>
          <h3 className="text-4xl font-black italic tracking-tighter mb-4 whitespace-pre-line">
            {settings.liveFeedTitle}
          </h3>
        </div>
        <div className="flex-1 bg-black/40 rounded-3xl p-8 border border-white/5 h-[300px] overflow-hidden relative font-mono text-xs">
          <div className="space-y-6 animate-feed">
            {(settings.liveFeedEntries || []).map((entry, i) => (
              <p key={i} className={entry.color || 'text-gray-500'}>
                {entry.text}
              </p>
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black opacity-60" />
        </div>
      </div>
    </div>
  </section>
);

export default HomePage;
