import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  FileText, MapPin, Users, Upload, Settings2, Cpu, ClipboardCheck,
  ChevronRight, ChevronLeft, ArrowRight, Check, Plus, Trash2,
  Search, Crosshair, Pencil, RotateCcw, File, Eye, RefreshCw,
  Satellite, Shield, Brain, Radio, UserCheck, BarChart3,
  Fingerprint, Globe, Camera, AlertCircle, X, Save, Send
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useProjects } from '../../../context/ProjectContext';
import '../../../styles/ProjectRegistration.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Step definitions ────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Contractor', icon: Users },
  { id: 4, label: 'Documents', icon: Upload },
  { id: 5, label: 'Metadata', icon: Settings2 },
  { id: 6, label: 'AI Init', icon: Cpu },
  { id: 7, label: 'Review', icon: ClipboardCheck },
];

// ─── Mock data constants ─────────────────────────────────────────
const PROJECT_TYPES = ['Road Construction', 'Bridge', 'Water Supply', 'Housing', 'Sanitation', 'Smart City Infrastructure', 'Watershed Development', 'Street Lighting', 'Drainage System'];
const DEPARTMENTS = ['Public Works Department', 'Rural Development', 'Water Resources', 'Urban Development', 'Panchayati Raj', 'Housing Department'];
const FUNDING_SOURCES = ['Central Government', 'State Government', 'Central + State (Shared)', 'World Bank Aided', 'ADB Funded', 'CSR Fund'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATES = ['Andhra Pradesh', 'Chhattisgarh', 'Goa', 'Gujarat', 'Himachal Pradesh', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
const CONSTRUCTION_TYPES = ['New Construction', 'Widening', 'Rehabilitation', 'Reconstruction', 'Extension', 'Repair & Maintenance'];
const TERRAIN_TYPES = ['Plain', 'Hilly', 'Coastal', 'Desert', 'Forest', 'Marshy', 'Urban', 'Semi-Urban', 'Rural'];

const DOCUMENT_TYPES = [
  { key: 'adminSanction', label: 'Administrative Sanction', required: true },
  { key: 'techSanction', label: 'Technical Sanction', required: true },
  { key: 'tenderDoc', label: 'Tender Document', required: true },
  { key: 'workOrder', label: 'Work Order', required: true },
  { key: 'dpr', label: 'Detailed Project Report (DPR)', required: true },
  { key: 'budgetApproval', label: 'Budget Approval', required: true },
  { key: 'siteLayout', label: 'Site Layout', required: true },
  { key: 'blueprint', label: 'Blueprint', required: true },
  { key: 'engDrawings', label: 'Engineering Drawings', required: true },
  { key: 'envClearance', label: 'Environmental Clearance', required: false },
  { key: 'safetyClearance', label: 'Safety Approval', required: false },
  { key: 'otherDocs', label: 'Other Documents', required: false },
];

const AI_INIT_ITEMS = [
  { id: 'genId', icon: Fingerprint, title: 'Generate Project ID', desc: 'Unique digital identifier created for cross-platform tracking', color: 'var(--accent-blue)' },
  { id: 'passport', icon: FileText, title: 'Create Digital Project Passport', desc: 'Immutable project record with verifiable credentials', color: 'var(--accent-purple)' },
  { id: 'satellite', icon: Satellite, title: 'Capture Baseline Satellite Imagery', desc: 'Pre-construction satellite snapshot for change detection', color: 'var(--accent-cyan)' },
  { id: 'terrain', icon: Globe, title: 'Store Initial Terrain Snapshot', desc: 'DEM and elevation data captured for volumetric analysis', color: 'var(--accent-amber)' },
  { id: 'aiMonitor', icon: Brain, title: 'Initialize AI Monitoring', desc: 'Computer vision pipeline configured for progress tracking', color: 'var(--accent-blue)' },
  { id: 'changeDetect', icon: Radio, title: 'Enable Change Detection', desc: 'Bi-weekly satellite comparison scheduled automatically', color: 'var(--accent-green)' },
  { id: 'geotag', icon: Camera, title: 'Enable Geotag Verification', desc: 'GPS-based image verification module activated', color: 'var(--accent-purple)' },
  { id: 'citizen', icon: UserCheck, title: 'Enable Citizen Monitoring', desc: 'Public grievance portal linked to project dashboard', color: 'var(--accent-cyan)' },
  { id: 'trust', icon: Shield, title: 'Create Initial Trust Score', desc: 'Baseline trust score computed from project parameters', color: 'var(--accent-green)' },
];

function generateProjectId() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `PRJ-${year}-${num}`;
}

// ─── Animation variants ──────────────────────────────────────────
const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — Basic Info
// ═══════════════════════════════════════════════════════════════════
function StepBasicInfo({ formData, updateField }) {
  const { schemes = [] } = useProjects();
  return (
    <div className="reg-form-card">
      <div className="reg-form-header">
        <div className="reg-form-header-icon" style={{ background: 'var(--accent-blue-dim)' }}>
          <FileText size={20} color="var(--accent-blue)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Project Information</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enter the basic details of the infrastructure project</p>
        </div>
      </div>

      <div className="reg-form-grid">
        {/* Project Name */}
        <div className="reg-form-group full-width">
          <label className="reg-form-label">Project Name <span className="required">*</span></label>
          <input
            className="reg-form-input"
            type="text"
            placeholder="e.g. Sindhudurg Coastal Road Widening"
            value={formData.projectName}
            onChange={(e) => updateField('projectName', e.target.value)}
          />
        </div>

        {/* Project ID */}
        <div className="reg-form-group">
          <label className="reg-form-label">Project ID</label>
          <input
            className="reg-form-input mono readonly"
            type="text"
            value={formData.projectId}
            readOnly
          />
        </div>

        {/* Project Type */}
        <div className="reg-form-group">
          <label className="reg-form-label">Project Type <span className="required">*</span></label>
          <select
            className="reg-form-select"
            value={formData.projectType}
            onChange={(e) => updateField('projectType', e.target.value)}
          >
            <option value="">Select type</option>
            {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Department */}
        <div className="reg-form-group">
          <label className="reg-form-label">Department <span className="required">*</span></label>
          <select
            className="reg-form-select"
            value={formData.department}
            onChange={(e) => updateField('department', e.target.value)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Scheme */}
        <div className="reg-form-group">
          <label className="reg-form-label">Scheme Name <span className="required">*</span></label>
          <select
            className="reg-form-select"
            value={formData.schemeName}
            onChange={(e) => updateField('schemeName', e.target.value)}
          >
            <option value="">Select scheme</option>
            {schemes && schemes.length > 0 ? (
              schemes.map((s) => <option key={s.id} value={s.name}>{s.name} — {s.fullName}</option>)
            ) : (
              <>
                <option value="PMGSY">PMGSY — Pradhan Mantri Gram Sadak Yojana</option>
                <option value="Jal Jeevan Mission">Jal Jeevan Mission (JJM)</option>
                <option value="PMAY">PMAY — Pradhan Mantri Awas Yojana (Urban)</option>
              </>
            )}
          </select>
        </div>

        {/* Description */}
        <div className="reg-form-group full-width">
          <label className="reg-form-label">Project Description</label>
          <textarea
            className="reg-form-textarea"
            placeholder="Describe the scope, purpose and expected impact of the project..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Budget */}
        <div className="reg-form-group">
          <label className="reg-form-label">Estimated Budget (₹) <span className="required">*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 600 }}>₹</span>
            <input
              className="reg-form-input"
              type="number"
              placeholder="e.g. 4820000"
              style={{ paddingLeft: 28 }}
              value={formData.estimatedBudget}
              onChange={(e) => updateField('estimatedBudget', e.target.value)}
            />
          </div>
        </div>

        {/* Funding Source */}
        <div className="reg-form-group">
          <label className="reg-form-label">Funding Source <span className="required">*</span></label>
          <select
            className="reg-form-select"
            value={formData.fundingSource}
            onChange={(e) => updateField('fundingSource', e.target.value)}
          >
            <option value="">Select source</option>
            {FUNDING_SOURCES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Priority */}
        <div className="reg-form-group">
          <label className="reg-form-label">Priority <span className="required">*</span></label>
          <select
            className="reg-form-select"
            value={formData.priority}
            onChange={(e) => updateField('priority', e.target.value)}
          >
            <option value="">Select priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Start Date */}
        <div className="reg-form-group">
          <label className="reg-form-label">Expected Start Date <span className="required">*</span></label>
          <input
            className="reg-form-input"
            type="date"
            value={formData.expectedStartDate}
            onChange={(e) => updateField('expectedStartDate', e.target.value)}
          />
        </div>

        {/* Completion Date */}
        <div className="reg-form-group">
          <label className="reg-form-label">Expected Completion Date <span className="required">*</span></label>
          <input
            className="reg-form-input"
            type="date"
            value={formData.expectedCompletionDate}
            onChange={(e) => updateField('expectedCompletionDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2 — Location
// ═══════════════════════════════════════════════════════════════════
function MapClickHandler({ mapMode, formData, updateField, setFormData }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (mapMode === 'marker') {
        updateField('latitude', lat.toFixed(6));
        updateField('longitude', lng.toFixed(6));
      } else if (mapMode === 'boundary') {
        setFormData((prev) => ({
          ...prev,
          boundary: [...prev.boundary, [lat, lng]],
        }));
      }
    },
  });
  return null;
}

