import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  TrendingUp, ShieldAlert, Users, Cpu, AlertTriangle,
  CheckCircle2, Clock, Wallet, BarChart3, MapPin,
  ClipboardCheck, Upload, MessageSquare, FolderKanban,
  FilePlus2, ArrowRight
} from 'lucide-react';
import '../../styles/ProjectRegistration.css';

// ─────────────── Shared stat card ───────────────
function StatCard({ label, value, sub, color, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card"
      style={{ gap: 12 }}
    >
      <div className="flex justify-between items-center">
        <span className="label">{label}</span>
        {Icon && <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${color},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color: `rgb(${color})` }} />
        </div>}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
    </motion.div>
  );
}

// ─────────────── Quick alert row ───────────────
function AlertRow({ items }) {
  return (
    <div className="card">
      <span className="label" style={{ color: 'var(--accent-red)' }}>Active Alerts</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {items.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <AlertTriangle size={14} style={{ color: a.color || 'var(--accent-amber)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '10px 0', textAlign: 'center' }}>
            No active alerts at this time.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────── JOINT SECRETARY DASHBOARD ───────────────
export function JSDashboard({ stats, alerts }) {
  const formatINR = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '₹0.00';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    return `₹${(value / 100000).toFixed(1)} L`;
  };
  
  const [stateData, setStateData] = useState([]);
  
  useEffect(() => {
    async function loadStateData() {
      try {
        const data = await api.dashboard.getStateComparison();
        setStateData(data);
      } catch (err) {}
    }
    loadStateData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total National Allocation" value={formatINR(stats?.totalBudget || 373200000)} sub="Across all active schemes" icon={Wallet} color="59,130,246" delay={0} />
        <StatCard label="Active Projects" value={String(stats?.activeProjects || 0)} sub="Across all schemes" icon={FolderKanban} color="16,185,129" delay={0.06} />
        <StatCard label="AI Anomalies Flagged" value={String(stats?.fraudAlertsThisMonth || 0)} sub="Requires investigation" icon={ShieldAlert} color="239,68,68" delay={0.12} />
        <StatCard label="Registered Officers" value={String(stats?.verifiedContractors || 5)} sub="All roles active" icon={Users} color="139,92,246" delay={0.18} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <span className="label">National Overview</span>
          <h3 className="section-title mt-1 mb-3">State-wise Fund Utilisation</h3>
          {stateData.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 130, fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{s.state}</div>
              <div style={{ flex: 1, height: 6, background: 'var(--bg-active)', borderRadius: 4 }}>
                <div style={{ width: `${s.completion}%`, height: '100%', background: s.completion === 100 ? 'var(--accent-green)' : 'var(--accent-blue)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ width: 60, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>{formatINR(s.spent)}</div>
            </div>
          ))}
          {stateData.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
              No state project data loaded.
            </div>
          )}
        </div>

        <AlertRow items={alerts.slice(0, 3)} />
      </div>
    </div>
  );
}

// ─────────────── CAG AUDITOR DASHBOARD ───────────────
export function CAGDashboard({ stats, alerts }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Assigned Audits" value={String(stats?.totalProjects || 3)} sub="Pending audit tasks" icon={ClipboardCheck} color="59,130,246" delay={0} />
        <StatCard label="AI Flags for Review" value={String(stats?.fraudAlertsThisMonth || 3)} sub="High confidence anomalies" icon={ShieldAlert} color="239,68,68" delay={0.06} />
        <StatCard label="Reports Published" value="4" sub="Last 90 days" icon={FolderKanban} color="16,185,129" delay={0.12} />
        <StatCard label="Avg. Audit Resolution" value="12 days" sub="Target: 10 days" icon={Clock} color="245,158,11" delay={0.18} />
      </div>
      <AlertRow items={alerts} />
    </div>
  );
}

// ─────────────── STATE AUDIT OFFICER DASHBOARD ───────────────
export function SAODashboard({ stats, alerts }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="State Projects" value={String(stats?.totalProjects || 4)} sub="Active monitoring list" icon={FolderKanban} color="59,130,246" delay={0} />
        <StatCard label="District Alerts" value={String(stats?.fraudAlertsThisMonth || 3)} sub="Open investigations" icon={AlertTriangle} color="239,68,68" delay={0.06} />
        <StatCard label="State Allocation" value="₹8.22 Cr" sub="FY 2025–26 total" icon={Wallet} color="16,185,129" delay={0.12} />
        <StatCard label="Avg. District Completion" value={`${stats?.budgetUtilization || 57}%`} sub="Overall completion index" icon={BarChart3} color="139,92,246" delay={0.18} />
      </div>
      <AlertRow items={alerts} />
    </div>
  );
}

// ─────────────── DISTRICT COLLECTOR DASHBOARD ───────────────
export function DCDashboard({ stats, alerts }) {
  const formatINR = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '₹0.00';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    return `₹${(value / 100000).toFixed(1)} L`;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="District Projects" value={String(stats?.totalProjects || 2)} sub="Local administration projects" icon={FolderKanban} color="59,130,246" delay={0} />
        <StatCard label="Verification Requests" value={String(stats?.pendingDisbursements || 2)} sub="Pending fund release" icon={CheckCircle2} color="245,158,11" delay={0.06} />
        <StatCard label="Field Inspections" value={String(stats?.activeProjects || 2)} sub="Active monitoring runs" icon={MapPin} color="16,185,129" delay={0.12} />
        <StatCard label="Contractor Claims" value={formatINR(stats?.totalBudget * 0.1 || 24500000)} sub="Awaiting district approval" icon={Wallet} color="139,92,246" delay={0.18} />
      </div>
      <AlertRow items={alerts} />
    </div>
  );
}

// ─────────────── MUNICIPAL OFFICER DASHBOARD ───────────────
export function MODashboard({ stats, alerts }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="My Projects" value={String(stats?.totalProjects || 2)} sub="Municipal Council coverage" icon={FolderKanban} color="59,130,246" delay={0} />
        <StatCard label="AI Findings to Respond" value={String(stats?.fraudAlertsThisMonth || 1)} sub="Requires explanation" icon={MessageSquare} color="239,68,68" delay={0.06} />
        <StatCard label="Reports Submitted" value="2" sub="Last 30 days" icon={Upload} color="16,185,129" delay={0.12} />
        <StatCard label="Next Inspection" value="Scheduled" sub="Baseline images captured" icon={MapPin} color="245,158,11" delay={0.18} />
      </div>

      {/* ── Register Project CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4 }}
        className="reg-cta-card"
        onClick={() => navigate('/mo/register-project')}
        style={{ cursor: 'pointer' }}
      >
        <div className="reg-cta-icon">
          <FilePlus2 size={24} color="#fff" />
        </div>
        <div className="reg-cta-content">
          <h3>Register New Infrastructure Project</h3>
          <p>Initiate a government-funded infrastructure project and enable AI-powered monitoring from Day 0.</p>
        </div>
        <button className="btn btn-primary" style={{ flexShrink: 0, padding: '9px 18px' }} onClick={(e) => { e.stopPropagation(); navigate('/mo/register-project'); }}>
          <FilePlus2 size={14} />
          Register Project
          <ArrowRight size={14} />
        </button>
      </motion.div>

      <AlertRow items={alerts} />
    </div>
  );
}

// ─────────────── Default smart-dispatch ───────────────
export default function RoleDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.dashboard.getStats(user?.role);
        setStats(res.kpi);
        setAlerts(res.alerts);
      } catch (err) {
        console.error("Dashboard stats fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.role) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const role = user?.role;
  if (role === 'Joint Secretary, Ministry of Rural Development') 
    return <JSDashboard stats={stats} alerts={alerts} />;
  if (role === 'CAG Auditor') 
    return <CAGDashboard stats={stats} alerts={alerts} />;
  if (role === 'State Audit Officer') 
    return <SAODashboard stats={stats} alerts={alerts} />;
  if (role === 'District Collector') 
    return <DCDashboard stats={stats} alerts={alerts} />;
  if (role === 'Municipal Officer') 
    return <MODashboard stats={stats} alerts={alerts} />;
    
  return <JSDashboard stats={stats} alerts={alerts} />;
}
