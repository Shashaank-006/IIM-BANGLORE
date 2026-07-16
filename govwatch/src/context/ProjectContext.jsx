import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../services/api';

const ProjectContext = createContext(null);

const STORAGE_KEY = 'gw_registered_projects';
const AUDIT_STORAGE_KEY = 'gw_registration_audit_logs';

function generateTrustScore() {
  return Math.floor(Math.random() * 12) + 78; // 78–89 initial range
}

function transformToProjectShape(formData, user) {
  const now = new Date().toISOString();
  const trustScore = generateTrustScore();

  // Build timeline from milestones
  const timeline = [
    { date: now.split('T')[0], event: 'Project Registered', status: 'done' },
    { date: now.split('T')[0], event: 'Digital Passport Created', status: 'done' },
    { date: now.split('T')[0], event: 'Baseline Satellite Captured', status: 'done' },
    { date: now.split('T')[0], event: 'AI Monitoring Initialized', status: 'done' },
  ];

  if (formData.milestones && formData.milestones.length > 0) {
    formData.milestones.forEach((m) => {
      timeline.push({ date: m.date, event: m.name, status: 'upcoming' });
    });
  }

  timeline.push({ date: formData.expectedCompletionDate, event: 'Expected Completion', status: 'upcoming' });

  // Map scheme name to schemeId
  const schemeMap = {
    'PMGSY': 'pmgsy', 'MGNREGA': 'mgnrega', 'JJM': 'jjm',
    'PMAY': 'pmay', 'Smart Cities': 'smart', 'AMRUT': 'amrut',
  };

  return {
    id: formData.projectId,
    name: formData.projectName,
    scheme: formData.schemeName || 'PMGSY',
    schemeId: schemeMap[formData.schemeName] || 'pmgsy',
    state: formData.state,
    district: formData.district,
    village: formData.village || formData.taluk,
    status: 'Registered',
    budget: Number(formData.estimatedBudget) || 0,
    spent: 0,
    completion: 0,
    startDate: formData.expectedStartDate,
    expectedEnd: formData.expectedCompletionDate,
    lastUpdated: now,
    contractor: formData.contractorName || 'Not Assigned',
    contractorId: formData.contractorId || '',
    officer: user?.name || 'Municipal Officer',
    officerId: user?.employeeId || '',
    coordinates: [
      parseFloat(formData.latitude) || 20.5937,
      parseFloat(formData.longitude) || 78.9629,
    ],
    riskScore: 'Low',
    flagged: false,
    description: formData.description || '',
    disbursements: [],
    timeline,
    // Registration-specific fields
    isRegistered: true,
    registrationTimestamp: now,
    projectType: formData.projectType,
    department: formData.department,
    fundingSource: formData.fundingSource,
    priority: formData.priority,
    pincode: formData.pincode,
    taluk: formData.taluk,
    boundary: formData.boundary || [],
    boundaryArea: formData.boundaryArea || null,
    boundaryLength: formData.boundaryLength || null,
    contractorCompany: formData.contractorCompany || '',
    contractorContact: formData.contractorContact || '',
    contractorEmail: formData.contractorEmail || '',
    tenderNumber: formData.tenderNumber || '',
    workOrderNumber: formData.workOrderNumber || '',
    documents: formData.documents || [],
    metadata: {
      roadLength: formData.roadLength || '',
      roadWidth: formData.roadWidth || '',
      numberOfStructures: formData.numberOfStructures || '',
      constructionType: formData.constructionType || '',
      terrain: formData.terrain || '',
      estimatedMaterials: formData.estimatedMaterials || '',
      milestones: formData.milestones || [],
    },
    trustScore,
    aiMonitoringStatus: 'Active',
    baselineSatelliteStatus: 'Captured',
    digitalPassport: true,
    changeDetection: 'Enabled',
    geotagVerification: 'Enabled',
    citizenMonitoring: 'Enabled',
  };
}

