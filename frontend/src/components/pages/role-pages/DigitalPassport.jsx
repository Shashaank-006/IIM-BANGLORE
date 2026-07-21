import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Shield, FileText, Printer, ArrowLeft, Building2, Calendar,
  MapPin, User, Wallet, CheckCircle2, Radio, Satellite,
  Brain, Camera, UserCheck, Globe, AlertCircle, Home,
} from 'lucide-react';
import { useProjects } from '../../../context/ProjectContext';
import '../../../styles/ProjectRegistration.css';

// Fix Leaflet default marker icon (Webpack/Vite strips the default URLs)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Helpers ──────────────────────────────────────────
function formatBudget(value) {
  if (!value && value !== 0) return '—';
  const num = Number(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ── Component ────────────────────────────────────────
export default function DigitalPassport() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  // ── Not Found ──────────────────────────────────────
  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}
      >
        <div
          className="card"
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <AlertCircle size={36} style={{ color: 'var(--accent-red)' }} />
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontSize: '1.1rem',
            }}
          >
            Project Not Found
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The project with ID <strong>{projectId}</strong> could not be found.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: 8 }}>
            <Home size={15} />
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Derived values ─────────────────────────────────
  const coords = project.coordinates || [20.5937, 78.9629];
  const hasBoundary = Array.isArray(project.boundary) && project.boundary.length >= 3;
  const generatedTimestamp = formatDate(project.registrationTimestamp || project.lastUpdated);

  const statusItems = [
    { label: 'Baseline Satellite', value: project.baselineSatelliteStatus || 'Captured', color: 'var(--accent-green)' },
    { label: 'AI Monitoring', value: project.aiMonitoringStatus || 'Active', color: 'var(--accent-green)' },
    { label: 'Change Detection', value: project.changeDetection || 'Enabled', color: 'var(--accent-blue)' },
    { label: 'Geotag Verification', value: project.geotagVerification || 'Enabled', color: 'var(--accent-blue)' },
    { label: 'Citizen Monitoring', value: project.citizenMonitoring || 'Enabled', color: 'var(--accent-purple)' },
    { label: 'Current Status', value: project.status || 'Registered', color: 'var(--accent-amber)' },
  ];

  // ── Render ─────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="reg-passport">
        {/* ═══ HEADER ═══ */}
        <div className="reg-passport-header">
          <div className="reg-passport-emblem">
            <Shield size={24} style={{ color: '#fff' }} />
          </div>

          <div className="reg-passport-header-text">
            <h2>Digital Project Passport</h2>
            <p>Government of India — Infrastructure Monitoring System</p>
          </div>

          <div className="reg-passport-id-badge">{project.id}</div>
        </div>

        {/* ═══ BODY ═══ */}
        <div className="reg-passport-body">
          {/* ── Project Details ── */}
          <div className="reg-passport-section">
            <div className="reg-passport-section-title">PROJECT DETAILS</div>
            <div className="reg-passport-grid">
              <Field label="Project Name" value={project.name} />
              <Field label="Project Type" value={project.projectType} />
              <Field label="Department" value={project.department} />
              <Field label="Scheme" value={project.scheme} />
              <Field label="Registration Date" value={formatDate(project.registrationTimestamp || project.startDate)} />
              <Field label="Priority" value={project.priority} />
            </div>
            {project.description && (
              <div style={{ marginTop: 4 }}>
                <Field label="Description" value={project.description} />
              </div>
            )}
          </div>

          {/* ── Location ── */}
          <div className="reg-passport-section">
            <div className="reg-passport-section-title">LOCATION</div>
            <div className="reg-passport-grid">
              <Field label="State" value={project.state} />
              <Field label="District" value={project.district} />
              <Field label="Taluk / Village" value={project.village || project.taluk} />
              <Field label="Pincode" value={project.pincode} />
              <Field
                label="GPS Coordinates"
                value={`${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`}
              />
            </div>

            {/* Mini Map */}
            <div className="reg-passport-map-preview" style={{ marginTop: 4 }}>
              <MapContainer
                center={coords}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={coords} />
                {hasBoundary && (
                  <Polygon
                    positions={project.boundary}
                    pathOptions={{
                      color: 'var(--accent-blue)',
                      fillColor: 'rgba(59,130,246,0.15)',
                      weight: 2,
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* ── Contractor ── */}
          <div className="reg-passport-section">
            <div className="reg-passport-section-title">CONTRACTOR</div>
            <div className="reg-passport-grid">
              <Field label="Contractor Name" value={project.contractor} />
              <Field label="Contractor ID" value={project.contractorId} />
              <Field label="Company" value={project.contractorCompany} />
              <Field label="Tender Number" value={project.tenderNumber} />
              <Field label="Work Order Number" value={project.workOrderNumber} />
            </div>
          </div>

          {/* ── Financial ── */}
          <div className="reg-passport-section">
            <div className="reg-passport-section-title">FINANCIAL</div>
            <div className="reg-passport-grid">
              <Field label="Estimated Budget" value={formatBudget(project.budget)} />
              <Field label="Funding Source" value={project.fundingSource} />
              <Field
                label="Timeline"
                value={`${formatDate(project.startDate)} — ${formatDate(project.expectedEnd)}`}
              />
            </div>
          </div>

          {/* ── AI Monitoring Status ── */}
          <div className="reg-passport-section">
            <div className="reg-passport-section-title">AI MONITORING STATUS</div>
            <div className="reg-passport-status-grid">
              {statusItems.map((item) => (
                <div key={item.label} className="reg-passport-status-item">
                  <span
                    className="reg-passport-status-dot"
                    style={{ background: item.color }}
                  />
                  <span className="reg-passport-status-text">{item.label}</span>
                  <span className="reg-passport-status-value" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Trust Score ── */}
          <div className="reg-passport-trust-score">
            <div
              className="reg-passport-trust-gauge"
              style={{ '--score': project.trustScore ?? 0 }}
            >
              <div className="reg-passport-trust-gauge-inner">
                {project.trustScore ?? '—'}
              </div>
            </div>
            <div className="reg-passport-trust-info">
              <h4>Initial Trust Score</h4>
              <p>
                This score is algorithmically generated based on project registration
                completeness, contractor history, documentation quality, and geospatial
                verification. It will evolve as AI monitoring detects progress and anomalies.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="reg-passport-footer">
          <span className="reg-passport-footer-text">
            Generated by GovWatch AI · {generatedTimestamp}
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Print
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Sub-component: Field ─────────────────────────────
function Field({ label, value }) {
  return (
    <div className="reg-passport-field">
      <span className="reg-passport-field-label">{label}</span>
      <span className="reg-passport-field-value">{value || '—'}</span>
    </div>
  );
}
