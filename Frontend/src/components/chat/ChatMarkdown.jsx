import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-ink-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="mb-1.5 mt-2 text-base font-bold text-ink-900 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-1.5 mt-2 text-[15px] font-bold text-ink-900 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-1.5 text-sm font-semibold text-ink-900 first:mt-0">{children}</h3>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-brand-700 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-2 border-cream-200" />,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-brand-300 pl-3 italic text-ink-700">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-ink-900 p-3 font-mono text-xs leading-relaxed text-white">
      {children}
    </pre>
  ),
  code: ({ node, children }) => {
    const isBlock = node?.parent?.type === 'element' && node.parent.tagName === 'pre';
    if (isBlock) {
      return <code className="block overflow-x-auto bg-transparent text-xs leading-relaxed text-white">{children}</code>;
    }
    return <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.82em] text-ink-900">{children}</code>;
  },
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-cream-200">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-cream-200 bg-cream-100 px-2 py-1 text-left font-semibold text-ink-900">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-cream-100 px-2 py-1 align-top">{children}</td>,
};

export default function ChatMarkdown({ children }) {
  return (
    <div className="break-words text-sm text-ink-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
