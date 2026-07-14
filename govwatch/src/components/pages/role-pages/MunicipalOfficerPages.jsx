import { useState } from 'react';
import { Upload, Camera, MessageSquare, CheckCircle2, AlertCircle, RefreshCw, MapPin } from 'lucide-react';

const myProjects = [
  { id: 'PRJ-011', name: 'Sindhudurg Coastal Road Widening', completion: 45, lastUpdate: '2026-07-02', status: 'In Progress' },
  { id: 'PRJ-012', name: 'Kudal Rural Drinking Water', completion: 18, lastUpdate: '2026-06-28', status: 'Delayed' },
];

const aiFlaggedItems = [
  { id: 'ANM-503', project: 'Sindhudurg Coastal Road', finding: 'Embankment altitude differs from approved DPR by 3.2m', severity: 'High', deadline: '2026-07-20', status: 'Awaiting Response' },
];

export function ProjectUpdates() {
  const [updates, setUpdates] = useState(myProjects.map(p => ({ ...p, note: '' })));

  const handleNote = (id, note) => setUpdates(updates.map(u => u.id === id ? { ...u, note } : u));

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Completion Progress</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.completion}%</div>
              <div style={{ height: 4, background: 'var(--bg-active)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ width: `${p.completion}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 2 }} />
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
              <button className="btn btn-primary" style={{ padding: '6px 14px' }}>
                <RefreshCw size={13} />
                Submit Update
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function UploadCompletionReport() {
  const [form, setForm] = useState({ project: '', milestone: '', completedDate: '', remarks: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ project: '', milestone: '', completedDate: '', remarks: '' });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card" style={{ maxWidth: 640 }}>
        <span className="label">Milestone Certification</span>
        <h3 className="section-title mt-1 mb-4">Upload Completion Report</h3>

        {submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
            <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Completion report submitted successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Project</label>
            <select value={form.project} onChange={e => setForm({...form, project: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}>
              <option value="">Select project...</option>
              {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Milestone Completed</label>
            <input value={form.milestone} onChange={e => setForm({...form, milestone: e.target.value})} placeholder="e.g. Foundation Pour — Block A" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Completion Date</label>
            <input type="date" value={form.completedDate} onChange={e => setForm({...form, completedDate: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }} />
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

export function UploadGeotaggedImages() {
  const [form, setForm] = useState({ project: '', latitude: '', longitude: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card" style={{ maxWidth: 640 }}>
        <span className="label">Ground-Truth Verification</span>
        <h3 className="section-title mt-1 mb-4">Upload Geotagged Inspection Images</h3>

        {submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
            <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Images submitted for AI verification pipeline.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Project Reference</label>
            <select value={form.project} onChange={e => setForm({...form, project: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.83rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none' }}>
              <option value="">Select project...</option>
              {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

          <div style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '28px 20px', textAlign: 'center' }}>
            <Camera size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drag & drop geotagged images or <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>browse to attach</span></p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Supported: JPG, PNG · EXIF GPS data required · Max 8 MB each</p>
          </div>

          <button type="submit" className="btn btn-primary">
            <Camera size={14} />
            Submit to AI Verification Queue
          </button>
        </form>
      </div>
    </div>
  );
}

export function RespondToAIFindings() {
  const [responses, setResponses] = useState(aiFlaggedItems.map(f => ({ ...f, response: '' })));
  const [submitted, setSubmitted] = useState({});

  const handleSubmit = (id) => {
    setSubmitted(s => ({ ...s, [id]: true }));
  };

  return (
    <div className="flex flex-col gap-6">
      {responses.map((item, i) => (
        <div key={i} className="card">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="label" style={{ color: 'var(--accent-red)' }}>AI Anomaly Flagged</span>
              <h3 className="section-title mt-1">{item.project}</h3>
            </div>
            <span className="badge" style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>{item.severity} Priority</span>
          </div>

          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>AI Finding ({item.id})</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.finding}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: 8 }}>Response due by: {item.deadline}</p>
          </div>

          {submitted[item.id] ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-green-dim)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Response submitted. Escalated to District Collector.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Your Explanation / Clarification</label>
              <textarea
                rows={4}
                value={item.response}
                onChange={e => setResponses(responses.map((r, ri) => ri === i ? { ...r, response: e.target.value } : r))}
                placeholder="Provide a detailed explanation of the observed discrepancy and corrective actions taken or planned..."
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              />
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => handleSubmit(item.id)}>
                <MessageSquare size={14} />
                Submit Response
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
