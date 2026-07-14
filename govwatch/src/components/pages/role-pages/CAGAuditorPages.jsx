import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, Bot, Eye, Download, ShieldAlert, 
  MapPin, AlertTriangle, FileText, Calendar, HardHat,
  Search, CheckCircle2, ChevronRight, FileCheck, Check
} from 'lucide-react';
import { projects } from '../../../data/mockData';

export function AuditQueue() {
  const [searchTerm, setSearchTerm] = useState('');

  const auditorTasks = [
    { id: 'AUD-382', project: 'Warangal Urban Water Supply', scheme: 'JJM', risk: 'High', status: 'Pending Review', location: 'Warangal, Telangana', budget: 12600000 },
    { id: 'AUD-104', project: 'Kangra Smart City Command Centre', scheme: 'Smart Cities', risk: 'High', status: 'Awaiting Response', location: 'Kangra, Himachal Pradesh', budget: 18500000 },
    { id: 'AUD-903', project: 'Sindhudurg Coastal Widening', scheme: 'PMGSY', risk: 'Medium', status: 'In Progress', location: 'Sindhudurg, Maharashtra', budget: 7200000 }
  ];

  const filtered = auditorTasks.filter(t => 
    t.project.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <td style={{ fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.project}</td>
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
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                      Audit Details
                      <ChevronRight size={12} />
                    </button>
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

export function AIVerificationResults() {
  const anomalies = [
    { id: 'ANM-940', project: 'Warangal Water Pipe Laying', check: 'Diameter Deviation', detail: 'Optical inspection shows 80mm pipes vs 120mm in drawings', confidence: 92, status: 'Flagged' },
    { id: 'ANM-102', project: 'Kangra Command surveillance Centre', check: 'Subcontracting Loop', detail: 'Contractor billed invoices matching unauthorized entity', confidence: 88, status: 'Flagged' },
    { id: 'ANM-503', project: 'Sindhudurg Malvan Coastal Widening', check: 'Elevation Deviation', detail: 'Altitude reading deviates by 4.2m on concrete embankment', confidence: 79, status: 'Investigating' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Cognitive Verification Logs</span>
        <h3 className="section-title mt-1 mb-4">Neural Inspection Flagged Anomalies</h3>

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
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-red)' }}>{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.project}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{a.check}</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function EvidenceViewer() {
  const [selectedItem, setSelectedItem] = useState(0);

  const evidences = [
    { title: 'Warangal Pipe Layout W18', date: '2026-07-01', location: '17.981N, 79.593E', type: 'Geotagged Photo', matchScore: '89% similarity', file: 'pipe_verification.jpg' },
    { title: 'Sindhudurg Retaining Wall S02', date: '2026-06-25', location: '16.064N, 73.461E', type: 'Ground Photo', matchScore: '92% similarity', file: 'retaining_wall.jpg' },
    { title: 'Kangra Command surveillance Centre K04', date: '2026-06-18', location: '32.221N, 76.323E', type: 'Geotagged Image', matchScore: '65% similarity', file: 'control_center.jpg' }
  ];

  return (
    <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
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
          <h3 className="section-title mt-1 mb-4">{evidences[selectedItem].title}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '320px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                Ground Inspection Photo
              </div>
              {/* Ground Inspection Placeholder Drawing */}
              <div style={{ width: '80%', height: '60%', border: '2px dashed var(--accent-blue)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                <Eye size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Geotagged Photo File</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{evidences[selectedItem].file}</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>
                CAD Drawing Standard
              </div>
              {/* CAD Verification Placeholder */}
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
            <span style={{ color: 'var(--text-muted)' }}>Location Data:</span> <span style={{ fontWeight: 600 }}>{evidences[selectedItem].location}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Captured:</span> <span style={{ fontWeight: 600 }}>{evidences[selectedItem].date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DownloadReports() {
  const reports = [
    { title: 'Jal Jeevan Mission Q2 Expenditure Audit Report', format: 'PDF', size: '4.2 MB', date: '2026-07-10' },
    { title: 'PMGSY Kawardha-Chilfi Rural Road Verification Report', format: 'PDF', size: '2.8 MB', date: '2026-07-08' },
    { title: 'National Infrastructure Contractors Audit Summary', format: 'XLSX', size: '1.4 MB', date: '2026-07-05' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Auditor Download Center</span>
        <h3 className="section-title mt-1 mb-4">Exportable Compliance Ledgers</h3>

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
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.74rem' }}>
                      <Download size={12} />
                      Export File
                    </button>
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
