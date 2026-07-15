import { useState, useEffect } from 'react';
import { Upload, Camera, MessageSquare, CheckCircle2, AlertCircle, RefreshCw, MapPin, Bot } from 'lucide-react';
import { useProjects } from '../../../context/ProjectContext';
import { api } from '../../../services/api';

// ─── PROJECT UPDATES & PROGRESS REMARKS ────────────────────────────────────────
export function ProjectUpdates() {
  const { allProjects } = useProjects();
  const [updates, setUpdates] = useState([]);
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
    if (allProjects && allProjects.length > 0) {
      setUpdates(allProjects.map(p => ({
        id: p.id,
        name: p.name,
        completion: p.completion || 0,
        lastUpdate: p.lastUpdated ? p.lastUpdated.split('T')[0] : 'Not updated',
        status: p.status,
        note: ''
      })));
    }
  }, [allProjects]);

  const handleNote = (id, note) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, note } : u));
  };

  const handleCompletionChange = (id, comp) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, completion: Math.min(100, Math.max(0, parseInt(comp) || 0)) } : u));
  };

  const handleSubmit = async (p) => {
    const finalNote = p.note ? p.note.trim() : `Progress updated to ${p.completion}%`;
    try {
      await api.projects.addProgressUpdate(p.id, finalNote, p.completion);
      setSuccessId(p.id);
      setTimeout(() => setSuccessId(null), 3000);
      setUpdates(updates.map(u => u.id === p.id ? { ...u, note: '', lastUpdate: new Date().toISOString().split('T')[0] } : u));
    } catch (err) {
      alert("Failed to submit progress update.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {updates.map((p, i) => (
        <div key={i} className="card">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="label">Project Update</span>
              <h3 className="section-title mt-1">{p.name}</h3>
            </div>
            <span className="badge" style={{ background: p.status === 'Delayed' ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)', color: p.status === 'Delayed' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>{p.status}</span>
          </div>

          {successId === p.id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 12 }}>
              <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Progress update logged and synchronized with Collector portal.</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Completion Progress (%)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input 
                  type="number" 
                  value={p.completion} 
                  onChange={e => handleCompletionChange(p.id, e.target.value)} 
                  style={{ background: 'var(--bg-active)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', width: '60px', fontSize: '0.9rem', fontWeight: 700 }}
                />
                <div style={{ flex: 1, height: 4, background: 'var(--bg-active)', borderRadius: 2 }}>
                  <div style={{ width: `${p.completion}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Last Reported</div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>{p.lastUpdate}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Add Progress Note</label>
            <textarea
              rows={3}
              value={p.note}
              onChange={e => handleNote(p.id, e.target.value)}
              placeholder="Describe work completed today, any delays or issues..."
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Remarks will be forwarded to District Collector</span>
              <button className="btn btn-primary" onClick={() => handleSubmit(p)} style={{ padding: '6px 14px' }}>
                <RefreshCw size={13} />
                Submit Update
              </button>
            </div>
          </div>
        </div>
      ))}
      {updates.length === 0 && (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          No active projects assigned.
        </div>
      )}
    </div>
  );
}

// ─── UPLOAD COMPLETION REPORT ──────────────────────────────────────────────────
export function UploadCompletionReport() {
  const { allProjects } = useProjects();
  const [form, setForm] = useState({ project: '', milestone: '', completedDate: '', remarks: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.milestone || !form.completedDate) return;
    try {
      await api.projects.submitCompletionReport(form);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
      setForm({ project: '', milestone: '', completedDate: '', remarks: '' });
    } catch (err) {
      alert("Failed to submit completion report.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card" style={{ maxWidth: 640 }}>
        <span className="label">Milestone Certification</span>
        <h3 className="section-title mt-1 mb-4">Upload Completion Report</h3>

        {submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
            <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Completion report submitted successfully. Status set to Completed.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Project</label>
            <select value={form.project} onChange={e => setForm({...form, project: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} required>
              <option value="">Select project...</option>
              {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Milestone Completed</label>
            <input value={form.milestone} onChange={e => setForm({...form, milestone: e.target.value})} placeholder="e.g. Foundation Pour — Block A" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Completion Date</label>
            <input type="date" value={form.completedDate} onChange={e => setForm({...form, completedDate: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Remarks & Supporting Note</label>
            <textarea rows={3} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Describe the completion status and any deviations..." style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
          </div>

          <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '28px 20px', textAlign: 'center' }}>
            <Upload size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drag & drop PDF report or <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>browse to attach</span></p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Supported: PDF, DOC up to 10 MB</p>
          </div>

          <button type="submit" className="btn btn-primary">
            <Upload size={14} />
            Submit Completion Report
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── UPLOAD GEOTAGGED IMAGES (LIVE AI VERIFICATION WORKBENCH) ──────────────────
export function UploadGeotaggedImages() {
  const { allProjects } = useProjects();
  const [form, setForm] = useState({ project: '', latitude: '', longitude: '', description: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleProjectChange = (projectId) => {
    const selectedProj = allProjects.find(p => p.id === projectId);
    if (selectedProj && selectedProj.coordinates) {
      setForm({
        ...form,
        project: projectId,
        latitude: String(selectedProj.coordinates[0]),
        longitude: String(selectedProj.coordinates[1])
      });
    } else {
      setForm({
        ...form,
        project: projectId,
        latitude: '',
        longitude: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project) {
      setErrorMessage("Please select a project.");
      return;
    }
    if (!uploadFile) {
      setErrorMessage("Please attach an image to analyze.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setErrorMessage(null);

    try {
      const result = await api.verification.analyze(form.project, uploadFile);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card" style={{ maxWidth: 640 }}>
        <span className="label">Ground-Truth Verification</span>
        <h3 className="section-title mt-1 mb-4">Upload Geotagged Inspection Images</h3>

        {errorMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-red-dim)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
            <AlertCircle size={14} style={{ color: 'var(--accent-red)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 500 }}>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Infrastructure Project</label>
            <select value={form.project} onChange={e => handleProjectChange(e.target.value)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} required>
              <option value="">Select project...</option>
              {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>GPS Latitude</label>
              <input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} placeholder="e.g. 16.0640" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'monospace', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>GPS Longitude</label>
              <input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} placeholder="e.g. 73.4611" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'monospace', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Image Description</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Embankment foundation pour — Block A, Northern face" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <label style={{ display: 'block', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '28px 20px', textAlign: 'center', cursor: 'pointer' }}>
            <input type="file" style={{ display: 'none' }} accept="image/png, image/jpeg, image/jpg" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setUploadFile(e.target.files[0]);
              }
            }} />
            <Camera size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            {uploadFile ? (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{uploadFile.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{(uploadFile.size / 1024).toFixed(1)} KB · Ready to analyze</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drag & drop geotagged images or <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>browse to attach</span></p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Supported: JPG, PNG · EXIF GPS data required · Max 8 MB each</p>
              </div>
            )}
          </label>

          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ gap: 8 }}>
            {isLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Analyzing Image with Gemini AI...
              </>
            ) : (
              <>
                <Camera size={14} />
                Submit to AI Verification Queue
              </>
            )}
          </button>
        </form>

        {analysisResult && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Bot size={20} color="var(--accent-blue)" />
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Verification Report</h4>
              <span className="badge" style={{ marginLeft: 'auto', backgroundColor: analysisResult.asset_detected ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: analysisResult.asset_detected ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {analysisResult.asset_detected ? 'Asset Verified' : 'Anomaly Detected'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span className="label" style={{ fontSize: '0.62rem' }}>Construction Stage</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 650, marginTop: 2 }}>{analysisResult.construction_stage || 'Unknown'}</p>
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span className="label" style={{ fontSize: '0.62rem' }}>Confidence / Trust Score</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 650, marginTop: 2, color: 'var(--accent-blue)' }}>
                  {analysisResult.confidence}% / {analysisResult.trust_score}%
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Fraud Indicators:</strong>
                <ul style={{ paddingLeft: 16, marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {analysisResult.fraud_indicators ? Object.entries(analysisResult.fraud_indicators).map(([k, v]) => (
                    <li key={k} style={{ color: v ? 'var(--accent-red)' : 'var(--text-muted)', listStyleType: 'disc' }}>
                      {k.replace(/_/g, ' ')}: <span style={{ fontWeight: 600 }}>{v ? 'YES' : 'NO'}</span>
                    </li>
                  )) : 'None'}
                </ul>
              </div>
              
              <div style={{ marginTop: 4 }}>
                <strong style={{ color: 'var(--text-primary)' }}>AI Reasoning & Observations:</strong>
                <ul style={{ paddingLeft: 16, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {analysisResult.observations && analysisResult.observations.map((obs, idx) => (
                    <li key={idx} style={{ color: 'var(--text-secondary)', listStyleType: 'disc', lineHeight: 1.3 }}>{obs}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 8, background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-amber)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.76rem', display: 'block', marginBottom: 4 }}>Audit Recommendation:</strong>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{analysisResult.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RESPOND TO AI FINDINGS ────────────────────────────────────────────────────
export function RespondToAIFindings() {
  const [anomalies, setAnomalies] = useState([]);
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAnomalies = async () => {
    try {
      const data = await api.anomalies.getAll();
      setAnomalies(data.map(a => ({ ...a, responseNote: '' })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  const handleResponseNoteChange = (anomalyId, val) => {
    setAnomalies(anomalies.map(a => a.anomaly_id === anomalyId ? { ...a, responseNote: val } : a));
  };

  const handleSubmit = async (item) => {
    if (!item.responseNote) return;
    try {
      await api.anomalies.respond(item.anomaly_id, item.responseNote);
      setSubmitted(s => ({ ...s, [item.anomaly_id]: true }));
    } catch (err) {
      alert("Failed to submit response explanation.");
    }
  };

  if (loading) {
    return <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading AI findings...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {anomalies.map((item, i) => (
        <div key={i} className="card">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="label" style={{ color: 'var(--accent-red)' }}>AI Anomaly Flagged</span>
              <h3 className="section-title mt-1">{item.project}</h3>
            </div>
            <span className="badge" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>{item.severity} Priority</span>
          </div>

          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>AI Finding ({item.anomaly_id})</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.detail}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: 8 }}>Response due by: {item.deadline}</p>
          </div>

          {submitted[item.anomaly_id] || item.response ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>Clarification response logged. Escalated to District Collector.</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: 22, fontStyle: 'italic' }}>
                Explanation: "{item.response || item.responseNote}"
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Your Explanation / Clarification</label>
              <textarea
                rows={4}
                value={item.responseNote}
                onChange={e => handleResponseNoteChange(item.anomaly_id, e.target.value)}
                placeholder="Provide a detailed explanation of the observed discrepancy and corrective actions taken or planned..."
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              />
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => handleSubmit(item)}>
                <MessageSquare size={14} />
                Submit Response
              </button>
            </div>
          )}
        </div>
      ))}
      {anomalies.length === 0 && (
        <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          No AI anomalies logged at this time.
        </div>
      )}
    </div>
  );
}
