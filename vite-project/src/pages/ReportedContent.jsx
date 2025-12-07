// src/pages/ReportedContent.jsx
import React from 'react';
import { FiFlag, FiAlertTriangle } from 'react-icons/fi';
import EmptyState from '../components/ui/EmptyState';

const ReportedContent = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Reported Content</h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <EmptyState
            icon={FiFlag}
            title="No Reported Content"
            description="There are currently no reports to review. Great job keeping the platform safe!"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportedContent;
