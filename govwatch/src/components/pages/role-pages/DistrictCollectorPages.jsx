import { useState, useEffect } from 'react';
import { Route, CheckSquare, FileText, Search, ChevronRight, MapPin, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../../services/api';
import { useProjects } from '../../../context/ProjectContext';

const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

// ─── ACTIVE DISTRICT PROJECTS ──────────────────────────────────────────────────
export function DCProjects() {
  const [search, setSearch] = useState('');
  const { allProjects } = useProjects();

  const filtered = allProjects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div><span className="label">Oversight Desk</span><h3 className="section-title mt-1">Active District Projects</h3></div>
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
                  <td><span className="flex items-center gap-1"><MapPin size={11} style={{ color: 'var(--text-muted)' }} />{p.district || p.village}, {p.state}</span></td>
                  <td>{formatINR(p.budget)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-active)', borderRadius: 2 }}>
                        <div style={{ width: `${p.completion}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.completion}%</span>
                    </div>
                  </td>
                  <td style={{ color: p.officer === 'Unassigned' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{p.officer}</td>
                  <td><span className="badge" style={{ background: p.status === 'Delayed' ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)', color: p.status === 'Delayed' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>{p.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No district projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── FIELD INSPECTIONS ──────────────────────────────────────────────────────────
export function FieldInspectionAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInspections() {
      try {
        const data = await api.inspections.getAll();
        setAssignments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInspections();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Field Deployment</span>
        <h3 className="section-title mt-1 mb-4">Municipal Officer Inspection Schedule</h3>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading schedule...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Inspection ID</th><th>Project</th><th>Assigned Officer</th><th>Scheduled Date</th><th>Milestone</th><th>Status</th></tr></thead>
              <tbody>
                {assignments.map((fi, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace' }}>{fi.inspection_id}</td>
                    <td style={{ fontWeight: 600 }}>{fi.project}</td>
                    <td style={{ color: fi.officer === 'Unassigned' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{fi.officer}</td>
                    <td><span className="flex items-center gap-1"><Calendar size={11} style={{ color: 'var(--text-muted)' }} />{fi.scheduled_date}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{fi.milestone}</td>
                    <td><span className="badge" style={{ background: fi.status === 'Scheduled' ? 'var(--accent-green-dim)' : 'var(--accent-amber-dim)', color: fi.status === 'Scheduled' ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{fi.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VERIFICATION REQUESTS ──────────────────────────────────────────────────────
export function VerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadRequests = async () => {
    try {
      const data = await api.verificationRequests.getAll();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.verificationRequests.approve(id);
      setMsg(`Claim VR-${id} approved. Budget disbursements updated.`);
      loadRequests();
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      alert("Failed to approve claim.");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.verificationRequests.reject(id);
      setMsg(`Claim VR-${id} rejected.`);
      loadRequests();
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      alert("Failed to reject claim.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>{msg}</span>
        </div>
      )}

      <div className="card">
        <span className="label">Fund Release Gating</span>
        <h3 className="section-title mt-1 mb-4">Contractor Verification Requests</h3>
        
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading requests...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Request ID</th><th>Project</th><th>Contractor</th><th>Requested Amount</th><th>Milestone Stage</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {requests.map((vr, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace' }}>{vr.request_id}</td>
                    <td style={{ fontWeight: 600 }}>{vr.project}</td>
                    <td>{vr.contractor}</td>
                    <td style={{ fontWeight: 650, color: 'var(--accent-blue)' }}>{formatINR(vr.amount)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{vr.stage}</td>
                    <td>
                      <span className="badge" style={{ 
                        backgroundColor: vr.status === 'Approved' ? 'var(--accent-green-dim)' : vr.status === 'Rejected' ? 'var(--accent-red-dim)' : 'var(--bg-active)',
                        color: vr.status === 'Approved' ? 'var(--accent-green)' : vr.status === 'Rejected' ? 'var(--accent-red)' : 'var(--text-primary)'
                      }}>
                        {vr.status}
                      </span>
                    </td>
                    <td>
                      {vr.status === 'Awaiting Approval' && (
                        <div className="flex gap-2">
                          <button className="btn btn-primary" onClick={() => handleApprove(vr.request_id)} style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Approve</button>
                          <button className="btn btn-secondary" onClick={() => handleReject(vr.request_id)} style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--accent-red)' }}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INSPECTION REPORTS ────────────────────────────────────────────────────────
export function InspectionReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const allReports = await api.reports.getAll();
        // Filter reports with outcome Passed or Failed
        const filtered = allReports.filter(r => r.outcome === 'Passed' || r.outcome === 'Failed');
        setReports(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Field Reports Registry</span>
        <h3 className="section-title mt-1 mb-4">Completed Inspection Report Cards</h3>
        
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading reports...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Report ID</th><th>Project</th><th>Field Officer</th><th>Date</th><th>Milestone Checked</th><th>Outcome</th><th>Inspector Notes</th></tr></thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace' }}>{r.report_id}</td>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
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
        )}
      </div>
    </div>
  );
}
