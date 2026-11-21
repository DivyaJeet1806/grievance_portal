import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_GRIEVANCES } from '../data/initialGrievances';
import { getDepartmentForCategory } from '../data/departmentMapping';
import { useAuth } from './AuthContext';

const GrievanceContext = createContext();

const THEME_KEY = 'grievance_hub_theme';
const ROLE_KEY = 'grievance_hub_active_role';
const GRIEVANCES_STORAGE_KEY = 'imsec_grievances_store';

export const GrievanceProvider = ({ children }) => {
  const { getAuthHeaders, user } = useAuth();

  // Theme state - locked to dark mode
  const theme = 'dark';

  // Active Role state: 'complainant' or 'admin'
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem(ROLE_KEY) || 'complainant';
  });

  // Grievances state
  const [grievances, setGrievances] = useState(() => {
    try {
      const stored = localStorage.getItem(GRIEVANCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_GRIEVANCES;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  // Tracked ticket ID for jump-to-tracker
  const [trackedTicketId, setTrackedTicketId] = useState('');
  
  // Active Tab
  const [activeTab, setActiveTab] = useState('lodge');

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Fetch grievances from Node.js REST API
  const fetchGrievances = useCallback(async () => {
    try {
      const res = await fetch('/api/grievances');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setGrievances(json.data);
          setApiConnected(true);
          return;
        }
      }
      setApiConnected(false);
    } catch (err) {
      console.warn('Backend API offline or unreachable; using offline store', err);
      setApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Sync grievances to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(GRIEVANCES_STORAGE_KEY, JSON.stringify(grievances));
    } catch {
      // ignore
    }
  }, [grievances]);

  // Sync theme - dark mode default
  useEffect(() => {
    localStorage.setItem(THEME_KEY, 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Sync role
  useEffect(() => {
    localStorage.setItem(ROLE_KEY, activeRole);
    if (activeRole === 'admin') {
      setActiveTab('overview');
    } else {
      setActiveTab('lodge');
    }
  }, [activeRole]);

  // Create new Grievance via Node API
  const addGrievance = async (formData) => {
    try {
      const payload = {
        ...formData,
        name: user && !formData.isAnonymous ? user.name : formData.name,
        email: user && !formData.isAnonymous ? user.email : formData.email
      };

      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGrievances(prev => [json.data, ...prev]);
          showToast(`Grievance #${json.data.id} registered in Node.js backend!`, 'success');
          return json.data;
        }
      }
    } catch (err) {
      console.error('API Error adding grievance:', err);
    }

    // Local fallback if API fails
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const fallbackId = `GRV-2026-${randomCode}`;
    const now = new Date().toISOString();
    const deptInfo = getDepartmentForCategory(formData.category);
    const assignedDept = deptInfo.department;
    const assignedOfficer = deptInfo.officer;

    const fallbackTicket = {
      id: fallbackId,
      title: formData.title.trim(),
      category: formData.category,
      department: assignedDept,
      description: formData.description.trim(),
      location: formData.location.trim() || 'Main Campus',
      urgency: formData.urgency || 'Medium',
      status: 'Submitted',
      submittedBy: formData.name || (formData.complainantRole === 'teacher' ? 'Faculty Complainant' : 'Student Complainant'),
      complainantRole: formData.complainantRole || (formData.employeeId ? 'teacher' : 'student'),
      employeeId: formData.employeeId || null,
      rollNumber: formData.rollNumber || null,
      designation: formData.designation || null,
      contactEmail: formData.email || '',
      isAnonymous: false,
      createdAt: now,
      updatedAt: now,
      assignedTo: assignedOfficer,
      assignedDepartment: assignedDept,
      timeline: [
        {
          stage: 'Submitted',
          timestamp: now,
          message: `Grievance registered and automatically assigned to ${assignedDept} (${assignedOfficer}) under institutional dispatch protocol.`,
          actor: 'Automated Routing Engine'
        }
      ],
      resolutionNotes: '',
      rating: null,
      feedback: null,
      attachment: formData.attachment || null,
      attachmentUrl: formData.attachmentUrl || (formData.attachment && formData.attachment.startsWith('data:') ? formData.attachment : null)
    };

    setGrievances(prev => [fallbackTicket, ...prev]);
    showToast(`Grievance #${fallbackId} lodged & assigned to ${assignedDept}!`, 'success');
    return fallbackTicket;
  };

  // Update grievance via Node API (JWT Admin Protected)
  const updateGrievanceStatus = async (id, { newStatus, assignedOfficer, officerNote, actorName = 'Redressal Officer' }) => {
    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          newStatus,
          assignedOfficer,
          officerNote,
          actorName: user?.name || actorName
        })
      });

      let json = {};
      try {
        json = await res.json();
      } catch {
        // non-json response
      }

      if (res.status === 401 || res.status === 403) {
        showToast(json.message || 'Authentication error: Admin JWT token required.', 'error');
        return;
      }

      if (res.ok && json.success && json.data) {
        setGrievances(prev => prev.map(item => item.id === id ? json.data : item));
        showToast(`Ticket #${id} updated in Node.js backend!`, 'info');
        return;
      }
    } catch (err) {
      console.error('API Error updating status:', err);
    }

    // Local fallback
    const now = new Date().toISOString();
    setGrievances(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newTimeline = [...item.timeline];
        newTimeline.push({
          stage: newStatus || item.status,
          timestamp: now,
          message: officerNote || `Status updated to ${newStatus}`,
          actor: user?.name || actorName
        });
        return {
          ...item,
          status: newStatus || item.status,
          assignedTo: assignedOfficer !== undefined ? assignedOfficer : item.assignedTo,
          resolutionNotes: officerNote ? officerNote : item.resolutionNotes,
          updatedAt: now,
          timeline: newTimeline
        };
      })
    );
    showToast(`Ticket #${id} updated locally!`, 'info');
  };

  // Submit feedback/rating via Node API
  const rateGrievance = async (id, rating, feedback) => {
    try {
      const res = await fetch(`/api/grievances/${id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ rating, feedback })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGrievances(prev => prev.map(item => item.id === id ? json.data : item));
          showToast('Thank you! Feedback saved to database.', 'success');
          return;
        }
      }
    } catch (err) {
      console.error('API Error saving rating:', err);
    }

    // Local fallback
    setGrievances(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return { ...item, rating, feedback: feedback.trim() };
      })
    );
    showToast('Feedback recorded locally!', 'success');
  };

  // Confirm resolution by Department or Complainant
  const confirmGrievanceResolution = async (id, { confirmedByRole, confirmedByName, status = 'Resolved', notes = '', rating = null, feedback = '' }) => {
    try {
      const res = await fetch(`/api/grievances/${id}/confirm-resolution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          confirmedByRole,
          confirmedByName: confirmedByName || user?.name || (confirmedByRole === 'department' ? 'Department Officer' : 'Complainant'),
          status,
          notes,
          rating,
          feedback
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGrievances(prev => prev.map(item => item.id === id ? json.data : item));
          showToast(`Resolution confirmed for Ticket #${id}!`, 'success');
          return json.data;
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.message || 'Resolution confirmation could not be processed.';
        showToast(errMsg, 'warning');
        return null;
      }
    } catch (err) {
      console.error('API Error confirming resolution:', err);
    }

    // Local fallback
    const now = new Date().toISOString();
    const actor = confirmedByName || user?.name || (confirmedByRole === 'department' ? 'Department Officer' : 'Complainant');
    const existing = grievances.find(g => g.id === id);
    if (confirmedByRole === 'complainant' && existing?.complainantConfirmed && status !== 'Reopened') {
      showToast('This grievance has already been verified and signed off. It can only be submitted once.', 'warning');
      return null;
    }
    setGrievances(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newTimeline = [...(item.timeline || [])];
        const isDept = confirmedByRole === 'department';
        
        let msg = notes;
        if (!msg) {
          msg = isDept ? 'Department confirmed problem is solved.' : 'Complainant verified issue is resolved.';
        }

        newTimeline.push({
          stage: status || 'Resolved',
          timestamp: now,
          message: `${isDept ? 'Department' : 'Complainant'} Confirmed: ${msg}`,
          actor
        });

        return {
          ...item,
          status: status || 'Resolved',
          departmentConfirmed: isDept ? true : item.departmentConfirmed,
          departmentConfirmedAt: isDept ? now : item.departmentConfirmedAt,
          departmentConfirmedBy: isDept ? actor : item.departmentConfirmedBy,
          complainantConfirmed: !isDept ? (status !== 'Reopened') : item.complainantConfirmed,
          complainantConfirmedAt: !isDept ? now : item.complainantConfirmedAt,
          complainantConfirmedBy: !isDept ? actor : item.complainantConfirmedBy,
          resolutionNotes: notes || item.resolutionNotes,
          rating: rating !== null ? Number(rating) : item.rating,
          feedback: feedback || notes || item.feedback,
          updatedAt: now,
          timeline: newTimeline
        };
      })
    );
    showToast(`Resolution confirmed for Ticket #${id} locally!`, 'success');
  };



  // Analytics metrics
  const totalCount = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Submitted').length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <GrievanceContext.Provider
      value={{
        theme,
        activeRole,
        setActiveRole,
        activeTab,
        setActiveTab,
        grievances,
        isLoading,
        apiConnected,
        trackedTicketId,
        setTrackedTicketId,
        addGrievance,
        updateGrievanceStatus,
        rateGrievance,
        confirmGrievanceResolution,
        toast,
        showToast,
        metrics: {
          totalCount,
          pendingCount,
          inProgressCount,
          resolvedCount,
          resolutionRate
        }
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievance = () => {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  return context;
};
