import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, X, Calendar, MapPin, 
  User, HardHat, Landmark, Clock, CheckCircle2, 
  AlertTriangle, HelpCircle
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

const formatINR = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

export default function Projects({ searchQuery }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { allProjects, schemes } = useProjects();

  if (!schemes || schemes.length === 0) {
    return (
      <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
        Loading projects registry...
      </div>
    );
  }

  // Filters State
  const [schemeFilter, setSchemeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Handle deep-linking from dashboard (e.g. ?id=PRJ-2024-0831)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedProjectId(id);
    }
  }, [searchParams]);

  const closeDrawer = () => {
    setSelectedProjectId(null);
    setSearchParams({});
  };

  const openProjectDrawer = (id) => {
    setSelectedProjectId(id);
    setSearchParams({ id });
  };

  // Filter projects based on filters + search query
  const filtered = allProjects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesScheme = schemeFilter === 'All' || p.scheme === schemeFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || p.riskScore === riskFilter;

    return matchesSearch && matchesScheme && matchesStatus && matchesRisk;
  });

  const selectedProject = allProjects.find(p => p.id === selectedProjectId);

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - var(--topbar-height) - 100px)' }}>
      {/* Filters Header Card */}
      <div className="card mb-6" style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Projects</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Scheme Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Scheme:</span>
              <select 
                className="select" 
                value={schemeFilter} 
                onChange={(e) => setSchemeFilter(e.target.value)}
                style={{ padding: '5px 28px 5px 10px', fontSize: '0.78rem' }}
              >
                <option value="All">All Schemes</option>
                {schemes.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Status:</span>
              <select 
                className="select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '5px 28px 5px 10px', fontSize: '0.78rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Risk:</span>
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

            {/* Clear Filters Button */}
            {(schemeFilter !== 'All' || statusFilter !== 'All' || riskFilter !== 'All') && (
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                onClick={() => {
                  setSchemeFilter('All');
                  setStatusFilter('All');
                  setRiskFilter('All');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Name</th>
                <th>Scheme</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Completion</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => openProjectDrawer(p.id)}
                  style={{ 
                    background: selectedProjectId === p.id ? 'var(--bg-active)' : '',
                    borderColor: selectedProjectId === p.id ? 'var(--border-strong)' : ''
                  }}
                >
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {p.id}
                  </td>
                  <td style={{ fontWeight: 500, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: `${p.schemeId === 'pmgsy' ? 'var(--accent-blue-dim)' : p.schemeId === 'jjm' ? 'var(--accent-cyan-dim)' : p.schemeId === 'pmay' ? 'var(--accent-purple-dim)' : 'var(--accent-green-dim)'}`, 
                        color: `${p.schemeId === 'pmgsy' ? 'var(--accent-blue)' : p.schemeId === 'jjm' ? 'var(--accent-cyan)' : p.schemeId === 'pmay' ? 'var(--accent-purple)' : 'var(--accent-green)'}` 
                      }}
                    >
                      {p.scheme}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {p.village}, {p.district}
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatINR(p.budget)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatINR(p.spent)}</td>
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
                      <span style={{ fontSize: '0.72rem', minWidth: '28px', textAlign: 'right' }}>{p.completion}%</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: p.status === 'Completed' ? 'var(--accent-green-dim)' : p.status === 'Delayed' ? 'var(--accent-amber-dim)' : p.status === 'Suspended' ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)', 
                        color: p.status === 'Completed' ? 'var(--accent-green)' : p.status === 'Delayed' ? 'var(--accent-amber)' : p.status === 'Suspended' ? 'var(--accent-red)' : 'var(--accent-blue)' 
                      }}
                    >
                      <span className={`dot ${p.status === 'Completed' ? 'dot-green' : p.status === 'Delayed' ? 'dot-amber' : p.status === 'Suspended' ? 'dot-red' : 'dot-blue'}`} style={{ width: '5px', height: '5px' }} />
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
                      <span className={`dot ${p.riskScore === 'High' ? 'dot-red' : p.riskScore === 'Medium' ? 'dot-amber' : 'dot-green'}`} />
                      {p.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <HelpCircle size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No projects matching the query found</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: '2px' }}>Try clearing filters or refining your search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sliding Side Details Drawer */}
      <AnimatePresence>
        {selectedProject && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              className="modal-overlay" 
              style={{ background: 'rgba(0,0,0,0.5)', zIndex: 120, justifyContent: 'flex-end', padding: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />

            {/* Sliding Drawer Container */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '480px',
                maxWidth: '90vw',
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border)',
                zIndex: 130,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.5)'
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            >
              {/* Drawer Header */}
              <div 
                className="flex items-center justify-between p-5" 
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="label" style={{ fontFamily: 'monospace' }}>{selectedProject.id}</span>
                    <span 
                      className="badge"
                      style={{ 
                        backgroundColor: `${selectedProject.schemeId === 'pmgsy' ? 'var(--accent-blue-dim)' : selectedProject.schemeId === 'jjm' ? 'var(--accent-cyan-dim)' : selectedProject.schemeId === 'pmay' ? 'var(--accent-purple-dim)' : 'var(--accent-green-dim)'}`, 
                        color: `${selectedProject.schemeId === 'pmgsy' ? 'var(--accent-blue)' : selectedProject.schemeId === 'jjm' ? 'var(--accent-cyan)' : selectedProject.schemeId === 'pmay' ? 'var(--accent-purple)' : 'var(--accent-green)'}` 
                      }}
                    >
                      {selectedProject.scheme}
                    </span>
                  </div>
                  <h3 className="section-title" style={{ fontSize: '1.05rem', fontWeight: 600 }}>{selectedProject.name}</h3>
                </div>
                <button 
                  className="btn-icon" 
                  style={{ borderRadius: '50%', padding: '6px' }}
                  onClick={closeDrawer}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body - Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="flex flex-col gap-6">
                {/* Description block */}
                <div>
                  <span className="label">Project Scope</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                    {selectedProject.description}
                  </p>
                </div>

                {/* Risk and Status Summary Banner */}
                <div 
                  className="flex justify-between items-center p-3" 
                  style={{ 
                    background: 'var(--bg-elevated)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)' 
                  }}
                >
                  <div>
                    <span className="label" style={{ fontSize: '0.62rem' }}>Audit Status</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`dot ${selectedProject.status === 'Completed' ? 'dot-green' : selectedProject.status === 'Delayed' ? 'dot-amber' : selectedProject.status === 'Suspended' ? 'dot-red' : 'dot-blue'}`} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedProject.status}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="label" style={{ fontSize: '0.62rem' }}>Risk Assessment</span>
                    <div className="flex items-center gap-1.5 mt-1 justify-end">
                      <span className={`dot ${selectedProject.riskScore === 'High' ? 'dot-red' : selectedProject.riskScore === 'Medium' ? 'dot-amber' : 'dot-green'}`} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedProject.riskScore}</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics details */}
                <div className="grid-2">
                  <div style={{ background: 'var(--bg-elevated)', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)' }}>
                    <span className="label" style={{ fontSize: '0.62rem' }}>Location</span>
                    <div className="flex items-center gap-1.5 mt-1.5" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      <MapPin size={12} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
                      <span>{selectedProject.village}, {selectedProject.district}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{selectedProject.state}</span>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)' }}>
                    <span className="label" style={{ fontSize: '0.62rem' }}>Timeline</span>
                    <div className="flex items-center gap-1.5 mt-1.5" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      <Calendar size={12} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
                      <span>Target: {new Date(selectedProject.expectedEnd).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Started: {new Date(selectedProject.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Financial Ledger card */}
                <div>
                  <span className="label">Financial Pass-down</span>
                  <div className="card mt-2" style={{ padding: '16px' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Budget Utilized</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedProject.completion}% Complete</span>
                    </div>
                    <div className="progress-bar-track mb-3">
                      <div className="progress-bar-fill" style={{ width: `${selectedProject.completion}%`, backgroundColor: 'var(--accent-green)' }} />
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.78rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Spent</div>
                        <div style={{ fontWeight: 600, marginTop: '2px' }}>{formatINR(selectedProject.spent)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>Total Budget</div>
                        <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--text-primary)' }}>{formatINR(selectedProject.budget)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disbursements list */}
                <div>
                  <span className="label">Tranche Disbursement History</span>
                  <div className="flex flex-col gap-2 mt-2">
                    {selectedProject.disbursements.map((disb, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-2.5"
                        style={{ 
                          background: 'var(--bg-elevated)', 
                          border: '1px solid var(--border-subtle)', 
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Landmark size={12} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{formatINR(disb.amount)}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{new Date(disb.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: disb.status === 'Released' ? 'var(--accent-green-dim)' : disb.status === 'Pending' ? 'var(--accent-amber-dim)' : 'var(--accent-red-dim)',
                            color: disb.status === 'Released' ? 'var(--accent-green)' : disb.status === 'Pending' ? 'var(--accent-amber)' : 'var(--accent-red)',
                            fontSize: '0.65rem'
                          }}
                        >
                          {disb.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones Construction Timeline checklist */}
                <div>
                  <span className="label">Construction Milestones Checklist</span>
                  <div className="flex flex-col gap-3 mt-3">
                    {selectedProject.timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div 
                            className="flex items-center justify-center" 
                            style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '50%', 
                              background: event.status === 'done' ? 'var(--accent-green-dim)' : event.status === 'active' ? 'var(--accent-blue-dim)' : event.status === 'flagged' ? 'var(--accent-red-dim)' : event.status === 'delayed' ? 'var(--accent-amber-dim)' : 'var(--bg-active)',
                              color: event.status === 'done' ? 'var(--accent-green)' : event.status === 'active' ? 'var(--accent-blue)' : event.status === 'flagged' ? 'var(--accent-red)' : event.status === 'delayed' ? 'var(--accent-amber)' : 'var(--text-muted)',
                              border: `1px solid ${event.status === 'done' ? 'var(--accent-green)' : event.status === 'active' ? 'var(--accent-blue)' : event.status === 'flagged' ? 'var(--accent-red)' : event.status === 'delayed' ? 'var(--accent-amber)' : 'var(--border)'}`,
                              zIndex: 2
                            }}
                          >
                            {event.status === 'done' ? (
                              <CheckCircle2 size={10} strokeWidth={2.5} />
                            ) : event.status === 'flagged' ? (
                              <AlertTriangle size={10} strokeWidth={2.5} />
                            ) : event.status === 'delayed' ? (
                              <Clock size={10} strokeWidth={2.5} />
                            ) : event.status === 'active' ? (
                              <span className="dot dot-blue animate-pulse" style={{ width: '5px', height: '5px' }} />
                            ) : (
                              <span style={{ width: '4px', height: '4px', background: 'var(--text-disabled)', borderRadius: '50%' }} />
                            )}
                          </div>
                          {idx < selectedProject.timeline.length - 1 && (
                            <div style={{ width: '1px', background: 'var(--border)', flex: 1, margin: '4px 0', minHeight: '16px' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: idx < selectedProject.timeline.length - 1 ? '10px' : '0' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: event.status === 'done' ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{event.event}</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                              {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Field Officer details card */}
                <div 
                  className="p-3" 
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    background: 'linear-gradient(135deg, rgba(24,24,27,0.8) 0%, rgba(17,17,19,0.8) 100%)' 
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <div 
                      className="flex items-center justify-center" 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px', 
                        background: 'var(--bg-active)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <User size={16} />
                    </div>
                    <div>
                      <div className="label" style={{ fontSize: '0.6rem' }}>Assigned Field Officer</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProject.officer}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ID: {selectedProject.officerId}</div>
                    </div>
                  </div>
                </div>

                {/* Contractor credentials */}
                <div 
                  className="p-3" 
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius)', 
                    background: 'var(--bg-elevated)'
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <div 
                      className="flex items-center justify-center" 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px', 
                        background: 'var(--bg-active)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <HardHat size={16} />
                    </div>
                    <div>
                      <div className="label" style={{ fontSize: '0.6rem' }}>Awarded Contractor</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProject.contractor}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ID: {selectedProject.contractorId}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
