import React, { useMemo, useState } from 'react';
import { Activity, Plus } from 'lucide-react';
import { useProjects, useProjectFilters } from '../hooks/usePortfolioData';
import { cn } from '../utils/helpers';

/**
 * ArchivePage
 * -----------------------------------------------
 * Filterable vertical list of past projects.
 */
const ArchivePage = () => {
  const { data: projects } = useProjects();
  const { data: filterTags } = useProjectFilters();
  const [filter, setFilter] = useState('ALL');

  const filteredProjects = useMemo(() => {
    if (filter === 'ALL') return projects;
    return projects.filter((p) =>
      (p.type || '').toUpperCase().includes(filter)
    );
  }, [filter, projects]);

  return (
    <div className="min-h-screen pt-40 px-6 lg:px-24 pb-40 animate-in fade-in duration-1000">
      {/* Header + Filters */}
      <div className="max-w-6xl mx-auto mb-20 text-center lg:text-left flex flex-col lg:flex-row items-end justify-between gap-10">
        <div>
          <h2 className="text-[12vw] lg:text-[7vw] font-black italic tracking-tighter leading-none mb-4">
            ENGINE<br />LOGS.
          </h2>
          <div className="flex flex-wrap gap-3 mt-6">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={cn(
                  'px-4 py-1.5 rounded-full font-mono text-[10px] uppercase transition-all border',
                  filter === tag
                    ? 'bg-white text-black border-white'
                    : 'text-gray-500 border-white/10 hover:border-white/30'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-sm">
          <p className="text-gray-500 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-right">
            A vertical chronology of deployment breakthroughs. Select a node to expand its
            architectural documentation and system metrics.
          </p>
        </div>
      </div>

      {/* Project Cards */}
      <div className="max-w-6xl mx-auto space-y-4">
        {filteredProjects.map((proj, i) => (
          <ProjectCard key={proj._id || proj.id || i} project={proj} index={i} />
        ))}
      </div>
    </div>
  );
};

/* ─── Private sub-component ─── */

const ProjectCard = ({ project: proj, index }) => (
  <div className="group relative">
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700 -z-10 group-hover:scale-105" />
    <div className="relative bg-[#0a0a0f] border border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 group-hover:border-white/20 group-hover:-translate-y-2">
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Index sidebar */}
        <div className="lg:w-24 bg-white/[0.02] border-r border-white/5 flex flex-row lg:flex-col items-center justify-between p-6 lg:py-10">
          <span className="text-2xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity">
            {proj.id || String(index + 1).padStart(2, '0')}
          </span>
          <div className="lg:rotate-180 lg:[writing-mode:vertical-lr] font-mono text-[10px] text-blue-500 uppercase tracking-widest font-black">
            {proj.status}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 bg-white/5 text-gray-500 font-mono text-[9px] uppercase rounded">
                  {proj.type}
                </span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-gray-500 font-mono text-[9px] uppercase">{proj.tech}</span>
              </div>
              <h3 className="text-4xl lg:text-5xl font-black italic tracking-tighter group-hover:text-blue-400 transition-colors">
                {proj.title}
              </h3>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-blue-500 font-mono text-[10px] uppercase font-black mb-1">
                Impact Factor
              </p>
              <p className="text-4xl font-black italic">{proj.impact}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl">{proj.desc}</p>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              {proj.link ? (
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] font-bold group/btn">
                  <span className="group-hover/btn:mr-2 transition-all">View Project</span>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                    <Plus size={16} />
                  </div>
                </a>
              ) : (
                <button className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] font-bold group/btn">
                  <span className="group-hover/btn:mr-2 transition-all">Full Documentation</span>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                    <Plus size={16} />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
        <Activity size={120} strokeWidth={0.5} />
      </div>
    </div>
  </div>
);

export default ArchivePage;
