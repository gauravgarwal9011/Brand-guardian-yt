import { useState } from 'react';
import { Link, Scan } from 'lucide-react';
import { YOUTUBE_REGEX } from '../utils/constants';

export default function AuditForm({ onSubmit }) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = YOUTUBE_REGEX.test(url.trim());
  const showError = touched && url.trim() !== '' && !isValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
          Audit a YouTube Video
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
          Paste a YouTube URL below to scan for brand compliance violations using AI-powered analysis.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
      >
        <div className="relative">
          <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-gray-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            autoFocus
          />
        </div>

        {showError && (
          <p className="text-red-400 text-sm mt-2 ml-1">
            Please enter a valid YouTube URL (youtube.com/watch, youtu.be/, or youtube.com/shorts/)
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2.5 transition-all duration-200 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
        >
          <Scan className="w-5 h-5" />
          Start Compliance Audit
        </button>
      </form>
    </div>
  );
}