export function ProjectProvider({ children }) {
  const [dbProjects, setDbProjects] = useState([]);
  const [dbContractors, setDbContractors] = useState([]);
  const [dbAuditLogs, setDbAuditLogs] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [kpiData, setKpiData] = useState({
    budgetUtilization: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [registeredProjects, setRegisteredProjects] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [registrationAuditLogs, setRegistrationAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load data from database on mount
  useEffect(() => {
    async function loadData() {
      try {
        const projData = await api.projects.getAll();
        if (projData && Array.isArray(projData)) {
          setDbProjects(projData);
          if (projData.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(AUDIT_STORAGE_KEY);
            setRegisteredProjects([]);
            setRegistrationAuditLogs([]);
          }
        }
      } catch (err) {
        console.warn("Could not load projects from API.", err);
      }

      try {
        const contractorsData = await api.contractors.getAll();
        if (contractorsData && Array.isArray(contractorsData)) {
          setDbContractors(contractorsData);
        }
      } catch (err) {
        console.warn("Could not load contractors from API.", err);
      }

      try {
        const logsData = await api.auditLogs.getAll();
        if (logsData && Array.isArray(logsData)) {
          setDbAuditLogs(logsData);
        }
      } catch (err) {
        console.warn("Could not load audit logs from API.", err);
      }

      try {
        const schemesData = await api.schemes.getAll();
        if (schemesData && Array.isArray(schemesData)) {
          setSchemes(schemesData);
        }
      } catch (err) {
        console.warn("Could not load schemes from API.", err);
      }

      try {
        const budget = await api.budget.get();
        if (budget) {
          setBudgetData(budget);
        }
      } catch (err) {
        console.warn("Could not load budget data from API.", err);
      }

      try {
        const kpi = await api.kpi.get();
        if (kpi) {
          setKpiData(kpi);
        }
      } catch (err) {
        console.warn("Could not load KPI data from API.", err);
      }

      try {
        const feed = await api.activityFeed.get();
        if (feed && Array.isArray(feed)) {
          setActivityFeed(feed);
        }
      } catch (err) {
        console.warn("Could not load activity feed from API.", err);
      }

      try {
        const notifs = await api.notifications.getAll();
        if (notifs && Array.isArray(notifs)) {
          setNotifications(notifs);
        }
      } catch (err) {
        console.warn("Could not load notifications from API.", err);
      }
    }
    loadData();
  }, []);

  const allProjects = useMemo(() => {
    if (dbProjects.length > 0) {
      return dbProjects;
    }
    return registeredProjects;
  }, [dbProjects, registeredProjects]);

  const allContractors = useMemo(() => dbContractors, [dbContractors]);

  const allAuditLogs = useMemo(
    () => [...registrationAuditLogs, ...dbAuditLogs],
    [registrationAuditLogs, dbAuditLogs]
  );

  const addProject = useCallback(async (formData, user) => {
    const project = transformToProjectShape(formData, user);

    // Create audit log entry
    const auditEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: user?.name || 'Municipal Officer',
      actorType: 'Municipal Officer',
      action: 'Project Registered',
      entity: project.id,
      entityName: project.name,
      detail: `New infrastructure project registered. Budget: ₹${(project.budget / 100000).toFixed(1)}L. AI Monitoring initialized. Trust Score: ${project.trustScore}`,
      severity: 'success',
    };

    // Attempt to register on the backend
    try {
      await api.projects.create(project);
      // Reload projects list from backend
      const updatedList = await api.projects.getAll();
      if (updatedList && Array.isArray(updatedList)) {
        setDbProjects(updatedList);
      }
    } catch (err) {
      console.warn("Could not sync project creation with backend, saving locally.", err);
    }

    setRegisteredProjects((prev) => {
      const updated = [...prev, project];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setRegistrationAuditLogs((prev) => {
      const updated = [auditEntry, ...prev];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return project;
  }, []);

  const getProject = useCallback(
    (id) => allProjects.find((p) => p.id === id),
    [allProjects]
  );

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      allProjects,
      allContractors,
      allAuditLogs,
      registeredProjects,
      schemes,
      budgetData,
      kpiData,
      activityFeed,
      addProject,
      getProject,
      notifications,
      unreadCount,
      loadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      allProjects,
      allContractors,
      allAuditLogs,
      registeredProjects,
      schemes,
      budgetData,
      kpiData,
      activityFeed,
      addProject,
      getProject,
      notifications,
      unreadCount,
      loadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
