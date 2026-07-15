import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Sun, Moon, LogOut, UserCircle, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProjects } from '../../context/ProjectContext';
import styles from './Topbar.module.css';

const pageTitles = {
  // Common
  '/': { title: 'Dashboard', subtitle: 'Role-specific overview and activity summary' },
  '/projects': { title: 'Projects', subtitle: 'All infrastructure project records' },
  '/budget': { title: 'Budget & Funds', subtitle: 'Allocation, disbursement, and expenditure tracking' },
  '/map': { title: 'Map View', subtitle: 'Geographic distribution of active projects' },
  '/contractors': { title: 'Contractors', subtitle: 'Registered contractors and verification status' },
  '/analytics': { title: 'Analytics', subtitle: 'Performance metrics and trend analysis' },
  '/audit': { title: 'Audit Logs', subtitle: 'System activity, changes, and verification history' },
  '/notifications': { title: 'Notifications', subtitle: 'System alerts, AI findings, and action requests' },
  '/settings': { title: 'Settings', subtitle: 'Profile, preferences, and account configuration' },
  '/profile': { title: 'Profile', subtitle: 'Your account details and credentials' },
  '/help': { title: 'Help & Documentation', subtitle: 'User guides, procedures, and support resources' },
  // Joint Secretary
  '/js/state-comparison': { title: 'State Comparison', subtitle: 'National state-wise performance index and fund utilisation' },
  '/js/user-management': { title: 'User Management', subtitle: 'Authorized government officer accounts and access control' },
  '/js/ai-configuration': { title: 'AI Configuration', subtitle: 'Risk engine parameters and model thresholds' },
  '/js/audit-assignments': { title: 'Audit Assignments', subtitle: 'Allocate pending audits to CAG officers' },
  // CAG Auditor
  '/cag/audit-queue': { title: 'Audit Queue', subtitle: 'Assigned project audits pending verification' },
  '/cag/ai-verification': { title: 'AI Verification Results', subtitle: 'Neural inspection anomaly findings requiring review' },
  '/cag/evidence-viewer': { title: 'Evidence Viewer', subtitle: 'Geotagged images vs CAD drawings side-by-side analysis' },
  '/cag/download-reports': { title: 'Download Reports', subtitle: 'Export and download audit compliance reports' },
  // State Audit Officer
  '/sao/district-performance': { title: 'District Performance', subtitle: 'State-wide district comparison metrics and alerts' },
  '/sao/pending-investigations': { title: 'Pending Investigations', subtitle: 'Active integrity alerts and open audit cases' },
  // District Collector
  '/dc/projects': { title: 'District Projects', subtitle: 'Active infrastructure projects in your district' },
  '/dc/field-inspections': { title: 'Field Inspections', subtitle: 'Municipal officer inspection schedule and assignments' },
  '/dc/verification-requests': { title: 'Verification Requests', subtitle: 'Contractor fund release requests awaiting approval' },
  '/dc/inspection-reports': { title: 'Inspection Reports', subtitle: 'Completed field inspection report cards' },
  // Municipal Officer
  '/mo/project-updates': { title: 'Project Updates', subtitle: 'Submit progress notes and completion status' },
  '/mo/upload-completion': { title: 'Upload Completion Report', subtitle: 'Certify milestone completion with documentation' },
  '/mo/upload-images': { title: 'Upload Geotagged Images', subtitle: 'Submit GPS-stamped inspection photographs' },
  '/mo/respond-ai': { title: 'Respond to AI Findings', subtitle: 'Submit explanations for anomaly flags on your projects' },
};

export default function Topbar({ searchQuery = '', setSearchQuery = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useProjects();

  const page = pageTitles[location.pathname] || { title: 'GovWatch', subtitle: '' };
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.initials || 'GW';
  const displayName = user?.name || 'GovWatch User';
  const displayRole = user?.role || 'Infrastructure Portal';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div>
          <h1 className={styles.pageTitle}>{page.title}</h1>
          <p className={styles.pageSubtitle}>{page.subtitle}</p>
        </div>
      </div>
      <div className={styles.right}>
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, contractors..."
          />
          <kbd className={styles.kbd}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications" onClick={() => navigate('/notifications')}>
          <Bell size={16} />
          {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
        </button>

        {/* Theme toggle */}
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Date pill */}
        <div className={styles.datePill}>{dateStr}</div>

        {/* Avatar dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            className={styles.avatar}
            onClick={() => setDropOpen((v) => !v)}
            aria-label="User menu"
          >
            <span className={styles.avatarInitials}>{initials}</span>
            <div className={styles.avatarInfo}>
              <span className={styles.avatarName}>{displayName}</span>
              <span className={styles.avatarRole}>{displayRole}</span>
            </div>
            <ChevronDown
              size={12}
              className={styles.avatarChevron}
              style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
            />
          </button>

          {dropOpen && (
            <div className={styles.dropdown} style={{ minWidth: '240px' }}>
              <div className={styles.dropHeader}>
                <div className={styles.dropName}>{displayName}</div>
                <div className={styles.dropRole}>{displayRole}</div>
                {user?.employeeId && (
                  <div className={styles.dropId}>ID: {user.employeeId}</div>
                )}
              </div>
              <div className={styles.dropDivider} />
              
              <div style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Switch Session Role
                </span>
                <select 
                  value={user?.role} 
                  onChange={(e) => {
                    switchRole(e.target.value);
                    setDropOpen(false);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '6px',
                    fontSize: '0.74rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Joint Secretary, Ministry of Rural Development">Joint Secretary</option>
                  <option value="CAG Auditor">CAG Auditor</option>
                  <option value="State Audit Officer">State Audit Officer</option>
                  <option value="District Collector">District Collector</option>
                  <option value="Municipal Officer">Municipal Officer</option>
                </select>
              </div>
              
              <div className={styles.dropDivider} />
              <button className={styles.dropItem} onClick={handleLogout}>
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
