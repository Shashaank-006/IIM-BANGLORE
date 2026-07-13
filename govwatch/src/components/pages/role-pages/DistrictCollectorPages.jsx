import { useState } from 'react';
import { Route, CheckSquare, FileText, Search, ChevronRight, MapPin, Calendar } from 'lucide-react';

const districtProjects = [
  { id: 'PRJ-011', name: 'Sindhudurg Coastal Road Widening', location: 'Malvan, Sindhudurg', status: 'In Progress', completion: 45, budget: 7200000, inspector: 'Unassigned' },
  { id: 'PRJ-012', name: 'Kudal Rural Drinking Water', location: 'Kudal, Sindhudurg', status: 'Delayed', completion: 18, budget: 3400000, inspector: 'Amit Deshmukh' },
];

const fieldInspections = [
  { id: 'FI-201', project: 'Sindhudurg Coastal Road', officer: 'Amit Deshmukh', scheduledDate: '2026-07-15', milestone: 'Foundation pour verification', status: 'Scheduled' },
  { id: 'FI-183', project: 'Kudal Drinking Water Scheme', officer: 'Unassigned', scheduledDate: '2026-07-20', milestone: 'Pipe-laying Phase 2', status: 'Pending Assignment' },
];

const verificationRequests = [
  { id: 'VR-544', project: 'Sindhudurg Coastal Road', contractor: 'Ganesh Infra Works', amount: 1800000, stage: 'Phase 2 Completion', status: 'Awaiting Approval' },
  { id: 'VR-389', project: 'Kudal Water Scheme', contractor: 'Malvan Civil Builders', amount: 650000, stage: 'Material Procurement', status: 'Pending Documents' },
];

export function DCProjects() {
  const [search, setSearch] = useState('');
  const filtered = districtProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div><span className="label">Sindhudurg District</span><h3 className="section-title mt-1">Active District Projects</h3></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 10px', height: 34, width: 200 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-primary)' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search project..." />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Project ID</th><th>Project Name</th><th>Location</th><th>Budget</th><th>Completion</th><th>Field Officer</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace' }}>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="flex items-center gap-1"><MapPin size={11} style={{ color: 'var(--text-muted)' }} />{p.location}</span></td>
                  <td>₹{(p.budget/10000000).toFixed(2)} Cr</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-active)', borderRadius: 2 }}>
                        <div style={{ width: `${p.completion}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.completion}%</span>
                    </div>
                  </td>
                  <td style={{ color: p.inspector === 'Unassigned' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{p.inspector}</td>
                  <td><span className="badge" style={{ background: p.status === 'Delayed' ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)', color: p.status === 'Delayed' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function FieldInspectionAssignments() {
  const [assignments, setAssignments] = useState(fieldInspections);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Field Deployment</span>
        <h3 className="section-title mt-1 mb-4">Municipal Officer Inspection Schedule</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Inspection ID</th><th>Project</th><th>Assigned Officer</th><th>Scheduled Date</th><th>Milestone</th><th>Status</th></tr></thead>
            <tbody>
              {assignments.map((fi, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace' }}>{fi.id}</td>
                  <td style={{ fontWeight: 600 }}>{fi.project}</td>
                  <td style={{ color: fi.officer === 'Unassigned' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{fi.officer}</td>
                  <td><span className="flex items-center gap-1"><Calendar size={11} style={{ color: 'var(--text-muted)' }} />{fi.scheduledDate}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{fi.milestone}</td>
                  <td><span className="badge" style={{ background: fi.status === 'Scheduled' ? 'var(--accent-green-dim)' : 'var(--accent-amber-dim)', color: fi.status === 'Scheduled' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{fi.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function VerificationRequests() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Fund Release Gating</span>
        <h3 className="section-title mt-1 mb-4">Contractor Verification Requests</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Request ID</th><th>Project</th><th>Contractor</th><th>Requested Amount</th><th>Milestone Stage</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {verificationRequests.map((vr, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace' }}>{vr.id}</td>
                  <td style={{ fontWeight: 600 }}>{vr.project}</td>
                  <td>{vr.contractor}</td>
                  <td style={{ fontWeight: 650, color: 'var(--accent-blue)' }}>₹{(vr.amount/100000).toFixed(1)} L</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{vr.stage}</td>
                  <td><span className="badge badge-muted">{vr.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Approve</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--accent-red)' }}>Reject</button>
                    </div>
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

export function InspectionReports() {
  const reports = [
    { id: 'RPT-091', project: 'Sindhudurg Coastal Road', officer: 'Amit Deshmukh', date: '2026-07-01', milestone: 'Foundation Pour', outcome: 'Passed', notes: 'Concrete quality verified. Thickness within spec.' },
    { id: 'RPT-088', project: 'Kudal Drinking Water', officer: 'Amit Deshmukh', date: '2026-06-28', milestone: 'Pipe Trench Depth', outcome: 'Failed', notes: 'Trench depth 0.6m short. Re-inspection required.' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Field Reports Registry</span>
        <h3 className="section-title mt-1 mb-4">Completed Inspection Report Cards</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Report ID</th><th>Project</th><th>Field Officer</th><th>Date</th><th>Milestone Checked</th><th>Outcome</th><th>Inspector Notes</th></tr></thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace' }}>{r.id}</td>
                  <td style={{ fontWeight: 600 }}>{r.project}</td>
                  <td>{r.officer}</td>
                  <td>{r.date}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.milestone}</td>
                  <td><span className="badge" style={{ background: r.outcome === 'Passed' ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: r.outcome === 'Passed' ? 'var(--accent-green)' : 'var(--accent-red)' }}>{r.outcome}</span></td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.notes}>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
