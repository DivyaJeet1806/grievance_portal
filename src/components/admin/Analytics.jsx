import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Inbox, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  TrendingUp, 
  ShieldAlert 
} from 'lucide-react';
import { getDepartmentForCategory } from '../../data/departmentMapping';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

export const Analytics = () => {
  const { grievances, metrics, theme } = useGrievance();

  // Category breakdown for Doughnut Chart
  const categoryCounts = {};
  grievances.forEach(g => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  });

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  const doughnutData = {
    labels: Object.keys(categoryCounts).map(k => k.split(' ')[0]), // abbreviated label
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          '#6366f1',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6',
          '#f43f5e',
          '#14b8a6'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#121826' : '#ffffff'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 14,
          font: { family: 'Plus Jakarta Sans', size: 11 }
        }
      }
    },
    cutout: '68%'
  };

  // Status & Priority Bar Chart
  const statusCounts = {
    'Submitted': 0,
    'Under Review': 0,
    'In Progress': 0,
    'Resolved': 0
  };

  grievances.forEach(g => {
    if (statusCounts[g.status] !== undefined) {
      statusCounts[g.status] += 1;
    }
  });

  const barData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Grievance Volume',
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(148, 163, 184, 0.7)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.85)'
        ],
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } },
        beginAtZero: true
      }
    }
  };

  // Export to CSV Function
  const exportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Category', 'Assigned Department', 'Urgency', 'Status', 'Complainant', 'Assigned Officer', 'Created At', 'Rating'];
    const rows = grievances.map(g => [
      g.id,
      `"${g.title.replace(/"/g, '""')}"`,
      `"${g.category}"`,
      `"${g.department || getDepartmentForCategory(g.category).department}"`,
      g.urgency,
      g.status,
      `"${g.submittedBy}"`,
      `"${g.assignedTo}"`,
      new Date(g.createdAt).toISOString(),
      g.rating || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grievance_registry_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Banner with Quick Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Executive Redressal Overview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Real-time compliance monitoring, department distributions, and resolution performance metrics.
          </p>
        </div>

        <button 
          id="export-csv-btn"
          className="btn btn-secondary btn-sm"
          onClick={exportCSV}
        >
          <Download size={15} />
          <span>Export Registry CSV</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        {/* Total Grievances */}
        <div className="glass-panel metric-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}>
          <div className="metric-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)' }}>
            <Inbox size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Total Logged</span>
            <span className="metric-value">{metrics.totalCount}</span>
            <span className="metric-sub">Across 8 departments</span>
          </div>
        </div>

        {/* Pending Triage */}
        <div className="glass-panel metric-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}>
          <div className="metric-icon-box" style={{ background: 'var(--color-blue-bg)', color: 'var(--color-blue)' }}>
            <Clock size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Pending Screening</span>
            <span className="metric-value">{metrics.pendingCount}</span>
            <span className="metric-sub">Awaiting allocation</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-panel metric-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #f59e0b, #f97316)' }}>
          <div className="metric-icon-box" style={{ background: 'var(--color-amber-bg)', color: 'var(--color-amber)' }}>
            <Activity size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-title">In-Flight Actions</span>
            <span className="metric-value">{metrics.inProgressCount}</span>
            <span className="metric-sub">Under active inquiry</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="glass-panel metric-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #10b981, #14b8a6)' }}>
          <div className="metric-icon-box" style={{ background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Resolution Rate</span>
            <span className="metric-value">{metrics.resolutionRate}%</span>
            <span className="metric-sub">{metrics.resolvedCount} solved tickets</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="glass-panel metric-card" style={{ '--accent-gradient': 'linear-gradient(90deg, #f43f5e, #e11d48)' }}>
          <div className="metric-icon-box" style={{ background: 'var(--color-rose-bg)', color: 'var(--color-rose)' }}>
            <AlertTriangle size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-title">Critical Urgency</span>
            <span className="metric-value">{metrics.criticalCount}</span>
            <span className="metric-sub">24h SLA watchlist</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        {/* Status Distribution */}
        <div className="glass-panel chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Workflow Lifecycle Stages</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ticket count across triage pipeline</p>
            </div>
            <TrendingUp size={18} style={{ color: 'var(--primary-500)' }} />
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-panel chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Department Distribution</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Proportion of reported concerns</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
