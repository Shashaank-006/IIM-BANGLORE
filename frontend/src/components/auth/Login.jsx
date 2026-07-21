import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Eye, EyeOff, AlertCircle, ArrowRight, Loader2,
  Mail, Lock, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
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
              <div className={styles.brandName}>Bhoot Nirman</div>
              {/* <div className={styles.brandSub}>Infrastructure MIS · v2.4.1</div> */}
            </div>
          </div>

          <div className={styles.panelText}>
            <h2 className={styles.panelHeading}>
              National Infrastructure<br />Intelligence Portal
            </h2>
            <p className={styles.panelDesc}>
              An AI system that verifies whether public infrastructure actually exists — using satellite imagery, computer vision, and government expenditure data.

            </p>
          </div>

          {/* <div className={styles.statRow}>
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
          </div> */}

          <div className={styles.panelFooter}>
            <span className={styles.securityBadge}>
              GOOGLE MAPS  +  AI VISION  +  A CAG AUDITOR — IN ONE SYSTEM
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
                Email Address
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
                  placeholder="you@example.com"
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

          <div style={{ borderTop: '1px dashed var(--border)', marginTop: '20px', paddingTop: '16px' }}>
            <span className={styles.switchText} style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Developer Quick Access Roles:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Joint Secretary', email: 'priya.nair@nic.in', pass: 'GovWatch@2026' },
                { label: 'CAG Auditor', email: 'ranjit.sahu@cag.gov.in', pass: 'Audit@2026' },
                { label: 'State Audit Officer', email: 'demo@govwatch.gov.in', pass: 'Demo@1234' },
                { label: 'District Collector', email: 'collector.sindhudurg@nic.in', pass: 'Collector@2026' },
                { label: 'Municipal Officer', email: 'municipal.officer@nic.in', pass: 'Municipal@2026' },
              ].map(role => (
                <button
                  key={role.label}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 10px', fontSize: '0.74rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                  onClick={async () => {
                    setForm({ email: role.email, password: role.pass, rememberMe: false });
                    setLoading(true);
                    setError('');
                    try {
                      await login(role.email, role.pass);
                      navigate('/', { replace: true });
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{role.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{role.email}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
