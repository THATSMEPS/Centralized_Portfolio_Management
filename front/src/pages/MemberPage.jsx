import React from 'react';
import {
  X,
  Link2,
  Code2,
  Mail,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { splitName, personnelRef } from '../utils/helpers';

/**
 * MemberPage
 * -----------------------------------------------
 * Full dossier / detail view for a team member.
 *
 * Props:
 *   member    — the member object from data/team.js
 *   onClose   — () => void  (goes back to home)
 */
const MemberPage = ({ member, onClose }) => {
  const { first, last } = splitName(member.name);
  const personal = member.personal || {};
  const memberId = member._id || member.id;

  return (
    <div className="min-h-screen bg-[#020205] relative overflow-hidden animate-in fade-in duration-700">
      {/* Background Blur */}
      <div
        className="fixed top-0 right-0 w-[50%] h-screen opacity-20 blur-[120px] pointer-events-none"
        style={{ backgroundColor: member.glow }}
      />

      {/* Header / Nav Back */}
      <div className="fixed top-0 inset-x-0 h-24 px-10 flex items-center justify-between z-[110] bg-black/20 backdrop-blur-md border-b border-white/5">
        <button
          onClick={onClose}
          className="flex items-center gap-3 text-white/40 hover:text-white transition-colors group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Close Dossier
          </span>
        </button>
        <div className="text-right">
          <p className="text-xs font-mono text-gray-500">
            Personnel Ref: {personnelRef(memberId)}
          </p>
        </div>
      </div>

      <div className="pt-32 pb-24 px-10 lg:px-24 max-w-7xl mx-auto">
        {/* ─── Profile Header ─── */}
        <ProfileHeader member={member} first={first} last={last} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Left Sidebar Info */}
          <div className="lg:col-span-4 space-y-12">
            <PersonalDetails member={member} />
            <SkillMatrix member={member} />
            <EducationTimeline member={member} />
          </div>

          {/* Main Column Details */}
          <div className="lg:col-span-8 space-y-24">
            <BioSection bio={member.bio} />
            <ExperienceLedger experience={member.experience} />
            <ProjectsGrid projects={member.projects} />
            <CertificatesSection certificates={member.certificates} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   Private sub-components
   ====================================================== */

const ProfileHeader = ({ member, first, last }) => (
  <div className="flex flex-col lg:flex-row gap-16 mb-24 items-end">
    <div className="relative group">
      <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-[40px] overflow-hidden border border-white/10 bg-white/5 relative z-10">
        <img
          src={member.avatar}
          alt=""
          className="w-full h-full object-cover scale-110 grayscale group-hover:grayscale-0 transition-all duration-700"
        />
      </div>
      <div className={`absolute -inset-4 bg-gradient-to-br ${member.accent} opacity-20 blur-2xl -z-0`} />
    </div>
    <div className="flex-1">
      <h2 className="text-7xl lg:text-9xl font-black italic tracking-tighter text-white mb-4 leading-none">
        {first}<br />{last}
      </h2>
      <p className={`text-transparent bg-clip-text bg-gradient-to-r ${member.accent} font-mono text-sm font-black uppercase tracking-[0.4em] mb-6`}>
        {member.role}
      </p>
      <div className="flex gap-4">
        <IconButton><Link2 size={20} /></IconButton>
        <IconButton><Code2 size={20} /></IconButton>
        <IconButton><Mail size={20} /></IconButton>
      </div>
    </div>
  </div>
);

const IconButton = ({ children }) => (
  <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    {children}
  </button>
);

const PersonalDetails = ({ member }) => {
  const personal = member.personal || {};
  const languages = personal.languages || [];
  return (
    <div>
      <h4 className="text-blue-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-6 font-bold">
        Personal Parameters
      </h4>
      <ul className="space-y-4">
        {personal.location && <DetailRow label="Origin" value={personal.location} />}
        {personal.email && <DetailRow label="Email" value={personal.email} />}
        {languages.length > 0 && <DetailRow label="Languages" value={languages.join(' / ')} />}
      </ul>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <li className="flex justify-between border-b border-white/5 pb-2">
    <span className="text-gray-500 text-xs">{label}</span>
    <span className="text-white text-xs font-bold">{value}</span>
  </li>
);

const SkillMatrix = ({ member }) => {
  const skills = member.skills || [];
  if (skills.length === 0) return null;
  return (
  <div>
    <h4 className="text-blue-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-6 font-bold">
      Skill Matrix
    </h4>
    <div className="space-y-6">
      {skills.map((skill) => (
        <div key={skill.name}>
          <div className="flex justify-between text-[10px] mb-2 font-mono uppercase">
            <span>{skill.name}</span>
            <span>{skill.level}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${member.accent} transition-all duration-1000`}
              style={{ width: `${skill.level}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

const EducationTimeline = ({ member }) => {
  const education = member.education || [];
  if (education.length === 0) return null;
  return (
    <div>
      <h4 className="text-blue-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-6 font-bold">
        Education Timeline
      </h4>
      <div className="space-y-6">
        {education.map((edu, i) => (
          <div key={i} className="flex gap-4">
            <div className="text-xs font-mono text-gray-500 pt-1">{edu.year}</div>
            <div>
              <p className="text-sm font-bold text-white">{edu.degree}</p>
              <p className="text-xs text-gray-500">{edu.school}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BioSection = ({ bio }) => (
  <section>
    <p className="text-4xl lg:text-5xl font-light leading-[1.1] tracking-tight text-white/90 italic">
      "{bio}"
    </p>
  </section>
);

const ExperienceLedger = ({ experience = [] }) => {
  if (experience.length === 0) return null;
  return (
  <section>
    <SectionTitle subtitle="Professional History">Experience Ledger</SectionTitle>
    <div className="space-y-12">
      {experience.map((exp, i) => (
        <div key={i} className="relative pl-12 group">
          <div className="absolute left-0 top-1 bottom-0 w-px bg-white/10 group-hover:bg-blue-500 transition-colors" />
          <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-white/20 group-hover:bg-blue-500 transition-colors" />
          <div className="mb-2">
            <span className="text-[10px] font-mono text-blue-500 uppercase font-bold tracking-widest">
              {exp.period}
            </span>
            <h5 className="text-2xl font-black text-white">
              {exp.role} @{' '}
              <span className="text-outline text-transparent group-hover:text-white transition-all">
                {exp.company}
              </span>
            </h5>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{exp.desc}</p>
        </div>
      ))}
    </div>
  </section>
  );
};

const ProjectsGrid = ({ projects = [] }) => {
  if (projects.length === 0) return null;
  return (
  <section>
    <SectionTitle subtitle="Portfolio Artifacts">Interactive Work</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((proj, i) => (
        <div
          key={i}
          className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={18} />
          </div>
          <p className="text-[10px] font-mono text-blue-500 mb-2 uppercase font-bold">
            {proj.type}
          </p>
          <h6 className="text-xl font-black text-white mb-4 tracking-tight">{proj.title}</h6>
          <div className="flex flex-wrap gap-2">
            {(proj.tags || []).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-mono text-gray-500 border border-white/5 uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
  );
};

const CertificatesSection = ({ certificates = [] }) => {
  if (certificates.length === 0) return null;
  return (
    <section>
      <SectionTitle subtitle="Validation">Certificates &amp; Awards</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {certificates.map((cert, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <ShieldCheck size={20} />
            </div>
            <p className="text-xs font-bold text-gray-300">{typeof cert === 'string' ? cert : cert.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MemberPage;
