import { useState, useEffect } from 'react';
import { ShieldCheck, Download, Upload, FileText, Search, FileCheck, Check } from 'lucide-react';
import { LOADING_STEPS } from '../utils/constants';

const ICON_MAP = {
  Download,
  Upload,
  FileText,
  Search,
  FileCheck,
};

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
    : `${seconds}s`;
}

export default function LoadingState({ startTime }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Advance through simulated steps
  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, LOADING_STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        setElapsed(Date.now() - startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="animate-fade-in">
      {/* Shimmer bar */}
      <div className="shimmer-bar h-1 rounded-full mb-8" />

      <div className="bg-gray-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
        {/* Pulsing shield */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 animate-pulse-ring" />
            </div>
            <ShieldCheck className="w-12 h-12 text-blue-400 relative z-10 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-slate-100 mb-2">
          Audit in Progress
        </h2>
        <p className="text-slate-400 text-sm text-center mb-8">
          Analyzing your video for compliance violations...
        </p>

        {/* Step list */}
        <div className="space-y-4">
          {LOADING_STEPS.map((step, index) => {
            const Icon = ICON_MAP[step.icon];
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isFuture = index > currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isFuture ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* Step indicator */}
                <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-950 border border-green-800 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-slate-700 mx-auto" />
                  )}
                </div>

                {/* Icon */}
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400'
                      : 'text-slate-600'
                  }`}
                />

                {/* Label */}
                <span
                  className={`text-sm ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-slate-100 font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="inline-block ml-1 animate-pulse">...</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-xs">
            This usually takes 2-5 minutes. Please keep this tab open.
          </p>
          <p className="text-slate-400 text-sm font-mono">
            Elapsed: {formatElapsed(elapsed)}
          </p>
        </div>
      </div>
    </div>
  );
}