function calculatePolygonArea(points) {
  if (points.length < 3) return 0;
  // Shoelace formula in degrees, then approximate conversion to sq km
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  area = Math.abs(area) / 2;
  // 1 degree lat ≈ 111 km, 1 degree lng ≈ 111 km (rough approximation at Indian latitudes)
  const areaKm2 = area * 111 * 111;
  return areaKm2;
}

function StepLocation({ formData, updateField, setFormData }) {
  const [mapMode, setMapMode] = useState('marker');

  const markerPosition = formData.latitude && formData.longitude
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    : null;

  const handleClearMap = () => {
    updateField('latitude', '');
    updateField('longitude', '');
    setFormData((prev) => ({ ...prev, boundary: [] }));
  };

  const polyArea = useMemo(() => calculatePolygonArea(formData.boundary), [formData.boundary]);

  return (
    <div className="reg-form-card">
      <div className="reg-form-header">
        <div className="reg-form-header-icon" style={{ background: 'var(--accent-green-dim)' }}>
          <MapPin size={20} color="var(--accent-green)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Project Location</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specify the geographic details and mark on the map</p>
        </div>
      </div>

      <div className="reg-form-grid">
        <div className="reg-form-group">
          <label className="reg-form-label">State <span className="required">*</span></label>
          <select className="reg-form-select" value={formData.state} onChange={(e) => updateField('state', e.target.value)}>
            <option value="">Select state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">District <span className="required">*</span></label>
          <input className="reg-form-input" type="text" placeholder="e.g. Sindhudurg" value={formData.district} onChange={(e) => updateField('district', e.target.value)} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Taluk</label>
          <input className="reg-form-input" type="text" placeholder="e.g. Malvan" value={formData.taluk} onChange={(e) => updateField('taluk', e.target.value)} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Village / Locality</label>
          <input className="reg-form-input" type="text" placeholder="e.g. Devgad" value={formData.village} onChange={(e) => updateField('village', e.target.value)} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Pincode</label>
          <input className="reg-form-input" type="text" placeholder="e.g. 416606" value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} maxLength={6} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Latitude</label>
          <input className="reg-form-input mono readonly" type="text" value={formData.latitude} readOnly placeholder="Click on map" />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Longitude</label>
          <input className="reg-form-input mono readonly" type="text" value={formData.longitude} readOnly placeholder="Click on map" />
        </div>
      </div>

      {/* Map toolbar */}
      <div className="reg-map-toolbar">
        <button
          className={`reg-map-btn ${mapMode === 'marker' ? 'active' : ''}`}
          onClick={() => setMapMode('marker')}
        >
          <Crosshair size={14} /> Drop Marker
        </button>
        <button
          className={`reg-map-btn ${mapMode === 'boundary' ? 'active' : ''}`}
          onClick={() => setMapMode('boundary')}
        >
          <Pencil size={14} /> Draw Boundary
        </button>
        <button className="reg-map-btn" onClick={handleClearMap}>
          <RotateCcw size={14} /> Clear
        </button>
      </div>

      {/* Map */}
      <div className="reg-map-container">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler
            mapMode={mapMode}
            formData={formData}
            updateField={updateField}
            setFormData={setFormData}
          />
          {markerPosition && (
            <Marker position={markerPosition}>
              <Popup>
                Project Location<br />
                {formData.latitude}, {formData.longitude}
              </Popup>
            </Marker>
          )}
          {formData.boundary.length > 2 && (
            <Polygon
              positions={formData.boundary}
              pathOptions={{ color: 'var(--accent-blue)', fillColor: 'var(--accent-blue)', fillOpacity: 0.15 }}
            />
          )}
          {formData.boundary.length >= 2 && formData.boundary.length <= 2 && (
            <Polyline
              positions={formData.boundary}
              pathOptions={{ color: 'var(--accent-blue)' }}
            />
          )}
        </MapContainer>
      </div>

      {/* Map info */}
      <div className="reg-map-info">
        <div className="reg-map-info-item">
          <MapPin size={14} />
          <span>Coordinates: </span>
          <strong>{formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not set'}</strong>
        </div>
        {formData.boundary.length > 0 && (
          <div className="reg-map-info-item">
            <Pencil size={14} />
            <span>Boundary points: </span>
            <strong>{formData.boundary.length}</strong>
          </div>
        )}
        {formData.boundary.length > 2 && (
          <div className="reg-map-info-item">
            <BarChart3 size={14} />
            <span>Area: </span>
            <strong>{polyArea.toFixed(4)} sq km</strong>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3 — Contractor
// ═══════════════════════════════════════════════════════════════════
function StepContractor({ formData, updateField }) {
  const { allContractors } = useProjects();

  const handleContractorSelect = (e) => {
    const id = e.target.value;
    const contractor = allContractors.find((c) => c.id === id);
    if (contractor) {
      updateField('contractorId', contractor.id);
      updateField('contractorName', contractor.name);
      updateField('contractorCompany', contractor.name);
    } else {
      updateField('contractorId', '');
      updateField('contractorName', '');
      updateField('contractorCompany', '');
    }
  };

  return (
    <div className="reg-form-card">
      <div className="reg-form-header">
        <div className="reg-form-header-icon" style={{ background: 'var(--accent-purple-dim)' }}>
          <Users size={20} color="var(--accent-purple)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Contractor Details</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assign the registered contractor for this project</p>
        </div>
      </div>

      <div className="reg-form-grid">
        <div className="reg-form-group full-width">
          <label className="reg-form-label">Select Contractor <span className="required">*</span></label>
          {allContractors && allContractors.length > 0 ? (
            <select className="reg-form-select" value={formData.contractorId} onChange={handleContractorSelect}>
              <option value="">Choose a registered contractor</option>
              {allContractors.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          ) : (
            <input 
              className="reg-form-input" 
              type="text" 
              placeholder="e.g. Coastal Infra Ventures LLP"
              value={formData.contractorName}
              onChange={(e) => {
                const name = e.target.value;
                updateField('contractorName', name);
                updateField('contractorCompany', name);
                if (!formData.contractorId) {
                  updateField('contractorId', 'CNT-' + Math.floor(1000 + Math.random() * 9000));
                }
              }}
              required
            />
          )}
        </div>

        <div className="reg-form-group">
          <label className="reg-form-label">Contractor ID</label>
          <input className="reg-form-input mono readonly" type="text" value={formData.contractorId} readOnly />
        </div>

        <div className="reg-form-group">
          <label className="reg-form-label">Company Name</label>
          <input className="reg-form-input readonly" type="text" value={formData.contractorCompany} readOnly />
        </div>

        <div className="reg-form-group">
          <label className="reg-form-label">Contact Phone</label>
          <input
            className="reg-form-input"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={formData.contractorContact}
            onChange={(e) => updateField('contractorContact', e.target.value)}
          />
        </div>

        <div className="reg-form-group">
          <label className="reg-form-label">Email Address</label>
          <input
            className="reg-form-input"
            type="email"
            placeholder="contractor@example.com"
            value={formData.contractorEmail}
            onChange={(e) => updateField('contractorEmail', e.target.value)}
          />
        </div>

        <div className="reg-form-group">
          <label className="reg-form-label">Tender Number</label>
          <input
            className="reg-form-input mono"
            type="text"
            placeholder="e.g. TND-2026-0412"
            value={formData.tenderNumber}
            onChange={(e) => updateField('tenderNumber', e.target.value)}
          />
        </div>

        <div className="reg-form-group">
          <label className="reg-form-label">Work Order Number</label>
          <input
            className="reg-form-input mono"
            type="text"
            placeholder="e.g. WO-2026-0089"
            value={formData.workOrderNumber}
            onChange={(e) => updateField('workOrderNumber', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 4 — Documents
// ═══════════════════════════════════════════════════════════════════
function StepDocuments({ formData, setFormData }) {
  const [uploadingKey, setUploadingKey] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (docKey, file) => {
    if (!file) return;
    setUploadingKey(docKey);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingKey(null);
          setFormData((p) => ({
            ...p,
            documents: {
              ...p.documents,
              [docKey]: { name: file.name, size: file.size, uploaded: true },
            },
          }));
          return 0;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDelete = (docKey) => {
    setFormData((p) => ({
      ...p,
      documents: { ...p.documents, [docKey]: null },
    }));
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="reg-form-card">
      <div className="reg-form-header">
        <div className="reg-form-header-icon" style={{ background: 'var(--accent-amber-dim)' }}>
          <Upload size={20} color="var(--accent-amber)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Document Upload</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload all required project documents</p>
        </div>
      </div>

      <div className="reg-doc-grid">
        {DOCUMENT_TYPES.map((doc) => {
          const fileData = formData.documents[doc.key];
          const isUploading = uploadingKey === doc.key;

          return (
            <div key={doc.key} className={`reg-doc-card ${fileData?.uploaded ? 'uploaded' : ''}`}>
              <div className="reg-doc-header">
                <span className="reg-doc-title">{doc.label}</span>
                {!doc.required && <span className="reg-doc-optional">Optional</span>}
              </div>

              {isUploading ? (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Uploading... {uploadProgress}%
                  </div>
                  <div className="reg-doc-progress">
                    <div className="reg-doc-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : fileData?.uploaded ? (
                <div className="reg-doc-file-info">
                  <div className="reg-doc-file-icon">
                    <File size={16} color="var(--accent-blue)" />
                  </div>
                  <div className="reg-doc-file-details">
                    <div className="reg-doc-file-name">{fileData.name}</div>
                    <div className="reg-doc-file-size">{formatSize(fileData.size)}</div>
                  </div>
                  <div className="reg-doc-actions">
                    <button className="reg-doc-action-btn" title="Preview">
                      <Eye size={12} />
                    </button>
                    <label className="reg-doc-action-btn" title="Replace" style={{ cursor: 'pointer' }}>
                      <RefreshCw size={12} />
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileSelect(doc.key, e.target.files[0])}
                      />
                    </label>
                    <button className="reg-doc-action-btn delete" title="Delete" onClick={() => handleDelete(doc.key)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="reg-doc-dropzone" style={{ cursor: 'pointer' }}>
                  <Upload size={20} color="var(--text-muted)" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to upload</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>PDF, JPG, PNG up to 10MB</div>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(doc.key, e.target.files[0])}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 5 — Metadata
// ═══════════════════════════════════════════════════════════════════
function StepMetadata({ formData, updateField, setFormData }) {
  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { name: '', date: '' }],
    }));
  };

  const updateMilestone = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.milestones];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, milestones: updated };
    });
  };

  const removeMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="reg-form-card">
      <div className="reg-form-header">
        <div className="reg-form-header-icon" style={{ background: 'var(--accent-cyan-dim)' }}>
          <Settings2 size={20} color="var(--accent-cyan)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Technical Metadata</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Provide technical specifications and milestones</p>
        </div>
      </div>

      <div className="reg-form-grid">
        <div className="reg-form-group">
          <label className="reg-form-label">Road Length (km)</label>
          <input className="reg-form-input" type="number" placeholder="e.g. 18.4" value={formData.roadLength} onChange={(e) => updateField('roadLength', e.target.value)} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Road Width (m)</label>
          <input className="reg-form-input" type="number" placeholder="e.g. 7.5" value={formData.roadWidth} onChange={(e) => updateField('roadWidth', e.target.value)} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Number of Structures</label>
          <input className="reg-form-input" type="number" placeholder="e.g. 5" value={formData.numberOfStructures} onChange={(e) => updateField('numberOfStructures', e.target.value)} />
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Construction Type</label>
          <select className="reg-form-select" value={formData.constructionType} onChange={(e) => updateField('constructionType', e.target.value)}>
            <option value="">Select type</option>
            {CONSTRUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="reg-form-group">
          <label className="reg-form-label">Terrain</label>
          <select className="reg-form-select" value={formData.terrain} onChange={(e) => updateField('terrain', e.target.value)}>
            <option value="">Select terrain</option>
            {TERRAIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="reg-form-group full-width">
          <label className="reg-form-label">Estimated Materials</label>
          <textarea
            className="reg-form-textarea"
            placeholder="List key materials and their estimated quantities..."
            value={formData.estimatedMaterials}
            onChange={(e) => updateField('estimatedMaterials', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <label className="reg-form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Project Milestones</label>
          <button className="btn btn-ghost" style={{ fontSize: '0.75rem', gap: 4 }} onClick={addMilestone}>
            <Plus size={14} /> Add Milestone
          </button>
        </div>
        <div className="reg-milestone-list">
          {formData.milestones.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              No milestones added yet. Click "Add Milestone" to define project phases.
            </div>
          )}
          {formData.milestones.map((ms, idx) => (
            <div key={idx} className="reg-milestone-item">
              <input
                type="text"
                placeholder="Milestone name"
                value={ms.name}
                onChange={(e) => updateMilestone(idx, 'name', e.target.value)}
              />
              <input
                type="date"
                value={ms.date}
                onChange={(e) => updateMilestone(idx, 'date', e.target.value)}
                style={{ maxWidth: 180 }}
              />
              <button
                className="btn btn-ghost"
                style={{ padding: '4px 6px', color: 'var(--accent-red)' }}
                onClick={() => removeMilestone(idx)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 6 — AI Initialization
// ═══════════════════════════════════════════════════════════════════
function StepAIInit() {
  const [initialized, setInitialized] = useState([]);

  useEffect(() => {
    const timers = AI_INIT_ITEMS.map((item, idx) =>
      setTimeout(() => {
        setInitialized((prev) => [...prev, item.id]);
      }, 300 * (idx + 1))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="reg-form-card">
      <div className="reg-form-header">
        <div className="reg-form-header-icon" style={{ background: 'var(--accent-blue-dim)' }}>
          <Cpu size={20} color="var(--accent-blue)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>AI & Monitoring Initialization</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GovWatch AI systems are being configured for this project</p>
        </div>
      </div>

      <div className="reg-ai-grid">
        {AI_INIT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isInit = initialized.includes(item.id);
          return (
            <div key={item.id} className={`reg-ai-card ${isInit ? 'initialized' : ''}`}>
              <div className="reg-ai-card-icon" style={{ background: `color-mix(in srgb, ${item.color} 15%, transparent)` }}>
                <Icon size={20} color={item.color} />
              </div>
              <div className="reg-ai-card-content">
                <div className="reg-ai-card-title">{item.title}</div>
                <div className="reg-ai-card-desc">{item.desc}</div>
              </div>
              <div className="reg-ai-card-check">
                <Check size={10} color="#fff" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 7 — Review
// ═══════════════════════════════════════════════════════════════════
function StepReview({ formData, setCurrentStep }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addProject } = useProjects();

  const handleSubmit = () => {
    addProject(formData, user);
    navigate(`/mo/project-success/${formData.projectId}`);
  };

  const uploadedDocs = DOCUMENT_TYPES.filter((d) => formData.documents[d.key]?.uploaded);
  const pendingDocs = DOCUMENT_TYPES.filter((d) => !formData.documents[d.key]?.uploaded);

  const reviewItems = [
    { label: 'Project Name', value: formData.projectName },
    { label: 'Project ID', value: formData.projectId },
    { label: 'Project Type', value: formData.projectType },
    { label: 'Department', value: formData.department },
    { label: 'Scheme', value: formData.schemeName },
    { label: 'Budget', value: formData.estimatedBudget ? `₹${Number(formData.estimatedBudget).toLocaleString('en-IN')}` : '' },
    { label: 'Funding Source', value: formData.fundingSource },
    { label: 'Priority', value: formData.priority },
    { label: 'Start Date', value: formData.expectedStartDate },
    { label: 'Completion Date', value: formData.expectedCompletionDate },
  ];

  const locationItems = [
    { label: 'State', value: formData.state },
    { label: 'District', value: formData.district },
    { label: 'Taluk', value: formData.taluk },
    { label: 'Village', value: formData.village },
    { label: 'Pincode', value: formData.pincode },
    { label: 'Coordinates', value: formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not set' },
  ];

  const contractorItems = [
    { label: 'Contractor', value: formData.contractorName || formData.contractorCompany },
    { label: 'Contractor ID', value: formData.contractorId },
    { label: 'Contact', value: formData.contractorContact },
    { label: 'Email', value: formData.contractorEmail },
    { label: 'Tender Number', value: formData.tenderNumber },
    { label: 'Work Order', value: formData.workOrderNumber },
  ];

  const metadataItems = [
    { label: 'Road Length', value: formData.roadLength ? `${formData.roadLength} km` : '' },
    { label: 'Road Width', value: formData.roadWidth ? `${formData.roadWidth} m` : '' },
    { label: 'Structures', value: formData.numberOfStructures },
    { label: 'Construction Type', value: formData.constructionType },
    { label: 'Terrain', value: formData.terrain },
  ];

  const markerPosition = formData.latitude && formData.longitude
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Project Details */}
      <div className="reg-review-section">
        <div className="reg-review-section-header">
          <div className="reg-review-section-title"><FileText size={16} /> Project Details</div>
          <button className="btn btn-ghost" style={{ fontSize: '0.72rem', gap: 4 }} onClick={() => setCurrentStep(1)}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        <div className="reg-review-grid">
          {reviewItems.map((item, i) => (
            <div key={i} className="reg-review-item">
              <div className="reg-review-item-label">{item.label}</div>
              <div className="reg-review-item-value">{item.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="reg-review-section">
        <div className="reg-review-section-header">
          <div className="reg-review-section-title"><MapPin size={16} /> Location</div>
          <button className="btn btn-ghost" style={{ fontSize: '0.72rem', gap: 4 }} onClick={() => setCurrentStep(2)}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        <div className="reg-review-grid">
          {locationItems.map((item, i) => (
            <div key={i} className="reg-review-item">
              <div className="reg-review-item-label">{item.label}</div>
              <div className="reg-review-item-value">{item.value || '—'}</div>
            </div>
          ))}
        </div>
        {markerPosition && (
          <div style={{ padding: 16 }}>
            <div style={{ height: 200, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <MapContainer
                center={markerPosition}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={markerPosition} />
                {formData.boundary.length > 2 && (
                  <Polygon positions={formData.boundary} pathOptions={{ color: 'var(--accent-blue)', fillOpacity: 0.15 }} />
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </div>

      {/* Contractor */}
      <div className="reg-review-section">
        <div className="reg-review-section-header">
          <div className="reg-review-section-title"><Users size={16} /> Contractor</div>
          <button className="btn btn-ghost" style={{ fontSize: '0.72rem', gap: 4 }} onClick={() => setCurrentStep(3)}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        <div className="reg-review-grid">
          {contractorItems.map((item, i) => (
            <div key={i} className="reg-review-item">
              <div className="reg-review-item-label">{item.label}</div>
              <div className="reg-review-item-value">{item.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="reg-review-section">
        <div className="reg-review-section-header">
          <div className="reg-review-section-title"><Upload size={16} /> Documents</div>
          <button className="btn btn-ghost" style={{ fontSize: '0.72rem', gap: 4 }} onClick={() => setCurrentStep(4)}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        <div style={{ padding: '12px 20px' }}>
          {uploadedDocs.length > 0 && (
            <div style={{ marginBottom: uploadedDocs.length > 0 && pendingDocs.length > 0 ? 12 : 0 }}>
              {uploadedDocs.map((doc) => (
                <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: '0.82rem' }}>
                  <Check size={14} color="var(--accent-green)" />
                  <span style={{ color: 'var(--text-primary)' }}>{doc.label}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{formData.documents[doc.key]?.name}</span>
                </div>
              ))}
            </div>
          )}
          {pendingDocs.length > 0 && (
            <div>
              {pendingDocs.map((doc) => (
                <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: '0.82rem' }}>
                  <X size={14} color={doc.required ? 'var(--accent-red)' : 'var(--text-muted)'} />
                  <span style={{ color: doc.required ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{doc.label}</span>
                  {!doc.required && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 'auto' }}>Optional</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="reg-review-section">
        <div className="reg-review-section-header">
          <div className="reg-review-section-title"><Settings2 size={16} /> Technical Metadata</div>
          <button className="btn btn-ghost" style={{ fontSize: '0.72rem', gap: 4 }} onClick={() => setCurrentStep(5)}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        <div className="reg-review-grid">
          {metadataItems.map((item, i) => (
            <div key={i} className="reg-review-item">
              <div className="reg-review-item-label">{item.label}</div>
              <div className="reg-review-item-value">{item.value || '—'}</div>
            </div>
          ))}
        </div>
        {formData.milestones.length > 0 && (
          <div style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Milestones</div>
            {formData.milestones.map((ms, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: '0.82rem' }}>
                <Check size={14} color="var(--accent-blue)" />
                <span style={{ color: 'var(--text-primary)' }}>{ms.name || 'Unnamed milestone'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{ms.date || 'No date'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Init */}
      <div className="reg-review-section">
        <div className="reg-review-section-header">
          <div className="reg-review-section-title"><Cpu size={16} /> AI Initialization</div>
          <button className="btn btn-ghost" style={{ fontSize: '0.72rem', gap: 4 }} onClick={() => setCurrentStep(6)}>
            <Pencil size={12} /> Edit
          </button>
        </div>
        <div style={{ padding: '14px 20px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          All {AI_INIT_ITEMS.length} AI monitoring modules have been initialized: Digital Project Passport created, baseline satellite imagery captured, AI monitoring pipeline configured, change detection enabled, geotag verification activated, citizen monitoring linked, and initial trust score computed.
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button className="btn btn-secondary" style={{ gap: 6 }}>
          <Save size={15} /> Save Draft
        </button>
        <button className="btn btn-primary" style={{ gap: 6 }} onClick={handleSubmit}>
          <Send size={15} /> Submit Project
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function ProjectRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    projectId: generateProjectId(),
    projectName: '',
    projectType: '',
    department: '',
    schemeName: '',
    description: '',
    estimatedBudget: '',
    fundingSource: '',
    priority: '',
    expectedStartDate: '',
    expectedCompletionDate: '',
    // Location
    state: '',
    district: '',
    taluk: '',
    village: '',
    pincode: '',
    latitude: '',
    longitude: '',
    boundary: [],
    // Contractor
    contractorId: '',
    contractorName: '',
    contractorCompany: '',
    contractorContact: '',
    contractorEmail: '',
    tenderNumber: '',
    workOrderNumber: '',
    // Documents
    documents: {},
    // Metadata
    roadLength: '',
    roadWidth: '',
    numberOfStructures: '',
    constructionType: '',
    terrain: '',
    estimatedMaterials: '',
    milestones: [],
  }));

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 7));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo formData={formData} updateField={updateField} />;
      case 2:
        return <StepLocation formData={formData} updateField={updateField} setFormData={setFormData} />;
      case 3:
        return <StepContractor formData={formData} updateField={updateField} />;
      case 4:
        return <StepDocuments formData={formData} setFormData={setFormData} />;
      case 5:
        return <StepMetadata formData={formData} updateField={updateField} setFormData={setFormData} />;
      case 6:
        return <StepAIInit />;
      case 7:
        return <StepReview formData={formData} setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
          Register New Infrastructure Project
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Complete all steps to register and initialize AI monitoring for a new project
        </p>
      </div>

      {/* Step progress bar */}
      <div className="reg-stepper">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          return (
            <div
              key={step.id}
              className={`reg-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (isCompleted || isActive) setCurrentStep(step.id);
              }}
            >
              <div className="reg-step-circle">
                {isCompleted ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className="reg-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons (hidden on review step which has its own buttons) */}
      {currentStep < 7 && (
        <div className="reg-nav-buttons">
          <button
            className="btn btn-secondary"
            onClick={goPrev}
            disabled={currentStep === 1}
            style={{ gap: 6, opacity: currentStep === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="btn-group">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              Step {currentStep} of {STEPS.length}
            </span>
            <button className="btn btn-primary" onClick={goNext} style={{ gap: 6 }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
