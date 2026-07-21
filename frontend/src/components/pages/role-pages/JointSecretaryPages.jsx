import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, Cpu, UserPlus, CheckCircle2, 
  AlertTriangle, ArrowUpRight, Search, ShieldCheck, 
  Sliders, Save, RefreshCw, Trash2, Edit2, ShieldAlert, X
} from 'lucide-react';
import { api } from '../../../services/api';

const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

// ─── STATE COMPARISON ──────────────────────────────────────────────────────────
export function StateComparison() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateData, setStateData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.dashboard.getStateComparison();
        setStateData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading comparison...</div>
        ) : (
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
                    <td style={{ fontWeight: 650 }}>{formatINR(s.totalBudget)}</td>
                    <td>{formatINR(s.spent)}</td>
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No states found.</td>
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

// ─── USER MANAGEMENT ───────────────────────────────────────────────────────────
export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'CAG Auditor', dept: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.dept) return;

    try {
      await api.users.create({
        name: form.name,
        email: form.email,
        role: form.role,
        dept: form.dept
      });
      setSuccessMsg("Account created successfully!");
      setForm({ name: '', email: '', role: 'CAG Auditor', dept: '' });
      setIsAdding(false);
      loadUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || "Failed to create user account.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to deactivate this official account?")) return;
    try {
      await api.users.delete(userId);
      setSuccessMsg("Account deactivated.");
      loadUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || "Failed to delete account.");
    }
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      {isAdding && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="section-title">Add Official Account</h3>
            <button className="btn-icon" onClick={() => setIsAdding(false)}><X size={15} /></button>
          </div>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Vandana Mehta" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. vandana.m@nic.in" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Role Designation</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="CAG Auditor">CAG Auditor</option>
                <option value="State Audit Officer">State Audit Officer</option>
                <option value="District Collector">District Collector</option>
                <option value="Municipal Officer">Municipal Officer</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Department</label>
              <input value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} placeholder="e.g. State Finance Division" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 6 }}>Create Account</button>
          </form>
        </div>
      )}

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
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
              <UserPlus size={14} />
              Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading directory...</div>
        ) : (
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
                        {u.role !== 'Joint Secretary, Ministry of Rural Development' && (
                          <button className="btn-icon" onClick={() => handleDeleteUser(u.id)} style={{ padding: '4px', color: 'var(--accent-red)' }} title="Deactivate user"><Trash2 size={12} /></button>
                        )}
                      </div>
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

// ─── AI CONFIGURATION ──────────────────────────────────────────────────────────
export function AIConfiguration() {
  const [engineParams, setEngineParams] = useState({
    satelliteConfidence: 85,
    materialDeviationThreshold: 15,
    geotagRadiusTolerance: 50,
    contractorRiskThreshold: 70
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await api.aiConfig.get();
        setEngineParams(config);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      await api.aiConfig.save(engineParams);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save thresholds configuration.");
    }
  };

  if (loading) {
    return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading model parameters...</div>;
  }

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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Model Deployment State</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>Sentinel Production</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT ASSIGNMENTS ──────────────────────────────────────────────────────────
export function AuditAssignments() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await api.audit.getAssignments();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const assignAuditor = async (taskId, name) => {
    try {
      await api.audit.assign(taskId, name);
      loadTasks();
    } catch (err) {
      alert("Failed to assign auditor.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <span className="label">Task Desk</span>
        <h3 className="section-title mt-1 mb-4">Audit Assignment Queue</h3>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>Loading queue...</div>
        ) : (
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
                    <td style={{ fontFamily: 'monospace' }}>{t.task_id}</td>
                    <td style={{ fontWeight: 600 }}>{t.project_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.state}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: t.risk === 'High' ? 'var(--accent-red-dim)' : 'var(--accent-amber-dim)', color: t.risk === 'High' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                        {t.risk} Risk
                      </span>
                    </td>
                    <td>{t.due_date}</td>
                    <td style={{ fontWeight: 550, color: t.assigned === 'Unassigned' ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                      {t.assigned}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <select 
                          className="select" 
                          style={{ padding: '4px 28px 4px 10px', fontSize: '0.74rem' }}
                          onChange={(e) => assignAuditor(t.task_id, e.target.value)}
                          value={t.assigned}
                        >
                          <option value="Unassigned">Assign Auditor...</option>
                          <option value="Ranjit Kumar Sahu">Ranjit Kumar Sahu</option>
                          <option value="Archana Deshpande">Archana Deshpande</option>
                          <option value="Sunil Patkar (IAS)">Sunil Patkar (IAS)</option>
                          <option value="Demo User">Demo User</option>
                        </select>
                      </div>
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
