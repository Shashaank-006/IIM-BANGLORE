import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Eye, EyeOff, AlertCircle, CheckCircle2,
  ArrowRight, Loader2, Mail, Lock, User, Hash,
  Building2, ChevronDown
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

const DEPARTMENTS = [
  'Ministry of Rural Development',
  'Comptroller & Auditor General of India',
  'State Finance Department',
  'District Administration',
  'Municipal Corporation',
  'Ministry of Housing & Urban Affairs',
  'Ministry of Jal Shakti',
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    fullName: '', email: '', employeeId: '',
    department: '', role: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Please enter a valid email address.';
    if (!form.employeeId.trim()) return 'Employee ID is required.';
    if (!form.department) return 'Please select your department.';
    if (!form.role) return 'Please select your role.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9!@#$%^&*]/.test(form.password)) return 'Password must contain at least one number or special character.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await signup(form);
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'var(--accent-red)', 'var(--accent-amber)', 'var(--accent-blue)', 'var(--accent-green)'][strength];

  if (success) {
    return (
      <div className={styles.authPage} style={{ justifyContent: 'center' }}>
        <motion.div
          className={styles.successCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.successIcon}>
            <CheckCircle2 size={32} style={{ color: 'var(--accent-green)' }} />
          </div>
          <h2 className={styles.successTitle}>Account Created</h2>
          <p className={styles.successDesc}>
            Welcome, {form.fullName}. Your government account has been created. Redirecting to dashboard…
          </p>
          <div className={styles.successBar}>
            <motion.div
              className={styles.successBarFill}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${styles.authPage} ${styles.signupPage}`}>
      {/* Left brand panel */}
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
              Register your<br />Government Account
            </h2>
            <p className={styles.panelDesc}>
              Account creation is restricted to verified government personnel. Use your official email and Employee ID to register. All registrations are subject to department administrator approval.
            </p>
          </div>

          <ul className={styles.featureList}>
            {[
              'Real-time project monitoring',
              'Budget & disbursement tracking',
              'Contractor risk intelligence',
              'PFMS-linked audit trail',
              'District-level geospatial views',
            ].map((f) => (
              <li key={f} className={styles.featureItem}>
                <CheckCircle2 size={13} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>

          <div className={styles.panelFooter}>
            <span className={styles.securityBadge}>
              <Shield size={11} />
              End-to-end encrypted · CERT-In compliant
            </span>
          </div>
        </motion.div>
      </div>

      {/* Right scrollable form */}
      <div className={styles.formSide}>
        <motion.div
          className={styles.formCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        >
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create your account</h1>
            <p className={styles.formSubtitle}>
              Fill in your official government details to register.
            </p>
          </div>

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
            {/* Full Name */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-name">Full Name</label>
              <div className={styles.inputWrap}>
                <User size={14} className={styles.inputIcon} />
                <input
                  id="su-name" name="fullName" type="text" autoComplete="name"
                  value={form.fullName} onChange={handleChange}
                  className={styles.input} placeholder="e.g. Priya Nair" disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-email">Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={14} className={styles.inputIcon} />
                <input
                  id="su-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange}
                  className={styles.input} placeholder="you@example.com" disabled={loading}
                />
              </div>
            </div>

            {/* Employee ID */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-empid">Employee ID</label>
              <div className={styles.inputWrap}>
                <Hash size={14} className={styles.inputIcon} />
                <input
                  id="su-empid" name="employeeId" type="text"
                  value={form.employeeId} onChange={handleChange}
                  className={styles.input} placeholder="e.g. IAS-DL-001" disabled={loading}
                />
              </div>
            </div>

            {/* Department */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-dept">Department</label>
              <div className={styles.selectWrap}>
                <Building2 size={14} className={styles.selectIconLeft} />
                <select
                  id="su-dept" name="department" value={form.department}
                  onChange={handleChange} className={`${styles.select} ${styles.selectWithLeft}`}
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={13} className={styles.selectIcon} />
              </div>
            </div>

            {/* Role */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-role">Role</label>
              <div className={styles.selectWrap}>
                <select
                  id="su-role" name="role" value={form.role}
                  onChange={handleChange} className={styles.select} disabled={loading}
                >
                  <option value="">Select your role</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={13} className={styles.selectIcon} />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-pw">Password</label>
              <div className={styles.inputWrap}>
                <Lock size={14} className={styles.inputIcon} />
                <input
                  id="su-pw" name="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password" value={form.password} onChange={handleChange}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number" disabled={loading}
                />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthTrack}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={styles.strengthSeg}
                        style={{ background: i <= strength ? strengthColor : 'var(--bg-active)' }}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="su-cpw">Confirm Password</label>
              <div className={styles.inputWrap}>
                <Lock size={14} className={styles.inputIcon} />
                <input
                  id="su-cpw" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password" value={form.confirmPassword} onChange={handleChange}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                  placeholder="Re-enter your password" disabled={loading}
                />
                <button type="button" className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <span className={styles.mismatch}>Passwords do not match</span>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length > 0 && (
                <span className={styles.match}>
                  <CheckCircle2 size={11} /> Passwords match
                </span>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <><Loader2 size={15} className={styles.spinner} />Creating account…</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className={styles.switchRow}>
            <span className={styles.switchText}>Already have an account?</span>
            <Link to="/login" className={styles.switchLink}>Sign in →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
