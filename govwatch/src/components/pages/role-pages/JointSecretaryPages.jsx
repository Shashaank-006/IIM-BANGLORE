import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, Cpu, UserPlus, CheckCircle2, 
  AlertTriangle, ArrowUpRight, Search, ShieldCheck, 
  Sliders, Save, RefreshCw, Trash2, Edit2, ShieldAlert
} from 'lucide-react';
import { projects } from '../../../data/mockData';

// Mock state comparison data
const stateData = [
  { state: 'Chhattisgarh', projectsCount: 2, totalBudget: 8220000, spent: 5830000, completion: 73, risk: 'Low' },
  { state: 'Telangana', projectsCount: 1, totalBudget: 12600000, spent: 5100000, completion: 34, risk: 'High' },
  { state: 'West Bengal', projectsCount: 1, totalBudget: 8900000, spent: 8750000, completion: 100, risk: 'Low' },
  { state: 'Maharashtra', projectsCount: 2, totalBudget: 12800000, spent: 3900000, completion: 31, risk: 'Medium' },
  { state: 'Himachal Pradesh', projectsCount: 1, totalBudget: 18500000, spent: 6200000, completion: 33, risk: 'High' },
  { state: 'Karnataka', projectsCount: 1, totalBudget: 9800000, spent: 9640000, completion: 100, risk: 'Low' }
];

// Mock User Directory
const initialUsers = [
  { id: 'USR-045', name: 'Ranjit Kumar Sahu', email: 'ranjit.sahu@cag.gov.in', role: 'CAG Auditor', dept: 'Comptroller & Auditor General', status: 'Active' },
  { id: 'USR-012', name: 'Priya Nair', email: 'priya.nair@nic.in', role: 'Joint Secretary', dept: 'Ministry of Rural Development', status: 'Active' },
  { id: 'USR-078', name: 'Archana Deshpande', email: 'archana.d@nic.in', role: 'State Audit Officer', dept: 'Finance Department, WB', status: 'Active' },
  { id: 'USR-033', name: 'Sunil Patkar (IAS)', email: 'collector.sindhudurg@nic.in', role: 'District Collector', dept: 'Sindhudurg Admin', status: 'Active' },
  { id: 'USR-102', name: 'Amit Deshmukh', email: 'municipal.officer@nic.in', role: 'Municipal Officer', dept: 'Malvan Council', status: 'Active' }
];

export function StateComparison() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = stateData.filter(s => 
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <span className="label">National Grid</span>
            <h3 className="section-title mt-1">State Performance Index</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="searchBar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 10px', height: '34px', width: '220px' }}>
              <Search size={14} className="text-secondary" style={{ color: 'var(--text-muted)' }} />
              <input
                className="searchInput"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search state..."
              />
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>State Name</th>
                <th>Active Projects</th>
                <th>Total Sanctioned</th>
                <th>Total Spent</th>
                <th>Avg. Completion</th>
                <th>State Risk Index</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{s.state}</td>
                  <td>{s.projectsCount} Projects</td>
                  <td style={{ fontWeight: 650 }}>₹{(s.totalBudget / 10000000).toFixed(2)} Cr</td>
                  <td>₹{(s.spent / 10000000).toFixed(2)} Cr</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar-track" style={{ flex: 1, minWidth: '80px' }}>
                        <div className="progress-bar-fill" style={{ width: `${s.completion}%`, backgroundColor: s.completion === 100 ? 'var(--accent-green)' : 'var(--accent-blue)' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.completion}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: s.risk === 'High' ? 'var(--accent-red-dim)' : s.risk === 'Medium' ? 'var(--accent-amber-dim)' : 'var(--accent-green-dim)', color: s.risk === 'High' ? 'var(--accent-red)' : s.risk === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                      <span className={`dot ${s.risk === 'High' ? 'dot-red' : s.risk === 'Medium' ? 'dot-amber' : 'dot-green'}`} />
                      {s.risk}
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

export function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <span className="label">Access Control</span>
            <h3 className="section-title mt-1">Authorized Official Accounts</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="searchBar" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 10px', height: '34px', width: '200px' }}>
              <Search size={14} className="text-secondary" style={{ color: 'var(--text-muted)' }} />
              <input
                className="searchInput"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-primary)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user..."
              />
            </div>
            <button className="btn btn-primary">
              <UserPlus size={14} />
              Add User
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Designated Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>{u.role}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.dept}</td>
                  <td>
                    <span className="badge badge-green">
                      <span className="dot dot-green" />
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-icon" style={{ padding: '4px' }} title="Edit user"><Edit2 size={12} /></button>
                      <button className="btn-icon" style={{ padding: '4px', color: 'var(--accent-red)' }} title="Deactivate user"><Trash2 size={12} /></button>
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

