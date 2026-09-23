import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = () => {
  const { toast } = useGrievance();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="urgency-medium" style={{ color: 'var(--color-emerald)' }} />,
    error: <AlertCircle size={18} style={{ color: 'var(--color-rose)' }} />,
    warning: <AlertTriangle size={18} style={{ color: 'var(--color-amber)' }} />,
    info: <Info size={18} style={{ color: 'var(--primary-500)' }} />
  };

  return (
    <div className={`toast-banner ${toast.type}`}>
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
    </div>
  );
};
