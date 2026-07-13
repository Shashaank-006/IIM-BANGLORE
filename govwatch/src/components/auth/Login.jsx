import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Eye, EyeOff, AlertCircle, ArrowRight, Loader2,
  Mail, Lock, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const ROLES = [
  'Joint Secretary, Ministry of Rural Development',
  'CAG Auditor',
  'State Audit Officer',
  'District Collector',
  'Municipal Officer',
];

// Demo accounts for evaluation
const DEMO_ACCOUNTS = [
  { role: 'Joint Secretary', email: 'priya.nair@nic.in', password: 'GovWatch@2026' },
  { role: 'CAG Auditor', email: 'ranjit.sahu@cag.gov.in', password: 'Audit@2026' },
  { role: 'State Audit Officer', email: 'demo@govwatch.gov.in', password: 'Demo@1234' },
  { role: 'District Collector', email: 'collector.sindhudurg@nic.in', password: 'Collector@2026' },
  { role: 'Municipal Officer', email: 'municipal.officer@nic.in', password: 'Municipal@2026' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', role: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your government email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Left decorative panel */}
      <div className={styles.panel}>
        <motion.div
          className={styles.panelInner}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className={styles.brandRow}>
            <div className={styles.brandIcon}>
              <Shield size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className={styles.brandName}>GovWatch</div>
              <div className={styles.brandSub}>Infrastructure MIS · v2.4.1</div>
            </div>
          </div>

          <div className={styles.panelText}>
            <h2 className={styles.panelHeading}>
              National Infrastructure<br />Intelligence Portal
            </h2>
            <p className={styles.panelDesc}>
              Secure, real-time monitoring of central government infrastructure projects, budget flows, and contractor compliance across all Indian states and districts.
            </p>
          </div>

          <div className={styles.statRow}>
            {[
              { value: '₹373 Cr', label: 'Total Allocation' },
              { value: '8', label: 'Active Projects' },
              { value: '7', label: 'States Covered' },
            ].map((s) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className={styles.panelFooter}>
            <span className={styles.securityBadge}>
              <Shield size={11} />
              End-to-end encrypted · CERT-In compliant
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className={styles.formSide}>
        <motion.div
          className={styles.formCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Sign in to your account</h1>
            <p className={styles.formSubtitle}>
              Use your government-issued credentials to access the portal.
            </p>
          </div>

          {/* Demo hint panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Demo Login</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, email: acc.email, password: acc.password, role: acc.role }));
                    setError('');
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              className={styles.errorBox}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Email */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="login-email">
                Government Email
              </label>
              <div className={styles.inputWrap}>
                <Mail size={14} className={styles.inputIcon} />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="you@nic.in or you@gov.in"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.fieldLabel} htmlFor="login-password">
                  Password
                </label>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <div className={styles.inputWrap}>
                <Lock size={14} className={styles.inputIcon} />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="login-role">
                Role <span className={styles.optional}>(optional)</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="login-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="">Select your role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={13} className={styles.selectIcon} />
              </div>
            </div>

            {/* Remember me */}
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className={styles.checkboxHidden}
                disabled={loading}
              />
              <span className={styles.checkbox}>
                {form.rememberMe ? (
                  <CheckSquare size={15} style={{ color: 'var(--accent-blue)' }} />
                ) : (
                  <Square size={15} style={{ color: 'var(--text-muted)' }} />
                )}
              </span>
              <span className={styles.checkLabel}>Keep me signed in for 7 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className={styles.spinner} />
                  Authenticating…
                </>
              ) : (
                <>
                  Secure Login
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className={styles.switchRow}>
            <span className={styles.switchText}>Don't have an account?</span>
            <Link to="/signup" className={styles.switchLink}>
              Create account →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
