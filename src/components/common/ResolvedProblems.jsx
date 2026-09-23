import React, { useState, useMemo } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENT_DIRECTORY, getDepartmentForCategory } from '../../data/departmentMapping';
import {
  CheckCircle,
  CheckCircle2,
  Search,
  Building2,
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  Award,
  ArrowRight,
  Filter,
  Sparkles,
  Inbox,
  User,
  Clock,
  MessageSquare,
  Paperclip,
  TrendingUp,
  FileCheck,
  ArrowUpDown,
  LayoutGrid,
  List,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';

export const ResolvedProblems = () => {
  const { grievances, setTrackedTicketId, setActiveTab } = useGrievance();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  // Sorting: 'department-asc', 'department-desc', 'date-desc', 'rating-desc'
  const [sortBy, setSortBy] = useState('department-asc');
  // View mode: 'list' or 'grouped'
  const [viewMode, setViewMode] = useState('grouped');

  // Filter only resolved problems
  const rawResolvedList = useMemo(() => {
    return grievances.filter(g => g.status === 'Resolved');
  }, [grievances]);

  // Apply search & filters
  const filteredList = useMemo(() => {
    return rawResolvedList.filter(item => {
      // Department filter
      if (deptFilter !== 'ALL') {
        const dept = item.department || getDepartmentForCategory(item.category).department;
        if (dept !== deptFilter) return false;
      }

      // Rating filter
      if (ratingFilter !== 'ALL') {
        if (ratingFilter === '5') {
          if (item.rating !== 5) return false;
        } else if (ratingFilter === '4+') {
          if (!item.rating || item.rating < 4) return false;
        } else if (ratingFilter === 'rated') {
          if (!item.rating) return false;
        }
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchSubmitter = item.submittedBy.toLowerCase().includes(q);
        const matchLocation = item.location.toLowerCase().includes(q);
        const matchOfficer = (item.assignedTo || '').toLowerCase().includes(q);
        const matchDept = (item.department || getDepartmentForCategory(item.category).department || '').toLowerCase().includes(q);
        return matchId || matchTitle || matchDesc || matchSubmitter || matchLocation || matchOfficer || matchDept;
      }

      return true;
    });
  }, [rawResolvedList, deptFilter, ratingFilter, search]);

  // Sorted list
  const sortedResolvedList = useMemo(() => {
    const list = [...filteredList];

    list.sort((a, b) => {
      const deptA = (a.department || getDepartmentForCategory(a.category).department || '').toLowerCase();
      const deptB = (b.department || getDepartmentForCategory(b.category).department || '').toLowerCase();

      if (sortBy === 'department-asc') {
        return deptA.localeCompare(deptB);
      }
      if (sortBy === 'department-desc') {
        return deptB.localeCompare(deptA);
      }
      if (sortBy === 'rating-desc') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'date-desc') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      return 0;
    });

    return list;
  }, [filteredList, sortBy]);

  // Grouped by department object
  const groupedByDepartment = useMemo(() => {
    const groups = {};
    sortedResolvedList.forEach(item => {
      const dept = item.department || getDepartmentForCategory(item.category).department;
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(item);
    });
    return groups;
  }, [sortedResolvedList]);

  // Stats
  const totalResolved = rawResolvedList.length;
  const ratedTickets = rawResolvedList.filter(g => g.rating);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, g) => sum + g.rating, 0) / ratedTickets.length).toFixed(1)
    : '5.0';
  const dualVerifiedCount = rawResolvedList.filter(g => g.departmentConfirmed && g.complainantConfirmed).length;

  const handleTrackTicket = (id) => {
    setTrackedTicketId(id);
    setActiveTab('track');
  };

  const departmentsList = Object.entries(DEPARTMENT_DIRECTORY).map(([cat, info]) => ({
    category: cat,
    department: info.department,
    officer: info.officer,
    email: info.email
  }));

  // Render a Single Solved Problem Card
  const renderCard = (item) => {
    const isDualVerified = item.departmentConfirmed && item.complainantConfirmed;
    const dept = item.department || getDepartmentForCategory(item.category).department;

    return (
      <div
        key={item.id}
        className="glass-panel"
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '4px solid #10b981',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          marginBottom: '1rem'
        }}
      >
        {/* Top Bar: Ticket ID, Solved Badge, Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span className="ticket-mono" style={{ fontSize: '0.95rem' }}>{item.id}</span>
            <span className="badge badge-resolved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={12} />
              Solved
            </span>
            {isDualVerified && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                <Sparkles size={11} /> Dual-Party Verified
              </span>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: 'var(--primary-500)',
              fontSize: '0.74rem',
              fontWeight: 700
            }}>
              <Building2 size={11} /> {dept}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Calendar size={13} />
            <span>Resolved on {new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Problem Title */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.25 }}>
          {item.title}
        </h3>

        {/* Problem Stated Description */}
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
          {item.description}
        </p>

        {/* Official Resolution Summary (Action Taken) */}
        {item.resolutionNotes && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1.15rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <ShieldCheck size={14} />
              Department Resolution Notice & Action Taken
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
              {item.resolutionNotes}
            </p>
          </div>
        )}

        {/* Complainant Feedback & Rating if available */}
        {(item.rating || item.feedback) && (
          <div style={{
            background: 'rgba(250, 204, 21, 0.07)',
            border: '1px solid rgba(250, 204, 21, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.15rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {item.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= item.rating ? '#facc15' : 'none'}
                      color={s <= item.rating ? '#facc15' : 'var(--text-muted)'}
                    />
                  ))}
                  <strong style={{ fontSize: '0.82rem', marginLeft: '0.25rem' }}>({item.rating}/5 Stars)</strong>
                </div>
              )}
              {item.feedback && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{item.feedback}"
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Verified by {item.submittedBy}
            </span>
          </div>
        )}

        {/* Footer Metadata */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              <Building2 size={13} style={{ color: 'var(--primary-500)' }} />
              {dept}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-blue)', fontWeight: 600 }}>
              👤 {item.assignedTo}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MapPin size={13} />
              {item.location}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            onClick={() => handleTrackTicket(item.id)}
          >
            <span>View Audit Trail</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <FileCheck size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.15 }}>
                    Solved Problems
                  </h1>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.35)'
                  }}>
                    {totalResolved} Solved
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                  Institutional repository of all solved and closed campus grievances, sorted and categorized by department.
                </p>
              </div>
            </div>
          </div>

          {/* Role badge and back button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.role === 'admin' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#a855f7',
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.25)'
              }}>
                <ShieldAlert size={13} /> Administrative Department Oversight
              </span>
            )}
            <button
              id="back-to-active-btn"
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab(user?.role === 'admin' ? 'triage' : 'my-tickets')}
              style={{ fontSize: '0.84rem' }}
            >
              <span>← View Active Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
              {totalResolved}
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
              Total Problems Solved
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(250, 204, 21, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#facc15'
          }}>
            <Star size={24} fill="#facc15" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {avgRating} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
              Average Satisfaction
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-500)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-500)', lineHeight: 1 }}>
              {dualVerifiedCount}
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
              Dual-Party Verified
            </div>
          </div>
        </div>
      </div>

      {/* DEPARTMENT QUICK SELECT CHIPS (Sort & Filter by Department) */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={14} style={{ color: 'var(--primary-500)' }} />
            <span>Select & Filter by Department</span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Showing {filteredList.length} of {totalResolved} solved problem{totalResolved !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`filter-pill ${deptFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setDeptFilter('ALL')}
            style={{ fontWeight: 700, fontSize: '0.8rem' }}
          >
            All Departments ({totalResolved})
          </button>
          {departmentsList.map(d => {
            const count = rawResolvedList.filter(g => (g.department || getDepartmentForCategory(g.category).department) === d.department).length;
            const isSelected = deptFilter === d.department;

            return (
              <button
                key={d.category}
                type="button"
                className={`filter-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setDeptFilter(d.department)}
                style={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderColor: isSelected ? 'var(--primary-500)' : count > 0 ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)',
                  color: isSelected ? '#fff' : count > 0 ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                <span>{d.department.split(' ')[0]} {d.department.split(' ')[1] || ''}</span>
                <span style={{
                  marginLeft: '0.35rem',
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOOLBAR: Search, Sort According to Department, View Mode Toggle */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="solved-search-input"
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem', fontSize: '0.88rem' }}
            placeholder="Search solved problems, keywords, ticket ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* SORT ACCORDING TO DEPARTMENT CONTROL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={15} style={{ color: 'var(--primary-500)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Sort By:</span>
          <select
            id="solved-sort-select"
            className="select-control"
            style={{ fontSize: '0.86rem', padding: '0.55rem 0.9rem', fontWeight: 600 }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="department-asc">Department (A → Z)</option>
            <option value="department-desc">Department (Z → A)</option>
            <option value="date-desc">Date Resolved (Newest First)</option>
            <option value="rating-desc">Highest Satisfaction Rating</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div style={{ minWidth: '150px' }}>
          <select
            id="solved-rating-filter"
            className="select-control"
            style={{ width: '100%', fontSize: '0.86rem', padding: '0.55rem 0.9rem' }}
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4+">4+ Stars</option>
            <option value="rated">Has Feedback</option>
          </select>
        </div>

        {/* View Mode Toggle: List vs Grouped by Department */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--surface-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.2rem'
        }}>
          <button
            type="button"
            title="Group by Department"
            onClick={() => setViewMode('grouped')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: viewMode === 'grouped' ? 'var(--primary-gradient)' : 'transparent',
              color: viewMode === 'grouped' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <LayoutGrid size={14} />
            <span>Grouped by Dept</span>
          </button>
          <button
            type="button"
            title="Flat List View"
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: viewMode === 'list' ? 'var(--primary-gradient)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <List size={14} />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* SOLVED PROBLEMS DISPLAY */}
      {filteredList.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)' }}>
          <Inbox size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Solved Problems Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            {search.trim() || deptFilter !== 'ALL' || ratingFilter !== 'ALL'
              ? 'No solved complaints match your active filter criteria. Try resetting filters.'
              : 'Once grievances are confirmed solved by the designated department or citizen, they will appear here.'}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => { setSearch(''); setDeptFilter('ALL'); setRatingFilter('ALL'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grouped' ? (
        /* GROUPED BY DEPARTMENT VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(groupedByDepartment).map(([departmentName, tickets]) => {
            const deptInfo = Object.values(DEPARTMENT_DIRECTORY).find(d => d.department === departmentName);
            const officerName = deptInfo?.officer || tickets[0]?.assignedTo || 'Department Officer';

            return (
              <div key={departmentName}>
                {/* Department Section Header Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.08))',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-500)'
                    }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {departmentName}
                      </h2>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Officer in Charge: <strong style={{ color: 'var(--color-blue)' }}>{officerName}</strong>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '0.3rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <CheckCircle size={13} />
                    {tickets.length} Problem{tickets.length !== 1 ? 's' : ''} Solved
                  </span>
                </div>

                {/* Tickets under this department */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tickets.map(item => renderCard(item))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* FLAT LIST VIEW (Sorted) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedResolvedList.map(item => renderCard(item))}
        </div>
      )}
    </div>
  );
};
