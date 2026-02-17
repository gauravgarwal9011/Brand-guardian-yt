import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { STATUS_CONFIG } from '../utils/constants';

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.FAIL;
  const Icon = status === 'PASS' ? ShieldCheck : ShieldAlert;

  return (
    <div
      className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl border ${config.bg} ${config.border} ${config.text}`}
    >
      <Icon className="w-7 h-7" />
      <span className="text-xl font-bold uppercase tracking-wide">
        {config.label}
      </span>
    </div>
  );
}
