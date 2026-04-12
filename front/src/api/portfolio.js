/**
 * Portfolio Public API
 * All public endpoints for the portfolio frontend.
 * No auth required — these are read-only.
 */
import { API_BASE } from './config';

async function get(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.isOk ? json.data : null;
  } catch {
    return null;
  }
}

export const fetchSiteSettings = () => get('/site-settings');
export const fetchTeamMembers = () => get('/team-members');
export const fetchServices = () => get('/services');
export const fetchProjects = () => get('/projects');
export const fetchProjectFilters = () => get('/projects/filters');

export async function submitEnquiry({ name, email, message }) {
  try {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    const json = await res.json();
    return json.isOk ? json.data : null;
  } catch {
    return null;
  }
}
