import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HardHat, ShieldCheck, ShieldAlert, Star, AlertTriangle, 
  Layers, FolderOpen, Check, BadgePercent, Landmark, Search
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

const formatINR = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

export default function Contractors({ searchQuery }) {
  const { allContractors: contractors } = useProjects();
  // Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Filter contractors
  const filtered = contractors.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registration.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.verificationStatus === statusFilter;
    const matchesRisk = riskFilter === 'All' || c.riskScore === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Header Card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <HardHat size={14} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contractor Registry</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Verification:</span>
              <select 
                className="select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '5px 28px 5px 10px', fontSize: '0.78rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Under Scrutiny">Under Scrutiny</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Risk Score:</span>
              <select 
                className="select" 
                value={riskFilter} 
                onChange={(e) => setRiskFilter(e.target.value)}
                style={{ padding: '5px 28px 5px 10px', fontSize: '0.78rem' }}
              >
                <option value="All">All Risks</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(statusFilter !== 'All' || riskFilter !== 'All') && (
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                onClick={() => {
                  setStatusFilter('All');
                  setRiskFilter('All');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contractors Grid Layout */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {filtered.map((c, index) => (
          <motion.div 
            key={c.id}
            className="card flex flex-col justify-between"
            style={{ 
              minHeight: '340px',
              // height: '450px',
              gap: '16px',
              borderColor: c.verificationStatus === 'Blacklisted' ? 'rgba(239, 68, 68, 0.25)' : c.verificationStatus === 'Under Scrutiny' ? 'rgba(245, 158, 11, 0.25)' : '',
              background: c.verificationStatus === 'Blacklisted' ? 'linear-gradient(180deg, rgba(239,68,68,0.02) 0%, var(--bg-surface) 100%)' : ''
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
          >
            {/* Header: Name, registration and verification badge */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h3 className="section-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reg: {c.registration}</span>
                </div>
                
                <span 
                  className="badge"
                  style={{
                    backgroundColor: c.verificationStatus === 'Verified' ? 'var(--accent-green-dim)' : c.verificationStatus === 'Under Scrutiny' ? 'var(--accent-amber-dim)' : 'var(--accent-red-dim)',
                    color: c.verificationStatus === 'Verified' ? 'var(--accent-green)' : c.verificationStatus === 'Under Scrutiny' ? 'var(--accent-amber)' : 'var(--accent-red)',
                    boxShadow: c.verificationStatus === 'Blacklisted' ? '0 0 8px rgba(239, 68, 68, 0.15)' : ''
                  }}
                >
                  {c.verificationStatus === 'Verified' ? (
                    <ShieldCheck size={10} style={{ marginRight: '2px' }} />
                  ) : (
                    <ShieldAlert size={10} style={{ marginRight: '2px' }} />
                  )}
                  {c.verificationStatus}
                </span>
              </div>

              {/* Badges block */}
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className="badge badge-muted" style={{ fontSize: '0.68rem', padding: '2px 6px', gap: '2px' }}>{c.state}</span>
                <span 
                  className="badge" 
                  style={{ 
                    fontSize: '0.68rem', 
                    padding: '2px 6px',
                    backgroundColor: c.riskScore === 'High' ? 'var(--accent-red-dim)' : c.riskScore === 'Medium' ? 'var(--accent-amber-dim)' : 'var(--accent-green-dim)',
                    color: c.riskScore === 'High' ? 'var(--accent-red)' : c.riskScore === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-green)',
                  }}
                >
                  {c.riskScore} Risk
                </span>
                <span className="badge badge-muted" style={{ fontSize: '0.68rem', padding: '2px 6px', fontFamily: 'monospace' }}>PAN: {c.pan}</span>
              </div>
            </div>

            {/* Performance and Financials splits */}
            <div className="grid-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)', padding: '12px' }}>
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Total Contract Value</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }} className="display-font">
                  {formatINR(c.totalContractValue)}
                </div>
              </div>
              
              <div>
                <span className="label" style={{ fontSize: '0.62rem' }}>Performance Rating</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Star size={12} fill={c.paymentRating >= 4 ? 'var(--accent-green)' : c.paymentRating >= 3 ? 'var(--accent-amber)' : 'var(--accent-red)'} stroke="none" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.paymentRating}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Active vs Completed projects */}
            <div className="flex gap-4" style={{ fontSize: '0.8rem' }}>
              <div className="flex items-center gap-1.5 text-secondary">
                <FolderOpen size={12} className="text-secondary" style={{ color: 'var(--text-muted)' }} />
                <span>Active: <b>{c.activeProjects}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-secondary">
                <Layers size={12} className="text-secondary" style={{ color: 'var(--text-muted)' }} />
                <span>Completed: <b>{c.completedProjects}</b></span>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Verified: {c.lastVerified}
              </div>
            </div>

            {/* Specialization Tags */}
            <div className="flex gap-2 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              {c.specializations.map((spec, sIdx) => (
                <span 
                  key={sIdx}
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-active)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Red Flags / Warnings list */}
            <div
              style={{
                width: '100%',
                minHeight: '150px',   // try 170, 180 or 200
                // display: 'flex',
                // alignItems: 'flex-start',
                // marginTop: 'auto'
              }}
            >
              {c.redFlags.length > 0 ? (
                <div 
                  className="flex flex-col gap-1 p-2.5"
                  style={{
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <span className="label" style={{ fontSize: '0.6rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={10} />
                    SYSTEM INFRACTION DETECTED ({c.redFlags.length})
                  </span>
                  <ul style={{ paddingLeft: '4px' }} className="flex flex-col gap-0.5">
                    {c.redFlags.map((flag, fIdx) => (
                      <li key={fIdx} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', listStyleType: 'none', lineHeight: 1.3 }} className="flex items-start gap-1">
                        <span style={{ color: 'var(--accent-red)' }}>·</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-1.5 p-2"
                  style={{
                    background: 'rgba(16, 185, 129, 0.04)',
                    border: '1px solid rgba(16, 185, 129, 0.12)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-green)'
                  }}
                >
                  <Check size={12} strokeWidth={2.5} />
                  <span>NOC Cleared — No active system flags raised</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No contractors matching search constraints.
          </div>
        )}
      </div>
    </div>
  );
}
