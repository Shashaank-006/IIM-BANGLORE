import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Wallet, Map,
  HardHat, BarChart3, ClipboardList, ChevronRight,
  Shield, Users, Cpu, UserPlus, ClipboardCheck,
  Bot, Eye, Download, TrendingUp, AlertTriangle,
  Route, CheckSquare, FileText, RefreshCw, Upload,
  Camera, MessageSquare, HelpCircle, Bell, Settings,
  UserCircle, FilePlus2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const getNavItems = (role) => {
  const common = [
    { path: '/profile', icon: UserCircle, label: 'Profile', hidden: true },
    { path: '/settings', icon: Settings, label: 'Settings', hidden: true },
    { path: '/notifications', icon: Bell, label: 'Notifications', hidden: true },
  ];

  if (role === 'Joint Secretary, Ministry of Rural Development') {
    return [
      { path: '/', icon: LayoutDashboard, label: 'National Dashboard' },
      { path: '/js/state-comparison', icon: TrendingUp, label: 'State Comparison' },
      { path: '/js/user-management', icon: Users, label: 'User Management' },
      { path: '/js/ai-configuration', icon: Cpu, label: 'AI Configuration' },
      { path: '/analytics', icon: BarChart3, label: 'National Analytics' },
      { path: '/js/audit-assignments', icon: UserPlus, label: 'Audit Assignments' },
      { path: '/projects', icon: FolderKanban, label: 'Projects' },
      { path: '/map', icon: Map, label: 'Map View' },
      { path: '/contractors', icon: HardHat, label: 'Contractors' },
      { path: '/audit', icon: ClipboardList, label: 'Audit Logs' },
      { path: '/help', icon: HelpCircle, label: 'Help & Docs' },
      ...common
    ];
  }

  if (role === 'CAG Auditor') {
    return [
      { path: '/', icon: LayoutDashboard, label: 'Auditor Dashboard' },
      { path: '/cag/audit-queue', icon: ClipboardCheck, label: 'Audit Queue' },
      { path: '/cag/ai-verification', icon: Bot, label: 'AI Verification' },
      { path: '/cag/evidence-viewer', icon: Eye, label: 'Evidence Viewer' },
      { path: '/contractors', icon: HardHat, label: 'Contractor History' },
      { path: '/cag/download-reports', icon: Download, label: 'Download Reports' },
      { path: '/projects', icon: FolderKanban, label: 'Projects' },
      { path: '/map', icon: Map, label: 'Map View' },
      { path: '/audit', icon: ClipboardList, label: 'Audit Logs' },
      { path: '/help', icon: HelpCircle, label: 'Help & Docs' },
      ...common
    ];
  }

  if (role === 'State Audit Officer') {
    return [
      { path: '/', icon: LayoutDashboard, label: 'State Dashboard' },
      { path: '/sao/district-performance', icon: TrendingUp, label: 'District Performance' },
      { path: '/sao/pending-investigations', icon: AlertTriangle, label: 'Investigations' },
      { path: '/analytics', icon: BarChart3, label: 'State Analytics' },
      { path: '/projects', icon: FolderKanban, label: 'Projects' },
      { path: '/map', icon: Map, label: 'Map View' },
      { path: '/contractors', icon: HardHat, label: 'Contractors' },
      { path: '/audit', icon: ClipboardList, label: 'Audit Logs' },
      { path: '/help', icon: HelpCircle, label: 'Help & Docs' },
      ...common
    ];
  }

  if (role === 'District Collector') {
    return [
      { path: '/', icon: LayoutDashboard, label: 'District Dashboard' },
      { path: '/dc/projects', icon: FolderKanban, label: 'District Projects' },
      { path: '/dc/field-inspections', icon: Route, label: 'Field Inspections' },
      { path: '/dc/verification-requests', icon: CheckSquare, label: 'Verification Req.' },
      { path: '/dc/inspection-reports', icon: FileText, label: 'Inspection Reports' },
      { path: '/map', icon: Map, label: 'Map View' },
      { path: '/help', icon: HelpCircle, label: 'Help & Docs' },
      ...common
    ];
  }

  if (role === 'Municipal Officer') {
    return [
      { path: '/', icon: LayoutDashboard, label: 'Municipal Dashboard' },
      { path: '/mo/register-project', icon: FilePlus2, label: 'Register Project' },
      { path: '/mo/project-updates', icon: RefreshCw, label: 'Project Updates' },
      { path: '/mo/upload-completion', icon: Upload, label: 'Upload Reports' },
      { path: '/mo/upload-images', icon: Camera, label: 'Upload Geotags' },
      { path: '/mo/respond-ai', icon: MessageSquare, label: 'Respond to AI' },
      { path: '/map', icon: Map, label: 'Map View' },
      { path: '/help', icon: HelpCircle, label: 'Help & Docs' },
      ...common
    ];
  }

  return [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/help', icon: HelpCircle, label: 'Help & Docs' },
    ...common
  ];
};

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = getNavItems(user?.role);

  // Filter out items marked as hidden (e.g. settings, notifications, profile) from main navbar display
  const visibleNavItems = navItems.filter(item => !item.hidden);

  return (
    <motion.aside
      className={styles.sidebar}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Shield size={16} strokeWidth={2.5} />
        </div>
        <div>
          <div className={styles.brandName}>Bhoot Nirman</div>
          <div className={styles.brandTag}>Infrastructure MIS</div>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Navigation</span>
        <nav className={styles.nav}>
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
              >
                <NavLink to={item.path} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={12} className={styles.chevron} />}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className={styles.footer}>
        <div className={styles.divider} />
          {/* <div className={styles.systemStatus}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>All systems operational</span>
          </div>
          <div className={styles.version}>v2.4.1 · MIS Portal</div> */}
      </div>
    </motion.aside>
  );
}
