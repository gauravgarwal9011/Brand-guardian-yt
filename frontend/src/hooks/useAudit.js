import { useState } from 'react';
import { checkDuration, submitAudit as submitAuditApi } from '../api/auditApi';

export function useAudit() {
  const [phase, setPhase] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const submitAudit = async (videoUrl) => {
    setPhase('checking');
    setError(null);
    setResults(null);

    try {
      const durationData = await checkDuration(videoUrl);

      if (!durationData.allowed) {
        setError(
          `Video is ${durationData.duration} seconds long. ` +
          `Maximum allowed duration is ${durationData.max_duration} seconds. ` +
          `Please submit a shorter video.`
        );
        setPhase('error');
        return;
      }

      setPhase('loading');
      setStartTime(Date.now());

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
