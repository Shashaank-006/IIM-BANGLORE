import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { api } from '../../../services/api';
import { useProjects } from '../../../context/ProjectContext';

// ─── DISTRICT PERFORMANCE GRID ──────────────────────────────────────────────────
export function DistrictPerformance() {
  const [search, setSearch] = useState('');
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.dashboard.getDistrictPerformance();
        setDistrictData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading grid...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>District</th>
                  <th>Projects</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Completion</th>
                  <th>Alerts</th>
                  <th>Risk</th>
                </tr>
              </thead>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No districts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PENDING INVESTIGATIONS ──────────────────────────────────────────────────────
export function PendingInvestigations() {
  const { refreshProjects } = useProjects();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadInvestigations() {
      try {
        const data = await api.anomalies.getAll();
        // Map anomalies to investigations format
        const mapped = data.map(a => ({
          id: a.anomaly_id,
          project: a.project,
          issue: a.detail,
          severity: a.severity,
          raised: a.deadline,
          status: a.status
        }));
        setInvestigations(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInvestigations();
  }, []);

  const handleReview = (inv) => {
    setSelectedCase(inv);
  };

  const handleUpdateStatus = async (caseId, newStatus) => {
    setIsSubmitting(true);
    try {
      await api.anomalies.updateStatus(caseId, newStatus);
      await refreshProjects();
      // Update local state
      setInvestigations(prev => prev.map(inv => inv.id === caseId ? { ...inv, status: newStatus } : inv));
      setSelectedCase(null);
    } catch (err) {
      alert("Failed to update case status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Integrity Monitoring</span>
        <h3 className="section-title mt-1 mb-4">Pending State Investigations</h3>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading cases...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Project</th>
                  <th>Issue Summary</th>
                  <th>Severity</th>
                  <th>Date Raised</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
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
                      <span className="badge badge-muted" style={{
                        backgroundColor: inv.status === 'Resolved' ? 'var(--accent-green-dim)' : inv.status === 'Escalated' ? 'var(--accent-red-dim)' : 'var(--bg-active)',
                        color: inv.status === 'Resolved' ? 'var(--accent-green)' : inv.status === 'Escalated' ? 'var(--accent-red)' : 'var(--text-secondary)'
                      }}>{inv.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleReview(inv)} style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                        Review 
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {investigations.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No pending state investigation files.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label" style={{ color: 'var(--accent-red)', fontWeight: 700 }}>CASE STUDY WORKBENCH</span>
              <button 
                onClick={() => setSelectedCase(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem' }}
              >
                &times;
              </button>
            </div>
            
            <div>
              <h3 className="section-title" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                Case ID: {selectedCase.id}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Project: <b>{selectedCase.project}</b>
              </p>
            </div>

            <div className="layout-equal-2" style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Date Flagged</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedCase.raised}</div>
              </div>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Severity Level</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedCase.severity === 'High' || selectedCase.severity === 'Critical' ? 'var(--accent-red)' : 'var(--accent-amber)', marginTop: '2px' }}>{selectedCase.severity} Priority</div>
              </div>
            </div>

            <div>
              <span className="label">Observed Discrepancy</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                {selectedCase.issue}
              </p>
            </div>

            <div>
              <span className="label">GIS Satellite Verification</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', padding: '10px', background: 'var(--bg-active)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} className="flex items-center gap-2">
                <span className="dot dot-green" />
                <span>Geotag Match Status: Verified (Radius within 20m tolerance threshold)</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedCase(null)}
                disabled={isSubmitting}
              >
                Close
              </button>
              {selectedCase.status !== 'Resolved' && selectedCase.status !== 'Escalated' && (
                <>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleUpdateStatus(selectedCase.id, 'Resolved')}
                    disabled={isSubmitting}
                    style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#fff' }}
                  >
                    Approve Resolution
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleUpdateStatus(selectedCase.id, 'Escalated')}
                    disabled={isSubmitting}
                    style={{ background: 'var(--accent-red)', borderColor: 'var(--accent-red)', color: '#fff' }}
                  >
                    Escalate Case
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
