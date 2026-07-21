import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, ArrowRight, Plus, Home, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useProjects } from '../../../context/ProjectContext';
import '../../../styles/ProjectRegistration.css';

export default function ProjectSuccess() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  const [visibleItems, setVisibleItems] = useState([]);

  const timelineItems = project
    ? [
        'Project successfully registered',
        `Unique Project ID generated — ${projectId}`,
        'Digital Project Passport created',
        'Baseline Satellite Capture completed',
        'AI Monitoring initialized',
        `Initial Trust Score generated — ${project.trustScore}/100`,
      ]
    : [];

  useEffect(() => {
    if (!project) return;

    const timers = timelineItems.map((_, index) =>
      setTimeout(() => {
        setVisibleItems((prev) => [...prev, index]);
      }, (index + 1) * 400)
    );

    return () => timers.forEach(clearTimeout);
  }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}
      >
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <AlertCircle size={36} style={{ color: 'var(--accent-red)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            Project Not Found
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The project with ID <strong>{projectId}</strong> could not be found. It may not have been registered yet.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ marginTop: 8 }}
          >
            <Home size={15} />
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="reg-success-container">
        {/* Success Icon */}
        <div className="reg-success-icon animate">
          <CheckCircle2 size={40} style={{ color: 'var(--accent-green)' }} />
        </div>

        {/* Title */}
        <h1 className="reg-success-title">Project Successfully Registered!</h1>

        {/* Subtitle */}
        <p className="reg-success-subtitle">
          <strong>{project.name}</strong> has been registered with ID{' '}
          <span style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontWeight: 600, color: 'var(--accent-blue)' }}>
            {projectId}
          </span>
        </p>

        {/* Timeline */}
        <div className="reg-success-timeline">
          {timelineItems.map((text, index) => (
            <div
              key={index}
              className={`reg-success-timeline-item${visibleItems.includes(index) ? ' visible' : ''}`}
            >
              <div className="reg-success-timeline-check">
                <Check size={13} style={{ color: '#fff' }} />
              </div>
              <span className="reg-success-timeline-text">{text}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="reg-success-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/mo/digital-passport/${projectId}`)}
          >
            <FileText size={15} />
            View Digital Passport
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/mo/register-project')}
          >
            <Plus size={15} />
            Register Another Project
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/')}
          >
            <Home size={15} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
}
