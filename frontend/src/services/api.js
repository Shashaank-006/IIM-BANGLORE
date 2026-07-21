const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function request(endpoint, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE}${endpoint}`;
  
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    signal: controller.signal
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(id);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      const timeoutError = new Error('The request timed out. Please check your connection and try again.');
      timeoutError.status = 408;
      throw timeoutError;
    }
    if (error.message && error.message.includes('Failed to fetch')) {
      const fetchError = new Error('Could not connect to the server. Please ensure the backend is running.');
      fetchError.status = 503;
      throw fetchError;
    }
    throw error;
  }
}

export const api = {
  auth: {
    login: (email, password) => 
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
      
    signup: (formData) => 
      request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
          employeeId: formData.employeeId,
          department: formData.department
        })
      })
  },

  users: {
    getAll: () => request('/api/auth/users'),
    create: (user) => request('/api/auth/users', { method: 'POST', body: JSON.stringify(user) }),
    delete: (userId) => request(`/api/auth/users/${userId}`, { method: 'DELETE' })
  },
  
  projects: {
    getAll: () => 
      request('/api/projects', {
        method: 'GET'
      }),
      
    getById: (id) => 
      request(`/api/projects/${id}`, {
        method: 'GET'
      }),
      
    create: (projectData) => 
      request('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      }),

    addProgressUpdate: (projectId, note, completion) =>
      request(`/api/projects/${projectId}/updates`, {
        method: 'POST',
        body: JSON.stringify({ note, completion })
      }),

    submitCompletionReport: (data) =>
      request('/api/completion-reports', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  dashboard: {
    getStats: (role) => request(`/api/dashboard-stats?role=${encodeURIComponent(role || '')}`),
    getStateComparison: () => request('/api/state-comparison'),
    getDistrictPerformance: () => request('/api/district-performance')
  },

  audit: {
    getAssignments: () => request('/api/audit-assignments'),
    assign: (taskId, assigned) => 
      request(`/api/audit-assignments/${taskId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ assigned })
      }),
    complete: (taskId) =>
      request(`/api/audit-assignments/${taskId}/complete`, {
        method: 'POST'
      })
  },

  verificationRequests: {
    getAll: () => request('/api/verification-requests'),
    approve: (reqId) => request(`/api/verification-requests/${reqId}/approve`, { method: 'POST' }),
    reject: (reqId) => request(`/api/verification-requests/${reqId}/reject`, { method: 'POST' })
  },

  inspections: {
    getAll: () => request('/api/field-inspections'),
    create: (data) => request('/api/field-inspections', { method: 'POST', body: JSON.stringify(data) })
  },

  aiConfig: {
    get: () => request('/api/ai-config'),
    save: (config) => request('/api/ai-config', { method: 'POST', body: JSON.stringify(config) })
  },

  anomalies: {
    getAll: () => request('/api/anomalies'),
    respond: (anomalyId, response) => 
      request(`/api/anomalies/${anomalyId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response })
      }),
    updateStatus: (anomalyId, status) => 
      request(`/api/anomalies/${anomalyId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      })
  },

  reports: {
    getAll: () => request('/api/reports')
  },

  schemes: {
    getAll: () => 
      request('/api/schemes', {
        method: 'GET'
      })
  },

  contractors: {
    getAll: () => 
      request('/api/contractors', {
        method: 'GET'
      })
  },

  budget: {
    get: () => 
      request('/api/budget-data', {
        method: 'GET'
      })
  },

  auditLogs: {
    getAll: () => 
      request('/api/audit-logs', {
        method: 'GET'
      })
  },

  activityFeed: {
    get: () => 
      request('/api/activity-feed', {
        method: 'GET'
      })
  },

  kpi: {
    get: () => 
      request('/api/kpi-data', {
        method: 'GET'
      })
  },

  districtData: {
    getAll: () => 
      request('/api/district-data', {
        method: 'GET'
      })
  },
  
  verification: {
    analyze: (projectId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      
      return request('/api/verification/analyze', {
        method: 'POST',
        body: formData
      }, 45000);
    }
  },

  notifications: {
    getAll: () => request('/api/notifications'),
    markRead: (id) => request(`/api/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/api/notifications/read-all', { method: 'POST' })
  }
};
