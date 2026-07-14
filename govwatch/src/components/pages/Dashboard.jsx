import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, AlertTriangle, TrendingUp, CheckCircle2, 
  Clock, Ban, Coins, ShieldAlert, ArrowUpRight, Activity, Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { kpiData, budgetData, activityFeed, auditLogs, projects } from '../../data/mockData';

// Formatter for currency in Indian format (Lakhs / Crores)
const formatINR = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(value / 100000).toFixed(1)} L`;
};

export default function Dashboard({ searchQuery }) {
  const navigate = useNavigate();

  // Filter projects if search query is provided
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stagger animation container config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Top Welcome Panel */}
      <motion.div variants={itemVariants} className="card flex items-left justify-between gap-4 p-6" style={{ background: 'linear-gradient(90deg, #111113 0%, #15151a 100%)', borderWidth: '1px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>National Infrastructure Intelligence Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px'}}>
            Real-time monitoring panel for Central, State, and District infrastructure funding disbursements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="badge badge-green">
            <span className="dot dot-green" />
            Live Syncing (PFMS)
          </div>
          <div className="badge badge-blue">
            <Calendar size={12} />
            FY 2026-27
          </div>
        </div>
      </motion.div>

      {/* KPI Grid - Asymmetric Layout */}
      <motion.div variants={itemVariants} className="grid-4">
        {/* Total Budget Card - Larger / Colored highlight */}
        <div className="card flex flex-col justify-between" style={{ gridColumn: 'span 2', minHeight: '140px', background: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.08), transparent 60%), var(--bg-surface)' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="label">Total Allocation</span>
              <h3 className="stat-number mt-2" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{formatINR(kpiData.totalBudget)}</h3>
            </div>
            <div className="btn-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', borderColor: 'rgba(59,130,246,0.2)' }}>
              <Coins size={18} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div>
              <div className="label" style={{ fontSize: '0.62rem' }}>State Released</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatINR(budgetData.stateReleased)}</div>
            </div>
            <div>
              <div className="label" style={{ fontSize: '0.62rem' }}>District Disbursed</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatINR(budgetData.districtDisbursed)}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div className="label" style={{ fontSize: '0.62rem' }}>Utilization</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-green)' }}>{kpiData.budgetUtilization}%</div>
            </div>
          </div>
        </div>

        {/* Active Projects KPI */}
        <div className="card flex flex-col justify-between" style={{ minHeight: '140px' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="label">Active Projects</span>
              <h3 className="stat-number mt-2">{kpiData.activeProjects}</h3>
            </div>
            <div className="btn-icon">
              <FolderKanban size={18} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span className="dot dot-blue" />
            <span>{kpiData.completedProjects} Completed · {kpiData.delayedProjects} Delayed</span>
          </div>
        </div>

        {/* Risk / Alerts KPI */}
        <div className="card flex flex-col justify-between" style={{ minHeight: '140px', background: 'radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.05), transparent 60%), var(--bg-surface)' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="label">Risk Alerts</span>
              <h3 className="stat-number mt-2" style={{ color: 'var(--accent-red)' }}>{kpiData.fraudAlertsThisMonth}</h3>
            </div>
            <div className="btn-icon" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span className="dot dot-red animate-pulse" />
            <span>{kpiData.flaggedContractors} Contractors under scrutiny</span>
          </div>
        </div>
      </motion.div>

      {/* Analytics Visualization Section */}
      <motion.div variants={itemVariants} className="grid-3">
        {/* Budget Allocation Trend Area Chart */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="label">Financial Pipeline</span>
              <h3 className="section-title mt-1">Monthly Disbursals vs Expenditures</h3>
            </div>
            <div className="badge badge-muted">
              <TrendingUp size={12} />
              +14.2% MoM
            </div>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetData.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickFormatter={(val) => `₹${val / 10000000} Cr`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                  formatter={(value) => [formatINR(value), '']}
                />
                <Area type="monotone" dataKey="allocated" name="Allocated" stroke="var(--accent-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorAllocated)" />
                <Area type="monotone" dataKey="spent" name="Spent" stroke="var(--accent-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Utilization Ring & Scheme wise allocation */}
        <div className="card flex flex-col justify-between">
          <div>
            <span className="label">Scheme Distribution</span>
            <h3 className="section-title mt-1">Allocation by Scheme</h3>
          </div>
          <div style={{ width: '100%', height: '180px' }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData.schemeWise.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `₹${val / 10000000}C`} tickLine={false} />
                <YAxis dataKey="scheme" type="category" width={70} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                  formatter={(value) => [formatINR(value), 'Allocated']}
                />
                <Bar dataKey="allocated" radius={[0, 4, 4, 0]}>
                  {budgetData.schemeWise.slice(0, 5).map((entry, index) => {
                    const colors = ['#3B82F6', '#10B981', '#06B6D4', '#8B5CF6', '#F59E0B'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Avg Utilization Rate</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>58.5%</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Split: Asymmetric Layout */}
      <motion.div variants={itemVariants} className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Side: Recent Projects Table */}
        <div className="card flex flex-col ">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="label">Infrastructure Records</span>
              <h3 className="section-title mt-1">High Budget Projects</h3>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Scheme</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Completion</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.slice(0, 8).map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/projects?id=${p.id}`)}>
                    <td style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: `${p.schemeId === 'pmgsy' ? 'var(--accent-blue-dim)' : p.schemeId === 'jjm' ? 'var(--accent-cyan-dim)' : p.schemeId === 'pmay' ? 'var(--accent-purple-dim)' : 'var(--accent-green-dim)'}`, color: `${p.schemeId === 'pmgsy' ? 'var(--accent-blue)' : p.schemeId === 'jjm' ? 'var(--accent-cyan)' : p.schemeId === 'pmay' ? 'var(--accent-purple)' : 'var(--accent-green)'}` }}>
                        {p.scheme}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {p.village}, {p.district}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatINR(p.budget)}</td>
                    <td style={{ width: '130px' }}>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar-track" style={{ flex: 1 }}>
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: `${p.completion}%`,
                              backgroundColor: p.status === 'Delayed' ? 'var(--accent-amber)' : p.status === 'Suspended' ? 'var(--accent-red)' : 'var(--accent-green)'
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', minWidth: '28px', textAlign: 'right' }}>{p.completion}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
                        <span className={`dot ${p.riskScore === 'High' ? 'dot-red' : p.riskScore === 'Medium' ? 'dot-amber' : 'dot-green'}`} />
                        {p.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Activity & Audit Alert Feeds */}
        <div className="card flex flex-col justify-between" style={{ gap: '20px' }}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="section-title">Audit Feed</h3>
            </div>
            <div className="flex flex-col gap-4">
              {activityFeed.slice(0, 4).map((feed) => (
                <div key={feed.id} className="flex gap-3" style={{ fontSize: '0.8rem' }}>
                  <div style={{ marginTop: '3px' }}>
                    <span 
                      className={`dot ${feed.type === 'alert' ? 'dot-red animate-pulse' : feed.type === 'disbursement' ? 'dot-blue' : feed.type === 'verification' ? 'dot-green' : 'dot-muted'}`} 
                      style={{ width: '8px', height: '8px', display: 'block' }}
                    />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      <span style={{ fontWeight: 600 }}>{feed.actor}</span> {feed.action}{' '}
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{feed.target}</span>
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{feed.time} · {feed.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
            <h4 className="label mb-3">Audit Warnings</h4>
            <div className="flex flex-col gap-2">
              {auditLogs
                .filter((log) => log.severity === 'critical')
                .slice(0, 2)
                .map((log) => (
                  <div 
                    key={log.id} 
                    className="flex flex-col gap-1 p-2.5" 
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.04)', 
                      border: '1px solid rgba(239, 68, 68, 0.15)', 
                      borderRadius: 'var(--radius-sm)' 
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-red)' }} className="flex items-center gap-1">
                        <AlertTriangle size={10} />
                        FRAUD THREAT
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {log.detail}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
