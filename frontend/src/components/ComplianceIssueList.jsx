import { AlertTriangle, CheckCircle } from 'lucide-react';
import ComplianceIssueCard from './ComplianceIssueCard';

export default function ComplianceIssueList({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-green-950/30 border border-green-800/50 rounded-xl p-6 text-center">
        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
        <p className="text-green-400 font-medium">No violations detected</p>
        <p className="text-slate-400 text-sm mt-1">
          This video meets all compliance requirements.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-slate-100">
          Violations Detected ({issues.length})
        </h3>
      </div>
      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <ComplianceIssueCard
              category={issue.category}
              severity={issue.severity}
              description={issue.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
