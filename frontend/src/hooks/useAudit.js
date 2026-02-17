import { useState } from 'react';
import { submitAudit as submitAuditApi } from '../api/auditApi';

export function useAudit() {
  const [phase, setPhase] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const submitAudit = async (videoUrl) => {
    setPhase('loading');
    setStartTime(Date.now());
    setError(null);
    setResults(null);

    try {
      const data = await submitAuditApi(videoUrl);
      setResults(data);
      setPhase('success');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setPhase('error');
    }
  };

  const reset = () => {
    setPhase('idle');
    setResults(null);
    setError(null);
    setStartTime(null);
  };

  return { phase, results, error, startTime, submitAudit, reset };
}
