import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, AlertTriangle, AlertCircle, CheckCircle, 
  Info, ShieldCheck, Search, ShieldAlert, Cpu, User, UserCheck
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export default function Audit({ searchQuery }) {
  const { allAuditLogs: auditLogs } = useProjects();
  // Filters State
  const [severityFilter, setSeverityFilter] = useState('All');
  const [actorTypeFilter, setActorTypeFilter] = useState('All');

  // Filter logs
  const filtered = auditLogs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;
    const matchesActorType = actorTypeFilter === 'All' || log.actorType === actorTypeFilter;

    return matchesSearch && matchesSeverity && matchesActorType;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Header Card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>System Integrity Ledgers</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Severity:</span>
              <select 
                className="select" 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ padding: '5px 28px 5px 10px', fontSize: '0.78rem' }}
              >
                <option value="All">All Levels</option>
                <option value="critical">Critical Only</option>
                <option value="warning">Warning Only</option>
                <option value="success">Success Only</option>
                <option value="info">Info Only</option>
              </select>
            </div>

            {/* Actor Type Filter */}
            <div className="flex items-center gap-2">
              <span className="label" style={{ fontSize: '0.65rem' }}>Actor Type:</span>
              <select 
                className="select" 
                value={actorTypeFilter} 
                onChange={(e) => setActorTypeFilter(e.target.value)}
                style={{ padding: '5px 28px 5px 10px', fontSize: '0.78rem' }}
              >
                <option value="All">All Actor Types</option>
                <option value="Field Officer">Field Officer</option>
                <option value="Admin">Admin</option>
                <option value="System">System Engine</option>
              </select>
            </div>

            {/* Reset */}
            {(severityFilter !== 'All' || actorTypeFilter !== 'All') && (
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                onClick={() => {
                  setSeverityFilter('All');
                  setActorTypeFilter('All');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Chronology Card */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <span className="label">Verification History Logs</span>
          <div className="badge badge-muted">
            {filtered.length} Logs Parsed
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((log, index) => {
            // Pick icon and color scheme based on severity
            let sevIcon = (
              <Info
                size={14}
                style={{
                  transform: 'translate(0.5px, 0.5px)'
                }}
              />
            );
            let sevColor = 'var(--accent-blue)';
            let sevBg = 'var(--accent-blue-dim)';
            
            if (log.severity === 'critical') {
              sevIcon = <AlertCircle size={14} />;
              sevColor = 'var(--accent-red)';
              sevBg = 'var(--accent-red-dim)';
            } else if (log.severity === 'warning') {
              sevIcon = <AlertTriangle size={14} />;
              sevColor = 'var(--accent-amber)';
              sevBg = 'var(--accent-amber-dim)';
            } else if (log.severity === 'success') {
              sevIcon = <CheckCircle size={14} />;
              sevColor = 'var(--accent-green)';
              sevBg = 'var(--accent-green-dim)';
            }

            // Pick icon based on actorType
            let actorIcon = <User size={12} />;
            if (log.actorType === 'System') {
              actorIcon = <Cpu size={12} />;
            } else if (log.actorType === 'Admin') {
              actorIcon = <UserCheck size={12} />;
            }

            return (
              <motion.div
                key={log.id}
                className="p-4 flex gap-4 items-center"
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid var(--border-subtle)`,
                  borderRadius: 'var(--radius)',
                  transition: 'border-color var(--transition)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                whileHover={{ borderColor: 'var(--border-strong)' }}
              >
                {/* Left severity indicator */}
                <div 
                  className="flex items-center justify-center"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    // alignSelf: 'center',
                    color: sevColor,
                    backgroundColor: sevBg,
                    flexShrink: 0
                  }}
                >
                  {sevIcon}
                </div>

                {/* Main Content details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 flex-wrap mb-1.5">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                          {log.action}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>·</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} className="flex items-center gap-1">
                          {actorIcon}
                          {log.actor} ({log.actorType})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Affected Entity: <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{log.entityName}</span> <span style={{ fontFamily: 'monospace' }}>({log.entity})</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }} className="flex items-center gap-2.5">
                      <span className="badge badge-muted" style={{ fontSize: '0.62rem', padding: '1px 5px', fontFamily: 'monospace' }}>
                        {log.id}
                      </span>
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }} className="mt-2">
                    {log.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No audit log entries matching search parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
