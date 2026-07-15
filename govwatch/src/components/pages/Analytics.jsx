import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, ShieldAlert, Award, FileSpreadsheet, 
  HelpCircle, ChevronRight, Activity, Percent
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

const formatINR = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

export default function Analytics() {
  const { 
    allProjects = [],
    budgetData, 
    kpiData 
  } = useProjects();

  const safeBudgetData = budgetData || { monthlyTrend: [], schemeWise: [] };
  const safeKpiData = kpiData || { budgetUtilization: 0, totalProjects: 0, activeProjects: 0, totalBudget: 0 };

  const lowCount = allProjects.filter(p => p.riskScore === 'Low').length;
  const mediumCount = allProjects.filter(p => p.riskScore === 'Medium').length;
  const highCount = allProjects.filter(p => p.riskScore === 'High').length;

  const riskDistribution = [
    { name: 'Low Risk', value: lowCount, fill: '#10B981', bgDim: 'var(--accent-green-dim)' },
    { name: 'Medium Risk', value: mediumCount, fill: '#F59E0B', bgDim: 'var(--accent-amber-dim)' },
    { name: 'High Risk', value: highCount, fill: '#EF4444', bgDim: 'var(--accent-red-dim)' }
  ];

  // Group by district dynamically
  const districtMap = {};
  allProjects.forEach(p => {
    const distName = p.district || p.village || 'Unknown';
    if (!districtMap[distName]) {
      districtMap[distName] = { name: distName, state: p.state || '', completions: [], statuses: [] };
    }
    districtMap[distName].completions.push(p.completion || 0);
    districtMap[distName].statuses.push(p.status);
  });

  const districtPerformance = Object.values(districtMap).map(d => {
    const avgCompletion = d.completions.length ? Math.round(d.completions.reduce((a,b)=>a+b, 0) / d.completions.length) : 0;
    
    let status = 'In Progress';
    if (d.statuses.includes('Suspended')) status = 'Suspended';
    else if (d.statuses.includes('Delayed')) status = 'Delayed';
    else if (avgCompletion === 100) status = 'Completed';
    
    let color = 'var(--accent-blue)';
    if (status === 'Completed') color = 'var(--accent-green)';
    else if (status === 'Delayed') color = 'var(--accent-amber)';
    else if (status === 'Suspended') color = 'var(--accent-red)';

    return {
      name: d.name,
      state: d.state,
      completion: avgCompletion,
      status,
      color
    };
  }).sort((a, b) => b.completion - a.completion);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Top statistics banners */}
      <motion.div variants={itemVariants} className="grid-4">
        {/* KPI: Utilization */}
        <div className="card flex items-center justify-between p-5">
          <div>
            <span className="label">National Utilization</span>
            <h3 className="stat-number mt-2">{safeKpiData?.budgetUtilization ?? 0}%</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>FY 2026 Average</span>
          </div>
          <div className="btn-icon" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <Percent size={18} />
          </div>
        </div>

        {/* KPI: Risk Rating */}
        <div className="card flex items-center justify-between p-5">
          <div>
            <span className="label">Average Risk Index</span>
            <h3 className="stat-number mt-2" style={{ color: 'var(--accent-amber)' }}>Medium</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Based on audit factors</span>
          </div>
          <div className="btn-icon" style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <ShieldAlert size={18} />
          </div>
        </div>

        {/* KPI: Completed vs Target */}
        <div className="card flex items-center justify-between p-5">
          <div>
            <span className="label">Milestones Met</span>
            <h3 className="stat-number mt-2">14 / 18</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>77.7% project milestones</span>
          </div>
          <div className="btn-icon">
            <Award size={18} />
          </div>
        </div>

        {/* KPI: Audit logs count */}
        <div className="card flex items-center justify-between p-5">
          <div>
            <span className="label">Weekly Audits</span>
            <h3 className="stat-number mt-2">10</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>System events processed</span>
          </div>
          <div className="btn-icon">
            <FileSpreadsheet size={18} />
          </div>
        </div>
      </motion.div>

      {/* Primary Analytics row */}
      <motion.div variants={itemVariants} className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Scheme Allocations Stacked Bars */}
        <div className="card">
          <div className="mb-4">
            <span className="label">Comparative Scheme Analysis</span>
            <h3 className="section-title mt-1">Allocated vs. Utilized vs. Pending Reimbursements</h3>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeBudgetData?.schemeWise || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="scheme" tickLine={false} />
                <YAxis tickFormatter={(val) => `₹${val / 10000000} Cr`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                  formatter={(value) => [formatINR(value), '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="allocated" name="Budget Allocated" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilized" name="Amount Utilized" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendingReimbursement" name="Pending Claims" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie Chart */}
        <div className="card flex flex-col justify-between">
          <div>
            <span className="label">Risk Vectors</span>
            <h3 className="section-title mt-1">Project Risk Breakdown</h3>
          </div>

          <div style={{ width: '100%', height: '160px' }} className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', fontSize: '11px' }}
                  formatter={(value) => [`${value} Projects`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2" style={{ fontSize: '0.8rem' }}>
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex justify-between items-center p-1.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span className="flex items-center gap-2">
                  <span className="dot" style={{ backgroundColor: item.fill }} />
                  {item.name}
                </span>
                <span style={{ fontWeight: 600 }}>{item.value} ({((item.value / (allProjects.length || 1)) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Secondary row split */}
      <motion.div variants={itemVariants} className="grid-2">
        {/* District completion Performance rating */}
        <div className="card flex flex-col justify-between">
          <div>
            <span className="label">Spatial Performance</span>
            <h3 className="section-title mt-1">District Node Completion Scores</h3>
          </div>

          <div className="flex flex-col gap-3 mt-4" style={{ flex: 1 }}>
            {districtPerformance.map((d, index) => (
              <div key={index} style={{ fontSize: '0.8rem' }}>
                <div className="flex justify-between items-center mb-1">
                  <span>{d.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({d.state})</span></span>
                  <span style={{ fontWeight: 600, color: d.color }}>{d.completion}% · {d.status}</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${d.completion}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Overview */}
        <div className="card flex flex-col justify-between">
          <div>
            <span className="label">Activity Analysis</span>
            <h3 className="section-title mt-1">Monthly Expenditure Trend</h3>
          </div>
          <div style={{ width: '100%', height: '240px' }} className="mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeBudgetData?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpentArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickFormatter={(val) => `₹${val / 10000000} Cr`} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                  formatter={(value) => [formatINR(value), 'Expenditure']}
                />
                <Area type="monotone" dataKey="spent" stroke="var(--accent-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorSpentArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
