import { XCircle, RotateCcw } from 'lucide-react';
import { useAudit } from './hooks/useAudit';
import Header from './components/Header';
import Footer from './components/Footer';
import AuditForm from './components/AuditForm';
import LoadingState from './components/LoadingState';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const { phase, results, error, startTime, submitAudit, reset } = useAudit();

  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-dot-grid text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        {phase === 'idle' && <AuditForm onSubmit={submitAudit} />}

        {phase === 'checking' && (
          <div className="animate-fade-in text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Checking video duration...</p>
          </div>
        )}

        {phase === 'loading' && <LoadingState startTime={startTime} />}

        {phase === 'success' && (
          <ResultsDashboard results={results} onReset={reset} />
        )}

        {phase === 'error' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-6 sm:p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-400 mb-2">Audit Failed</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                {error || 'An unexpected error occurred. Please check that the backend is running and try again.'}
              </p>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
