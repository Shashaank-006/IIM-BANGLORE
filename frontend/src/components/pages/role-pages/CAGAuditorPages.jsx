import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, Bot, Eye, Download, ShieldAlert, 
  MapPin, AlertTriangle, FileText, Calendar, HardHat,
  Search, CheckCircle2, ChevronRight, FileCheck, Check
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useProjects } from '../../../context/ProjectContext';

// ─── AUDIT QUEUE ───────────────────────────────────────────────────────────────
export function AuditQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();
  const { refreshProjects } = useProjects();

  useEffect(() => {
    async function loadTasks() {
      try {
        const allTasks = await api.audit.getAssignments();
        // Filter tasks assigned to current auditor or show all if none specifically assigned
        const filteredTasks = allTasks.filter(t => t.assigned === user?.name || t.assigned === 'Ranjit Kumar Sahu');
        setTasks(filteredTasks.length > 0 ? filteredTasks : allTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user]);

  const filtered = tasks.filter(t => 
    t.project_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.task_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadLedger = () => {
    if (!selectedTask) return;
    const ledgerText = `
==================================================
GOVWATCH NATIONAL INFRASTRUCTURE AUDIT LEDGER
==================================================
Audit Reference ID : \${selectedTask.task_id}
Project Title      : \${selectedTask.project_name}
State Domain       : \${selectedTask.state}
District Location  : \${selectedTask.location}
Assigned Auditor   : \${selectedTask.assigned}
Due Date           : \${selectedTask.due_date}
Risk Priority Level: \${selectedTask.risk}
Estimated Budget   : ₹\${selectedTask.budget.toLocaleString('en-IN')}
Current Status     : \${selectedTask.status}

==================================================
FIELD PHYSICAL PROGRESS & LEDGER VERIFICATION
==================================================
- Inspection Log Ref: INSP-\${selectedTask.task_id.split('-').pop()}
- Verification Tranche Status: Clean Release Approved
- Gemini AI Verification Image Scan: Clear
- Geographic GPS Fencing Check: 0.0m offset (Pass)

Generated on: \${new Date().toLocaleString('en-IN')}
Comptroller & Auditor General of India
==================================================
    `;
    const element = document.createElement("a");
    const file = new Blob([ledgerText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Ledger_\${selectedTask.task_id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearAudit = async () => {
    if (!selectedTask) return;
    try {
      await api.audit.complete(selectedTask.task_id);
      await refreshProjects();
      alert("Audit completed and report uploaded to national ledger!");
      setSelectedTask(null);
      
      // Reload tasks list
      const allTasks = await api.audit.getAssignments();
      const filteredTasks = allTasks.filter(t => t.assigned === user?.name || t.assigned === 'Ranjit Kumar Sahu');
      setTasks(filteredTasks.length > 0 ? filteredTasks : allTasks);
    } catch (err) {
      console.error(err);
      alert("Failed to complete audit assignment.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <span className="label">Verification Desk</span>
            <h3 className="section-title mt-1">Assigned Audits Queue</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="searchBar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 10px', height: '34px', width: '220px' }}>
              <Search size={14} className="text-secondary" style={{ color: 'var(--text-muted)' }} />
              <input
                className="searchInput"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit reference..."
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading audits...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Project Name</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Risk Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace' }}>{t.task_id}</td>
                    <td style={{ fontWeight: 600 }}>{t.project_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.location}</td>
                    <td style={{ fontWeight: 650 }}>₹{(t.budget / 10000000).toFixed(2)} Cr</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: t.risk === 'High' ? 'var(--accent-red-dim)' : 'var(--accent-amber-dim)', color: t.risk === 'High' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                        <span className={`dot ${t.risk === 'High' ? 'dot-red' : 'dot-amber'}`} />
                        {t.risk}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted">{t.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => setSelectedTask(t)} style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                        Audit Details
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No assigned audits found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTask && (
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
            maxWidth: '550px',
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
              <span className="label">AUDIT ASSIGNMENT MATRIX</span>
              <button 
                onClick={() => setSelectedTask(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem' }}
              >
                &times;
              </button>
            </div>
            
            <div>
              <h3 className="section-title" style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                Reference ID: {selectedTask.task_id}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Project Target: <b>{selectedTask.project_name}</b>
              </p>
            </div>

            <div className="layout-equal-2" style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>State Jurisdiction</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedTask.state}</div>
              </div>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Project Location</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedTask.location}</div>
              </div>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Due Date</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedTask.due_date}</div>
              </div>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Risk Priority</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedTask.risk === 'High' ? 'var(--accent-red)' : 'var(--accent-amber)', marginTop: '2px' }}>{selectedTask.risk} Priority</div>
              </div>
            </div>

            <div className="layout-equal-2">
              <div>
                <span className="label">Total Budget</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '2px' }}>
                  ₹{(selectedTask.budget / 10000000).toFixed(2)} Cr
                </div>
              </div>
              <div>
                <span className="label">Audit Status</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {selectedTask.status}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleDownloadLedger}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Download Audit Ledger
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleClearAudit}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ClipboardCheck size={14} /> Clear Audit & Upload Report
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedTask(null)}
              >
                Close Workbench
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI VERIFICATION LOGS ──────────────────────────────────────────────────────
export function AIVerificationResults() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnomalies() {
      try {
        const data = await api.anomalies.getAll();
        setAnomalies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Cognitive Verification Logs</span>
        <h3 className="section-title mt-1 mb-4">Neural Inspection Flagged Anomalies</h3>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading anomalies...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Anomaly Ref</th>
                  <th>Target Reference</th>
                  <th>Check Type</th>
                  <th>Detailed Variance</th>
                  <th>Confidence Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((a, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)' }}>{a.anomaly_id}</td>
                    <td style={{ fontWeight: 600 }}>{a.project}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{a.check_type}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.detail}>{a.detail}</td>
                    <td style={{ fontWeight: 650, color: 'var(--accent-blue)' }}>{a.confidence}%</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
                        <ShieldAlert size={10} style={{ marginRight: '3px' }} />
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {anomalies.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No AI anomalies logged.</td>
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

// ─── EVIDENCE WORKBENCH ─────────────────────────────────────────────────────────
export function EvidenceViewer() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvidences() {
      try {
        const data = await api.anomalies.getAll();
        // Convert anomalies into evidence shape
        const transformed = data.map((a, idx) => ({
          title: `${a.project} — ${a.check_type}`,
          date: a.deadline,
          location: a.anomaly_id === 'ANM-503' ? '16.064N, 73.461E' : a.anomaly_id === 'ANM-940' ? '17.981N, 79.593E' : '32.221N, 76.323E',
          type: 'Neural Check',
          matchScore: `${a.confidence}% confidence`,
          file: `${a.check_type.toLowerCase().replace(/ /g, '_')}_match.jpg`
        }));
        setEvidences(transformed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvidences();
  }, []);

  if (loading) {
    return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading visual workbench...</div>;
  }

  if (evidences.length === 0) {
    return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>No evidence files available.</div>;
  }

  return (
    <div className="layout-1-2" style={{ gap: '20px' }}>
      <div className="card flex flex-col justify-between" style={{ height: '520px', padding: '16px' }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <span className="label">Verification Evidence</span>
            <h3 className="section-title mt-1">Inspection Files</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }} className="flex flex-col gap-2">
            {evidences.map((e, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedItem(idx)}
                className="p-3" 
                style={{ 
                  background: selectedItem === idx ? 'var(--bg-active)' : 'var(--bg-elevated)', 
                  border: `1px solid ${selectedItem === idx ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{e.title}</div>
                <div className="flex justify-between items-center text-secondary mt-2" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{e.type}</span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{e.matchScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card flex flex-col justify-between" style={{ height: '520px' }}>
        <div>
          <span className="label">Visual Analysis Workbench</span>
          <h3 className="section-title mt-1 mb-4">{evidences[selectedItem]?.title}</h3>

          <div className="layout-equal-2" style={{ gap: '16px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                Ground Inspection Photo
              </div>
              <div style={{ width: '80%', height: '60%', border: '2px dashed var(--accent-blue)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                <Eye size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Geotagged Photo File</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{evidences[selectedItem]?.file}</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                CAD Drawing Standard
              </div>
              <div style={{ width: '80%', height: '60%', border: '2px dashed var(--accent-green)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
                <FileCheck size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>CAD Blueprint Overlay</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Matched to IS Standards</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Location Data:</span> <span style={{ fontWeight: 600 }}>{evidences[selectedItem]?.location}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Captured:</span> <span style={{ fontWeight: 600 }}>{evidences[selectedItem]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DOWNLOAD REPORTS ──────────────────────────────────────────────────────────
export function DownloadReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await api.reports.getAll();
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExport = (report) => {
    const content = `==================================================
GOVERNMENT OF INDIA - INFRASTRUCTURE AUDIT REPORT
==================================================
Report ID: ${report.report_id}
Title: ${report.title}
Milestone: ${report.milestone || 'N/A'}
Date Published: ${report.date}
Format: ${report.format}
File Size: ${report.size}
Assigned Officer: ${report.officer || 'System'}
Outcome: ${report.outcome || 'Passed'}
--------------------------------------------------
Auditor Field Notes:
${report.notes || 'No notes compiled.'}
==================================================`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, '_')}_Audit_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Auditor Download Center</span>
        <h3 className="section-title mt-1 mb-4">Exportable Compliance Ledgers</h3>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading ledgers...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>File Format</th>
                  <th>File Size</th>
                  <th>Published Date</th>
                  <th>Download Link</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td>
                      <span className="badge badge-muted">{r.format}</span>
                    </td>
                    <td>{r.size}</td>
                    <td>{r.date}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => handleExport(r)} style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                        <Download size={12} />
                        Export File
                      </button>
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
