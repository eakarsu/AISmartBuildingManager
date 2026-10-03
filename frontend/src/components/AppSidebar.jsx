import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './AppSidebar.css';

const LINKS = [
  { to: '/codex/custom-viz', label: 'Custom Viz', group: 'Insights' },
  { to: '/codex/operations', label: 'Operations', group: 'Insights' },
  { to: '/', label: 'Dashboard', group: 'Workspace' },
  { to: '/dashboard', label: 'Dashboard', group: 'Workspace' },
  { to: '/hvac', label: 'Hvac', group: 'Workspace' },
  { to: '/lighting', label: 'Lighting', group: 'Workspace' },
  { to: '/climate', label: 'Climate', group: 'Workspace' },
  { to: '/maintenance', label: 'Maintenance', group: 'Workspace' },
  { to: '/energy', label: 'Energy', group: 'Workspace' },
  { to: '/comfort', label: 'Comfort', group: 'Workspace' },
  { to: '/security', label: 'Security', group: 'Workspace' },
  { to: '/space', label: 'Space', group: 'Workspace' },
  { to: '/water', label: 'Water', group: 'Workspace' },
  { to: '/parking', label: 'Parking', group: 'Workspace' },
  { to: '/visitors', label: 'Visitors', group: 'Workspace' },
  { to: '/waste', label: 'Waste', group: 'Workspace' },
  { to: '/fire', label: 'Fire', group: 'Workspace' },
  { to: '/elevators', label: 'Elevators', group: 'Workspace' },
  { to: '/alerts', label: 'Alerts', group: 'Workspace' },
  { to: '/reports', label: 'Reports', group: 'Workspace' },
  { to: '/settings', label: 'Settings', group: 'Workspace' },
  { to: '/activity', label: 'Activity', group: 'Workspace' },
  { to: '/profile', label: 'Profile', group: 'Workspace' },
  { to: '/building-health', label: 'Building Health', group: 'Workspace' },
  { to: '/threshold-alerts', label: 'Threshold Alerts', group: 'Workspace' },
  { to: '/maintenance-prediction', label: 'Maintenance Prediction', group: 'Workspace' },
  { to: '/energy-optimizer', label: 'Energy Optimizer', group: 'Workspace' },
  { to: '/occupancy-optimization', label: 'Occupancy Optimization', group: 'Workspace' },
  { to: '/predictive-maintenance-ai', label: 'Predictive Maintenance Ai', group: 'Workspace' },
  { to: '/security-anomaly', label: 'Security Anomaly', group: 'Workspace' },
  { to: '/energy-forecast', label: 'Energy Forecast', group: 'Workspace' },
  { to: '/comfort-optimization', label: 'Comfort Optimization', group: 'Workspace' },
  { to: '/water-usage-optimization', label: 'Water Usage Optimization', group: 'Workspace' },
  { to: '/chilled-water-load-shed', label: 'Chilled Water Load Shed', group: 'Workspace' },
  { to: '/custom-views', label: 'Custom Views', group: 'Workspace' },
];

export default function AppSidebar() {
  const [query, setQuery] = useState('');
  const visible = LINKS.filter(link => link.label.toLowerCase().includes(query.toLowerCase().trim()));
  return <aside className="codex-side" aria-label="Application navigation">
    <div className="codex-side-brand"><strong>AISmart Building Manager</strong><span>Workspace</span></div>
    <label className="codex-side-search-label" htmlFor="codex-side-search">Find a section</label>
    <input id="codex-side-search" className="codex-side-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search navigation" />
    <nav className="codex-side-links" aria-label="Sections">
      {['Workspace', 'AI tools', 'Insights'].map(group => {
        const items = visible.filter(link => link.group === group);
        return items.length ? <div className="codex-side-group" key={group}>
          <span className="codex-side-heading">{group}</span>
          {items.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `codex-side-link${isActive ? ' active' : ''}`}>{link.label}</NavLink>)}
        </div> : null;
      })}
      {visible.length === 0 && <p className="codex-side-empty">No matching sections</p>}
    </nav>
  </aside>;
}
