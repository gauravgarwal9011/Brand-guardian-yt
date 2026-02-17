export const LOADING_STEPS = [
  { label: 'Downloading video from YouTube', icon: 'Download', duration: 15000 },
  { label: 'Uploading to Azure Video Indexer', icon: 'Upload', duration: 20000 },
  { label: 'Extracting transcript & visual data', icon: 'FileText', duration: 60000 },
  { label: 'Analyzing compliance against regulations', icon: 'Search', duration: 45000 },
  { label: 'Generating compliance report', icon: 'FileCheck', duration: 30000 },
];

export const SEVERITY_CONFIG = {
  CRITICAL: {
    bg: 'bg-red-950',
    text: 'text-red-400',
    border: 'border-red-800',
    leftBorder: 'border-l-red-500',
    label: 'Critical',
  },
  WARNING: {
    bg: 'bg-amber-950',
    text: 'text-amber-400',
    border: 'border-amber-800',
    leftBorder: 'border-l-amber-500',
    label: 'Warning',
  },
};

export const STATUS_CONFIG = {
  PASS: {
    bg: 'bg-green-950',
    text: 'text-green-400',
    border: 'border-green-800',
    label: 'Compliance Passed',
  },
  FAIL: {
    bg: 'bg-red-950',
    text: 'text-red-400',
    border: 'border-red-800',
    label: 'Compliance Failed',
  },
};

export const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;