export function AIConfiguration() {
  const [engineParams, setEngineParams] = useState({
    satelliteConfidence: 85,
    materialDeviationThreshold: 15,
    geotagRadiusTolerance: 50,
    contractorRiskThreshold: 70
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid-2">
      <div className="card">
        <span className="label">Cognitive MIS Engine</span>
        <h3 className="section-title mt-1 mb-4">Risk Engine Variables</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label" style={{ fontSize: '0.65rem' }}>Satellite Image Contrast Target (Min. %)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="50" max="95" 
                value={engineParams.satelliteConfidence}
                onChange={(e) => setEngineParams({...engineParams, satelliteConfidence: parseInt(e.target.value)})}
                style={{ flex: 1, accentColor: 'var(--accent-blue)' }} 
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '36px' }}>{engineParams.satelliteConfidence}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label" style={{ fontSize: '0.65rem' }}>Material Cost Anomaly Warning Trigger (Deviation %)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="5" max="30" 
                value={engineParams.materialDeviationThreshold}
                onChange={(e) => setEngineParams({...engineParams, materialDeviationThreshold: parseInt(e.target.value)})}
                style={{ flex: 1, accentColor: 'var(--accent-blue)' }} 
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '36px' }}>±{engineParams.materialDeviationThreshold}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label" style={{ fontSize: '0.65rem' }}>GPS Validation Tolerance Radius (Metres)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="10" max="200" 
                value={engineParams.geotagRadiusTolerance}
                onChange={(e) => setEngineParams({...engineParams, geotagRadiusTolerance: parseInt(e.target.value)})}
                style={{ flex: 1, accentColor: 'var(--accent-blue)' }} 
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '36px' }}>{engineParams.geotagRadiusTolerance}m</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label" style={{ fontSize: '0.65rem' }}>Contractor Risk Index Autopopulation Threshold</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="50" max="90" 
                value={engineParams.contractorRiskThreshold}
                onChange={(e) => setEngineParams({...engineParams, contractorRiskThreshold: parseInt(e.target.value)})}
                style={{ flex: 1, accentColor: 'var(--accent-blue)' }} 
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '36px' }}>{engineParams.contractorRiskThreshold} pts</span>
            </div>
          </div>

          <div className="divider" style={{ margin: '10px 0' }} />

          <div className="flex justify-between items-center">
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={14} />
              Save AI Thresholds
            </button>
            {saved && (
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 500 }}>
                Configuration updated successfully!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, transparent 100%)' }}>
        <span className="label" style={{ color: 'var(--accent-blue)' }}>AI Audits Overview</span>
        <h3 className="section-title mt-1 mb-3">Model Accuracy Parameters</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          The GovWatch risk analytics system uses automated optical character checks, convolutional neural layers for image matching, and historical contractor invoices to flag corruption indicators before budget clearances.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sentinel-2 Image Pipeline Latency</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>1.2 hours</span>
          </div>
          <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Geotag Image Verify F1-Score</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>0.942</span>
          </div>
          <div className="flex justify-between items-center p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Anomalies Flagged FY 25</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>18 Anomalies</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditAssignments() {
  const [tasks, setTasks] = useState([
    { id: 'AUD-382', project: 'Warangal Urban Water Supply', state: 'Telangana', risk: 'High', assigned: 'Unassigned', dueDate: '2026-08-15' },
    { id: 'AUD-104', project: 'Kangra Smart City Centre', state: 'Himachal Pradesh', risk: 'High', assigned: 'Unassigned', dueDate: '2026-08-20' },
    { id: 'AUD-903', project: 'Sindhudurg Coastal Widening', state: 'Maharashtra', risk: 'Medium', assigned: 'Ranjit Kumar Sahu', dueDate: '2026-09-01' }
  ]);
  const [auditor, setAuditor] = useState('');

  const assignAuditor = (taskId, name) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, assigned: name } : t));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Task Desk</span>
        <h3 className="section-title mt-1 mb-4">Audit Assignment Queue</h3>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Project Reference</th>
                <th>State Domain</th>
                <th>Anomalies Level</th>
                <th>Due Date</th>
                <th>Assigned Auditor</th>
                <th>Reassign Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.project}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.state}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: t.risk === 'High' ? 'var(--accent-red-dim)' : 'var(--accent-amber-dim)', color: t.risk === 'High' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                      {t.risk} Risk
                    </span>
                  </td>
                  <td>{t.dueDate}</td>
                  <td style={{ fontWeight: 550, color: t.assigned === 'Unassigned' ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                    {t.assigned}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <select 
                        className="select" 
                        style={{ padding: '4px 28px 4px 10px', fontSize: '0.74rem' }}
                        onChange={(e) => assignAuditor(t.id, e.target.value)}
                        value={t.assigned}
                      >
                        <option value="Unassigned">Assign Auditor...</option>
                        <option value="Ranjit Kumar Sahu">Ranjit Kumar Sahu</option>
                        <option value="Archana Deshpande">Archana Deshpande</option>
                        <option value="Sunil Patkar (IAS)">Sunil Patkar (IAS)</option>
                      </select>
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
