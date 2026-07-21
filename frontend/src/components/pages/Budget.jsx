import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Landmark, HelpCircle, ArrowRight, 
  CheckCircle2, AlertTriangle, XCircle, Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { useProjects } from '../../context/ProjectContext';

const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

export default function Budget({ searchQuery }) {
  const { budgetData } = useProjects();

  if (!budgetData) {
    return (
      <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        Loading financial pipeline transmission data...
      </div>
    );
  }

  const totalWithholds = (budgetData.pendingReimbursements || [])
    .filter(r => r.status === 'Withheld')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDisputed = (budgetData.pendingReimbursements || [])
    .filter(r => r.status === 'Disputed')
    .reduce((sum, r) => sum + r.amount, 0);

  // Filter pending reimbursements based on search query
  const filteredReimbursements = budgetData.pendingReimbursements.filter(r => 
    r.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.scheme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stagger animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  // Fund pipeline flow percentages
  const flowPct = {
    state: ((budgetData.stateReleased / budgetData.centralAllocation) * 100).toFixed(1),
    district: ((budgetData.districtDisbursed / budgetData.stateReleased) * 100).toFixed(1),
    utilized: ((budgetData.utilized / budgetData.districtDisbursed) * 100).toFixed(1),
  };

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Financial Pipeline Flow Visual */}
      <motion.div variants={itemVariants} className="card">
        <span className="label">Financial Transmission Pipeline</span>
        <h3 className="section-title mt-1 mb-6">Central Allocation to Field Expenditure Flow</h3>

        <div className="flex justify-between items-center gap-4 flex-wrap" style={{ position: 'relative' }}>
          {/* Level 1: Central */}
          <div className="flex-1 min-w-[200px] card-elevated" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Landmark size={14} className="text-secondary" style={{ color: 'var(--accent-blue)' }} />
              <span className="label" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>1. Central Budget</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="display-font">
              {formatINR(budgetData.centralAllocation)}
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sanctioned Pool</span>
          </div>

          <ArrowRight size={16} className="text-secondary hidden md:block" style={{ color: 'var(--text-disabled)' }} />

          {/* Level 2: State */}
          <div className="flex-1 min-w-[200px] card-elevated" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Landmark size={14} style={{ color: 'var(--accent-purple)' }} />
                <span className="label" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>2. State Released</span>
              </div>
              <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>{flowPct.state}% pass</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="display-font">
              {formatINR(budgetData.stateReleased)}
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Released to State Treasuries</span>
          </div>

          <ArrowRight size={16} className="text-secondary hidden md:block" style={{ color: 'var(--text-disabled)' }} />

          {/* Level 3: District */}
          <div className="flex-1 min-w-[200px] card-elevated" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Landmark size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span className="label" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>3. District Disbursed</span>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>{flowPct.district}% pass</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="display-font">
              {formatINR(budgetData.districtDisbursed)}
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned to District Collectors</span>
          </div>

          <ArrowRight size={16} className="text-secondary hidden md:block" style={{ color: 'var(--text-disabled)' }} />

          {/* Level 4: Utilized */}
          <div className="flex-1 min-w-[200px] card-elevated" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Wallet size={14} style={{ color: 'var(--accent-green)' }} />
                <span className="label" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>4. Utilized</span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>{flowPct.utilized}% spent</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="display-font">
              {formatINR(budgetData.utilized)}
            </h4>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Contractor Payments</span>
          </div>
        </div>
      </motion.div>

      {/* Scheme Comparative Charts */}
      <motion.div variants={itemVariants} className="layout-18-12">
        {/* Allocation vs Utilization Recharts */}
        <div className="card">
          <div className="mb-4">
            <span className="label">Scheme Metrics</span>
            <h3 className="section-title mt-1">Allocation vs. Utilization Comparison</h3>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData.schemeWise} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="card flex flex-col justify-between">
          <div>
            <span className="label">Transmission Summary</span>
            <h3 className="section-title mt-1">Fiduciary Status</h3>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Central Retention Pool</span>
              <span style={{ fontWeight: 600 }}>{formatINR(budgetData.centralAllocation - budgetData.stateReleased)}</span>
            </div>
            <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>State Transit Pool</span>
              <span style={{ fontWeight: 600 }}>{formatINR(budgetData.stateReleased - budgetData.districtDisbursed)}</span>
            </div>
            <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>District Disbursal Float</span>
              <span style={{ fontWeight: 600 }}>{formatINR(budgetData.districtDisbursed - budgetData.utilized)}</span>
            </div>
            <div className="divider" />
            <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Audit Withholds</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>{formatINR(totalWithholds)}</span>
            </div>
            <div className="flex justify-between items-center" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Disputed Claims Float</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>{formatINR(totalDisputed)}</span>
            </div>
          </div>
          <div className="p-3 mt-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              * Transit pools reflect funds cleared from PFMS but held in nodal state agency accounts, awaiting milestones validation checks.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pending Reimbursement Requests Registry */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="label">Payment Verification Registry</span>
            <h3 className="section-title mt-1">Pending Reimbursement Claims</h3>
          </div>
          <div className="badge badge-muted">
            {filteredReimbursements.length} Claims Active
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Project Name</th>
                <th>Scheme</th>
                <th>Requested Amount</th>
                <th>Date Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReimbursements.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {c.id}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {c.project}
                  </td>
                  <td>
                    <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>
                      {c.scheme}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatINR(c.amount)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(c.submittedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: c.status === 'Approved' ? 'var(--accent-green-dim)' : c.status === 'Under Review' ? 'var(--accent-blue-dim)' : c.status === 'Withheld' ? 'var(--accent-red-dim)' : 'var(--accent-amber-dim)', 
                        color: c.status === 'Approved' ? 'var(--accent-green)' : c.status === 'Under Review' ? 'var(--accent-blue)' : c.status === 'Withheld' ? 'var(--accent-red)' : 'var(--accent-amber)' 
                      }}
                    >
                      {c.status === 'Approved' ? (
                        <CheckCircle2 size={10} style={{ marginRight: '3px' }} />
                      ) : c.status === 'Under Review' ? (
                        <Clock size={10} style={{ marginRight: '3px' }} />
                      ) : c.status === 'Withheld' ? (
                        <XCircle size={10} style={{ marginRight: '3px' }} />
                      ) : (
                        <AlertTriangle size={10} style={{ marginRight: '3px' }} />
                      )}
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredReimbursements.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    No reimbursement requests found matching the search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
