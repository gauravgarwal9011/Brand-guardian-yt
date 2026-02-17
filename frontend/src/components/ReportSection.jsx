import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-100 mb-4 pb-2 border-b border-slate-700">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-slate-200 mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-slate-200 mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1.5 text-slate-300 mb-4 ml-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 mb-4 ml-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-slate-300">{children}</li>,
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-slate-300 italic">{children}</em>,
  code: ({ children, className }) => {
    const isBlock = className;
    if (isBlock) {
      return (
        <code className="block bg-gray-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto my-4">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-blue-300">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-gray-800/50 pl-4 py-2 my-4 italic text-slate-400">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-slate-700 my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm text-slate-300 border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left p-2 bg-gray-800 text-slate-200 font-semibold border-b border-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="p-2 border-b border-slate-800">{children}</td>
  ),
};

export default function ReportSection({ report }) {
  if (!report) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-100">Detailed Report</h3>
      </div>
      <div className="bg-gray-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}
