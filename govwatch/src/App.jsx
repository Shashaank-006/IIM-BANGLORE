import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Footer from './components/layout/Footer';

// Existing shared pages
import Dashboard from './components/pages/Dashboard';
import Projects from './components/pages/Projects';
import Budget from './components/pages/Budget';
import MapView from './components/pages/MapView';
import Contractors from './components/pages/Contractors';
import Analytics from './components/pages/Analytics';
import Audit from './components/pages/Audit';

// Auth pages
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Role dashboards (smart dispatch based on user.role)
import RoleDashboard from './components/pages/RoleDashboards';

// Joint Secretary pages
import {
  StateComparison, UserManagement, AIConfiguration, AuditAssignments
} from './components/pages/role-pages/JointSecretaryPages';

// CAG Auditor pages
import {
  AuditQueue, AIVerificationResults, EvidenceViewer, DownloadReports
} from './components/pages/role-pages/CAGAuditorPages';

// State Audit Officer pages
import {
  DistrictPerformance, PendingInvestigations
} from './components/pages/role-pages/StateOfficerPages';

// District Collector pages
import {
  DCProjects, FieldInspectionAssignments, VerificationRequests, InspectionReports
} from './components/pages/role-pages/DistrictCollectorPages';

// Municipal Officer pages
import {
  ProjectUpdates, UploadCompletionReport, UploadGeotaggedImages, RespondToAIFindings
} from './components/pages/role-pages/MunicipalOfficerPages';

// General shared pages
import { Notifications, SettingsPage, HelpDocs } from './components/pages/GeneralPages';

import './App.css';

// ─── Protected app shell ─────────────────────────────────────────────────────
function AppShell({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="page-wrapper">
          {typeof children === 'function' ? children(searchQuery) : children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ─── Route guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"   element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/signup"  element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="/forgot-password" element={<AuthRoute><Login /></AuthRoute>} />

      {/* Protected app routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell>
            {(searchQuery) => (
              <Routes>
                {/* Dashboard — role-aware */}
                <Route path="/" element={<RoleDashboard />} />

                {/* Shared pages */}
                <Route path="/projects"    element={<Projects searchQuery={searchQuery} />} />
                <Route path="/budget"      element={<Budget searchQuery={searchQuery} />} />
                <Route path="/map"         element={<MapView searchQuery={searchQuery} />} />
                <Route path="/contractors" element={<Contractors searchQuery={searchQuery} />} />
                <Route path="/analytics"   element={<Analytics searchQuery={searchQuery} />} />
                <Route path="/audit"       element={<Audit searchQuery={searchQuery} />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings"    element={<SettingsPage />} />
                <Route path="/profile"     element={<SettingsPage />} />
                <Route path="/help"        element={<HelpDocs />} />

                {/* Joint Secretary */}
                <Route path="/js/state-comparison"  element={<StateComparison />} />
                <Route path="/js/user-management"   element={<UserManagement />} />
                <Route path="/js/ai-configuration"  element={<AIConfiguration />} />
                <Route path="/js/audit-assignments" element={<AuditAssignments />} />

                {/* CAG Auditor */}
                <Route path="/cag/audit-queue"      element={<AuditQueue />} />
                <Route path="/cag/ai-verification"  element={<AIVerificationResults />} />
                <Route path="/cag/evidence-viewer"  element={<EvidenceViewer />} />
                <Route path="/cag/download-reports" element={<DownloadReports />} />

                {/* State Audit Officer */}
                <Route path="/sao/district-performance"    element={<DistrictPerformance />} />
                <Route path="/sao/pending-investigations"  element={<PendingInvestigations />} />

                {/* District Collector */}
                <Route path="/dc/projects"             element={<DCProjects />} />
                <Route path="/dc/field-inspections"    element={<FieldInspectionAssignments />} />
                <Route path="/dc/verification-requests" element={<VerificationRequests />} />
                <Route path="/dc/inspection-reports"   element={<InspectionReports />} />

                {/* Municipal Officer */}
                <Route path="/mo/project-updates"    element={<ProjectUpdates />} />
                <Route path="/mo/upload-completion"  element={<UploadCompletionReport />} />
                <Route path="/mo/upload-images"      element={<UploadGeotaggedImages />} />
                <Route path="/mo/respond-ai"         element={<RespondToAIFindings />} />

                {/* Catch-all → dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </AppShell>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
