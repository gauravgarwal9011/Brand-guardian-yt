import { AlertTriangle, AlertCircle } from 'lucide-react';
import { SEVERITY_CONFIG } from '../utils/constants';

export default function ComplianceIssueCard({ category, severity, description }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.WARNING;
  const Icon = severity === 'CRITICAL' ? AlertTriangle : AlertCircle;

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm border border-slate-800/50 border-l-4 ${config.leftBorder} rounded-xl p-5 transition-colors hover:bg-gray-800/50`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-slate-100 font-semibold text-sm">{category}</h3>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} shrink-0`}
        >
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
