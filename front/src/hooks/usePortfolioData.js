import { useState, useEffect } from 'react';
import {
  fetchSiteSettings,
  fetchTeamMembers,
  fetchServices,
  fetchProjects,
  fetchProjectFilters,
} from '../api/portfolio';

// Static fallbacks
import STATIC_TEAM from '../data/team';
import STATIC_SERVICES from '../data/services';
import STATIC_PROJECTS, { PROJECT_FILTER_TAGS as STATIC_FILTER_TAGS } from '../data/projects';

/**
 * Generic hook: fetch from API, fall back to static data if empty/failed.
 */
function useFetchWithFallback(fetcher, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((result) => {
      if (cancelled) return;
      if (result && (Array.isArray(result) ? result.length > 0 : Object.keys(result).length > 0)) {
        setData(result);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

/* ─── Exported hooks ─── */

export function useSiteSettings() {
  const defaults = {
    heroTitle: 'NEBULA',
    heroSubtitle: 'CORE',
    heroTagline1: 'High-Performance Engineering',
    heroTagline2: 'Interactive Systems',
    brandName: 'Nebula Core',
    capabilitiesLabel: 'Tactical Deployment',
    capabilitiesTitle: 'Operational\nCapabilities.',
    capabilitiesDescription: 'We operate as an elite extension of your engineering department, providing specialized high-tier technical labor for high-risk ventures.',
    ctaBannerTitle: 'Bespoke Strategic Retainers',
    ctaBannerDescription: 'Long-term architecture oversight and CTO-as-a-service availability.',
    ctaButtonText: 'Discuss Engagement',
    originLabel: 'Genesis & Story',
    originTitle: 'BORN FROM THE\nVOID.',
    originText: 'Nebula began in 2021 as a stealth research lab for distributed systems. We realized that the most innovative companies didn\'t need just "developers"—they needed a strike team of architects who understood the soul of the machine.',
    liveFeedTitle: 'SYSTEM\nOVERSIGHT.',
    liveFeedEntries: [
      { text: '[21:44:02] QuantumLedger: Merkle tree verification successful. Shard #402 locked.', color: 'text-emerald-500' },
      { text: '> Rivera: Optimizing gas throughput for Layer 2 bridge...', color: 'text-gray-500' },
      { text: '[21:40:15] NeuralFlow: Weights converged for Model V-Gamma (Accuracy 99.4%).', color: 'text-blue-500' },
      { text: '> Cluster-7: Distributing inference nodes to AWS-East-1...', color: 'text-gray-500' },
      { text: '[21:44:02] QuantumLedger: Merkle tree verification successful. Shard #402 locked.', color: 'text-emerald-500' },
    ],
    footerText: 'Nebula Core — All systems nominal.',
    footerStatusText: 'Status: Operational',
    enquireTitle: "LET'S\nBUILD.",
    enquireDescription: "We don't take every project. We take the ones that require thinking beyond the standard.",
    enquireButtonText: 'Initiate Transmission',
    navItems: [
      { key: 'home', label: 'Collective', type: 'link', order: 1 },
      { key: 'projects', label: 'Archive', type: 'link', order: 2 },
      { key: 'enquire', label: 'Enquire', type: 'button', order: 3 },
    ],
    socialLinks: [],
  };

  return useFetchWithFallback(fetchSiteSettings, defaults);
}

export function useTeamMembers() {
  return useFetchWithFallback(fetchTeamMembers, STATIC_TEAM);
}

export function useServices() {
  return useFetchWithFallback(fetchServices, STATIC_SERVICES);
}

export function useProjects() {
  return useFetchWithFallback(fetchProjects, STATIC_PROJECTS);
}

export function useProjectFilters() {
  return useFetchWithFallback(fetchProjectFilters, STATIC_FILTER_TAGS);
}
