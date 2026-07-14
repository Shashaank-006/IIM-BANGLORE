import { useState } from 'react';
import { TrendingUp, AlertTriangle, Search, ChevronRight } from 'lucide-react';

const districtData = [
  { district: 'Kabirdham', projects: 2, budget: 8220000, spent: 5830000, completion: 73, alerts: 0, risk: 'Low' },
  { district: 'Bilaspur', projects: 1, budget: 4200000, spent: 2100000, completion: 50, alerts: 1, risk: 'Medium' },
  { district: 'Raipur', projects: 1, budget: 6500000, spent: 4800000, completion: 74, alerts: 0, risk: 'Low' },
  { district: 'Bastar', projects: 1, budget: 3900000, spent: 1200000, completion: 31, alerts: 2, risk: 'High' },
];

const investigations = [
  { id: 'INV-201', project: 'Kawardha-Chilfi Road', issue: 'Missing gravel layer milestone documentation', severity: 'High', raised: '2026-07-03', status: 'Open' },
  { id: 'INV-308', project: 'Bilaspur Rural Water Scheme', issue: 'PERT contractor billing exceeds MoRD approved rate by 22%', severity: 'Critical', raised: '2026-07-05', status: 'Escalated' },
  { id: 'INV-415', project: 'Bastar Village Connectivity', issue: 'Field inspection report submitted 14 days late', severity: 'Low', raised: '2026-07-08', status: 'Monitoring' },
];

export function DistrictPerformance() {
  const [search, setSearch] = useState('');
  const filtered = districtData.filter(d => d.district.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <span className="label">State Oversight</span>
            <h3 className="section-title mt-1">District Performance Grid</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 10px', height: 34, width: 200 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-primary)' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search district..." />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>District</th><th>Projects</th><th>Budget</th><th>Spent</th><th>Completion</th><th>Alerts</th><th>Risk</th></tr></thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{d.district}</td>
                  <td>{d.projects}</td>
                  <td>₹{(d.budget/10000000).toFixed(2)} Cr</td>
                  <td>₹{(d.spent/10000000).toFixed(2)} Cr</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-active)', borderRadius: 2, minWidth: 60 }}>
                        <div style={{ width: `${d.completion}%`, height: '100%', background: d.completion > 60 ? 'var(--accent-green)' : 'var(--accent-amber)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{d.completion}%</span>
                    </div>
                  </td>
                  <td style={{ color: d.alerts > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>{d.alerts} Alert{d.alerts !== 1 ? 's' : ''}</td>
                  <td>
                    <span className="badge" style={{ background: d.risk === 'High' ? 'var(--accent-red-dim)' : d.risk === 'Medium' ? 'var(--accent-amber-dim)' : 'var(--accent-green-dim)', color: d.risk === 'High' ? 'var(--accent-red)' : d.risk === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-green)' }}>{d.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PendingInvestigations() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Integrity Monitoring</span>
        <h3 className="section-title mt-1 mb-4">Pending State Investigations</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Case ID</th><th>Project</th><th>Issue Summary</th><th>Severity</th><th>Date Raised</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {investigations.map((inv, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)' }}>{inv.id}</td>
                  <td style={{ fontWeight: 600 }}>{inv.project}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={inv.issue}>{inv.issue}</td>
                  <td>
                    <span className="badge" style={{ background: inv.severity === 'Critical' || inv.severity === 'High' ? 'var(--accent-red-dim)' : inv.severity === 'Low' ? 'var(--accent-green-dim)' : 'var(--accent-amber-dim)', color: inv.severity === 'Critical' || inv.severity === 'High' ? 'var(--accent-red)' : inv.severity === 'Low' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{inv.severity}</span>
                  </td>
                  <td>{inv.raised}</td>
                  <td>
                    <span className="badge badge-muted">{inv.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>Review <ChevronRight size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
