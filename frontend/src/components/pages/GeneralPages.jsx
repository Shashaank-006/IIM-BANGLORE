import { useState } from 'react';
import { Bell, Settings, HelpCircle, CheckCircle2, AlertTriangle, Info, BookOpen, FileText, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

// ─────────────── NOTIFICATIONS PAGE ───────────────
export function Notifications() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useProjects();

  const markRead = (id) => markNotificationRead(id);
  const markAll = () => markAllNotificationsRead();

  const typeIcon = (type) => {
    if (type === 'alert') return <AlertTriangle size={14} style={{ color: 'var(--accent-red)' }} />;
    if (type === 'action') return <CheckCircle2 size={14} style={{ color: 'var(--accent-amber)' }} />;
    return <Info size={14} style={{ color: 'var(--accent-blue)' }} />;
  };

  const typeBg = (type) => {
    if (type === 'alert') return 'var(--accent-red-dim)';
    if (type === 'action') return 'var(--accent-amber-dim)';
    return 'var(--accent-blue-dim)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Inbox</span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 2 }}>
            Notifications {unreadCount > 0 && <span style={{ fontSize: '0.7rem', background: 'var(--accent-red)', color: '#fff', borderRadius: '10px', padding: '1px 7px', marginLeft: 6 }}>{unreadCount}</span>}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAll} style={{ fontSize: '0.75rem' }}>
            <CheckCircle2 size={13} /> Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '14px 16px',
              background: n.read ? 'var(--bg-surface)' : 'var(--bg-elevated)',
              border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition)',
              opacity: n.read ? 0.7 : 1,
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: typeBg(n.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              {typeIcon(n.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: n.read ? 500 : 600, color: 'var(--text-primary)' }}>{n.title}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{n.desc}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────── SETTINGS PAGE ───────────────
export function SettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({ emailAlerts: true, aiNotifications: true, weeklyDigest: false, timezone: 'Asia/Kolkata', language: 'en-IN' });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>
      <div className="card">
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Account</span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4 }}>Profile Information</h3>
        <div className="layout-equal-2" style={{ marginTop: 16 }}>
          {[
            { label: 'Full Name', value: user?.name || '' },
            { label: 'Email Address', value: user?.email || '' },
            { label: 'Employee ID', value: user?.employeeId || '' },
            { label: 'Department', value: user?.department || '' },
            { label: 'Designated Role', value: user?.role || '' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>{f.label}</label>
              <input readOnly value={f.value} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none', opacity: 0.8 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Preferences</span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4, marginBottom: 16 }}>Notification Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical alerts via government email' },
            { key: 'aiNotifications', label: 'AI Anomaly Alerts', desc: 'Get notified when AI flags anomalies on your projects' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly PDF digest of project progress sent to inbox' },
          ].map(p => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
              </div>
              <button
                onClick={() => setPrefs(s => ({ ...s, [p.key]: !s[p.key] }))}
                style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: prefs[p.key] ? 'var(--accent-blue)' : 'var(--bg-active)', transition: 'background 0.2s ease', position: 'relative' }}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: prefs[p.key] ? 21 : 3, transition: 'left 0.2s ease' }} />
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={save}>
          {saved ? <><CheckCircle2 size={14} />Saved!</> : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// ─────────────── HELP & DOCS PAGE ───────────────
export function HelpDocs() {
  const topics = [
    { icon: BookOpen, title: 'User Guide', desc: 'Step-by-step instructions for all platform features, navigation, and roles.' },
    { icon: FileText, title: 'Government Procedures Manual', desc: 'Official guidelines for project auditing, budget tranche approval, and PFMS integration.' },
    { icon: Settings, title: 'API Reference', desc: 'Technical documentation for platform integrations and PFMS webhook callbacks.' },
    { icon: Phone, title: 'Technical Helpdesk', desc: 'Contact NIC support for portal access, credentials, and system issues.' },
  ];

  const faqs = [
    { q: 'How do I submit a completion report?', a: 'Navigate to Upload Completion Reports under your role menu, fill in project details, attach the PDF, and click Submit.' },
    { q: 'How does the AI anomaly detection work?', a: 'Our system cross-references geotagged photos against satellite imagery and CAD drawings using convolutional neural analysis.' },
    { q: 'How do I respond to an AI flagged finding?', a: 'Go to Respond to AI Findings, select the relevant flag, write your explanation, and click Submit Response.' },
    { q: 'I cannot log in. Who do I contact?', a: 'Contact the NIC Technical Desk at helpdesk@nic.in or call 1800-111-555 (toll free, Mon–Fri 9am–6pm IST).' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="layout-equal-2">
        {topics.map((t, i) => (
          <div key={i} className="card" style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <t.icon size={16} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>Common Questions</span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 4, marginBottom: 16 }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>{faq.q}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
