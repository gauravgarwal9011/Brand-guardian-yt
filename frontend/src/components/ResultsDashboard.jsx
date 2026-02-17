import { CheckCircle, RotateCcw } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ComplianceIssueList from './ComplianceIssueList';
import ReportSection from './ReportSection';

export default function ResultsDashboard({ results, onReset }) {
  if (!results) return null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-slate-100">Audit Complete</h2>
        </div>
        <p className="text-slate-400 text-sm mb-1">
          Session: <span className="font-mono text-slate-500">{results.session_id}</span>
        </p>
        <p className="text-slate-400 text-sm">
          Video ID: <span className="font-mono text-slate-500">{results.video_id}</span>
        </p>
      </div>

      {/* Status badge */}
      <div className="flex justify-center">
        <StatusBadge status={results.status} />
      </div>

      {/* Compliance issues */}
      <ComplianceIssueList issues={results.compliance_results} />

      {/* Final report */}
      <ReportSection report={results.final_report} />

      {/* Reset button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Audit Another Video
        </button>
      </div>
    </div>
  );
}
