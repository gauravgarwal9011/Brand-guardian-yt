import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-slate-800/50 bg-[#0a0e1a]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0" strokeWidth={2} />
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Brand Guardian AI
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            AI-Powered Video Compliance Auditing
          </p>
        </div>
      </div>
    </header>
  );
}
