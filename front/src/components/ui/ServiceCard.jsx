import React from 'react';
import { Cpu, Network, Orbit } from 'lucide-react';

/**
 * Icon resolver — maps string icon names from data
 * to actual Lucide React components.
 */
const ICON_MAP = {
  Cpu,
  Network,
  Orbit,
};

/**
 * ServiceCard
 * -----------------------------------------------
 * Individual capability / service card.
 *
 * Props:
 *   service — a service object from data/services.js
 */
const ServiceCard = ({ service }) => {
  const IconComponent = ICON_MAP[service.iconName] || Cpu;

  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div
        className={`absolute -inset-2 bg-${service.accent}-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10`}
      />

      <div className="h-full bg-black/40 border border-white/5 rounded-[40px] p-10 flex flex-col hover:border-white/20 transition-all duration-500">
        <div className="flex justify-between items-start mb-12">
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <IconComponent className={service.iconColor} />
          </div>
          <span className="font-mono text-[10px] text-gray-500 opacity-40 uppercase font-black">
            {service.id || service._id}
          </span>
        </div>

        <div className="mb-auto">
          <p
            className={`text-${service.accent}-500 font-mono text-[9px] uppercase tracking-widest mb-3 font-black`}
          >
            {service.category}
          </p>
          <h3 className="text-3xl font-black italic mb-6 group-hover:text-white transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {service.desc}
          </p>

          <ul className="space-y-3 mb-10">
            {(service.features || []).map((feat, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-[11px] font-bold text-white/60"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-${service.accent}-500`}
                />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {(service.tech || []).map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-white/5 text-gray-500 font-mono text-[9px] uppercase tracking-tighter"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
