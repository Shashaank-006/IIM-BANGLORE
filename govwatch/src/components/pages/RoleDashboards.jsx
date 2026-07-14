import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, ShieldAlert, Users, Cpu, AlertTriangle,
  CheckCircle2, Clock, Wallet, BarChart3, MapPin,
  ClipboardCheck, Upload, MessageSquare, FolderKanban
} from 'lucide-react';

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
      </div>
    </div>
  );
}

// ─────────────── JOINT SECRETARY DASHBOARD ───────────────
export function JSDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Total National Allocation" value="₹373 Cr" sub="Across all active schemes" icon={Wallet} color="59,130,246" delay={0} />
        <StatCard label="Active Projects" value="8" sub="7 states covered" icon={FolderKanban} color="16,185,129" delay={0.06} />
        <StatCard label="AI Anomalies Flagged" value="18" sub="3 require urgent action" icon={ShieldAlert} color="239,68,68" delay={0.12} />
        <StatCard label="Registered Officers" value="5" sub="All roles active" icon={Users} color="139,92,246" delay={0.18} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <span className="label">National Overview</span>
          <h3 className="section-title mt-1 mb-3">State-wise Fund Utilisation</h3>
          {[
            { state: 'Chhattisgarh', pct: 71, spent: '₹5.83 Cr', total: '₹8.22 Cr' },
            { state: 'Telangana', pct: 40, spent: '₹5.10 Cr', total: '₹12.60 Cr' },
            { state: 'Maharashtra', pct: 31, spent: '₹3.90 Cr', total: '₹12.80 Cr' },
            { state: 'Himachal Pradesh', pct: 33, spent: '₹6.20 Cr', total: '₹18.50 Cr' },
            { state: 'West Bengal', pct: 100, spent: '₹8.75 Cr', total: '₹8.90 Cr' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 130, fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{s.state}</div>
              <div style={{ flex: 1, height: 6, background: 'var(--bg-active)', borderRadius: 4 }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.pct === 100 ? 'var(--accent-green)' : 'var(--accent-blue)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ width: 60, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>{s.spent}</div>
            </div>
          ))}
        </div>

        <AlertRow items={[
          { title: 'Warangal Water Supply — Billing Anomaly', desc: 'Pipe diameter deviation reported by AI', color: 'var(--accent-red)' },
          { title: 'Kangra Smart City — Missing Invoices', desc: 'Sub-contractor loop detected', color: 'var(--accent-red)' },
          { title: 'Bastar Connectivity — Delayed Report', desc: 'Field inspection 14 days overdue', color: 'var(--accent-amber)' },
        ]} />
      </div>
    </div>
  );
}

// ─────────────── CAG AUDITOR DASHBOARD ───────────────
export function CAGDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Assigned Audits" value="3" sub="2 pending, 1 in progress" icon={ClipboardCheck} color="59,130,246" delay={0} />
        <StatCard label="AI Flags for Review" value="3" sub="High confidence anomalies" icon={ShieldAlert} color="239,68,68" delay={0.06} />
        <StatCard label="Reports Published" value="8" sub="Last 90 days" icon={FolderKanban} color="16,185,129" delay={0.12} />
        <StatCard label="Avg. Audit Resolution" value="12 days" sub="Target: 10 days" icon={Clock} color="245,158,11" delay={0.18} />
      </div>
      <AlertRow items={[
        { title: 'ANM-940 — Warangal Water Supply', desc: 'Optical pipe diameter deviation detected (92% confidence)', color: 'var(--accent-red)' },
        { title: 'ANM-102 — Kangra Command Centre', desc: 'Subcontracting billing loop flagged (88% confidence)', color: 'var(--accent-red)' },
        { title: 'ANM-503 — Sindhudurg Coastal Road', desc: 'GPS elevation variance 4.2m (79% confidence)', color: 'var(--accent-amber)' },
      ]} />
    </div>
  );
}

// ─────────────── STATE AUDIT OFFICER DASHBOARD ───────────────
export function SAODashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="State Projects (CG)" value="4" sub="Chhattisgarh coverage" icon={FolderKanban} color="59,130,246" delay={0} />
        <StatCard label="District Alerts" value="3" sub="2 open investigations" icon={AlertTriangle} color="239,68,68" delay={0.06} />
        <StatCard label="State Allocation" value="₹82 Cr" sub="FY 2025–26 total" icon={Wallet} color="16,185,129" delay={0.12} />
        <StatCard label="Avg. District Completion" value="57%" sub="Across 4 districts" icon={BarChart3} color="139,92,246" delay={0.18} />
      </div>
      <AlertRow items={[
        { title: 'Bilaspur Rural Water Scheme — Billing Excess', desc: 'Contractor billed ₹22% above approved MoRD rates', color: 'var(--accent-red)' },
        { title: 'Bastar Connectivity — Delayed Field Report', desc: 'Inspection overdue by 14 days', color: 'var(--accent-amber)' },
      ]} />
    </div>
  );
}

// ─────────────── DISTRICT COLLECTOR DASHBOARD ───────────────
export function DCDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="District Projects" value="2" sub="Sindhudurg district" icon={FolderKanban} color="59,130,246" delay={0} />
        <StatCard label="Verification Requests" value="2" sub="Pending fund release" icon={CheckCircle2} color="245,158,11" delay={0.06} />
        <StatCard label="Field Inspections" value="2" sub="1 scheduled, 1 unassigned" icon={MapPin} color="16,185,129" delay={0.12} />
        <StatCard label="Contractor Claims" value="₹2.45 Cr" sub="Awaiting district approval" icon={Wallet} color="139,92,246" delay={0.18} />
      </div>
      <AlertRow items={[
        { title: 'Kudal Rural Drinking Water — Progress Delayed', desc: 'Completion at 18% vs 40% milestone target', color: 'var(--accent-red)' },
        { title: 'Field Inspection FI-183 — Unassigned', desc: 'Pipe-laying Phase 2 milestone needs a field officer', color: 'var(--accent-amber)' },
      ]} />
    </div>
  );
}

// ─────────────── MUNICIPAL OFFICER DASHBOARD ───────────────
export function MODashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="My Projects" value="2" sub="Malvan Council coverage" icon={FolderKanban} color="59,130,246" delay={0} />
        <StatCard label="AI Findings to Respond" value="1" sub="Response due Jul 20" icon={MessageSquare} color="239,68,68" delay={0.06} />
        <StatCard label="Reports Submitted" value="2" sub="Last 30 days" icon={Upload} color="16,185,129" delay={0.12} />
        <StatCard label="Next Inspection" value="Jul 15" sub="Sindhudurg Coastal Road" icon={MapPin} color="245,158,11" delay={0.18} />
      </div>
      <AlertRow items={[
        { title: 'ANM-503 — Respond by Jul 20', desc: 'AI flagged embankment altitude variance of 3.2m on Coastal Road', color: 'var(--accent-red)' },
        { title: 'Kudal Water Project — Progress Warning', desc: 'Only 18% complete. Collector requesting updated field report', color: 'var(--accent-amber)' },
      ]} />
    </div>
  );
}

// ─────────────── Default smart-dispatch ───────────────
export default function RoleDashboard() {
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'Joint Secretary, Ministry of Rural Development') return <JSDashboard />;
  if (role === 'CAG Auditor') return <CAGDashboard />;
  if (role === 'State Audit Officer') return <SAODashboard />;
  if (role === 'District Collector') return <DCDashboard />;
  if (role === 'Municipal Officer') return <MODashboard />;
  return <JSDashboard />;
}
