import { useState } from 'react';
import { FiCopy, FiSun, FiMoon } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

const samples = {
  JS: `// Example: simple fetch
async function fetchServices() {
  const res = await fetch('/api/services');
  return res.json();
}
`,
  HTML: `<!-- Example: service card -->
<article class="service-card">
  <h3>AI Tutoring</h3>
  <p>1-hour session</p>
</article>
`,
  CSS: `/* Example: minimal card */
.service-card {
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg,#111827,#0f172a);
}
`,
};

const mapLang = { JS: 'javascript', HTML: 'html', CSS: 'css' };

const CodePanel = () => {
  const [lang, setLang] = useState('JS');
  const [theme, setTheme] = useState('dark');
  const code = samples[lang];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // small visual feedback could be added
    } catch (e) {
      // ignore
    }
  };

  const exportAsMarkdown = () => {
    const md = `### Snippet\n\n\n\`\`\` ${mapLang[lang]}\n${code}\n\`\`\`\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet_${lang.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHTML = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Snippet</title></head><body><pre><code>${escapeHtml(code)}</code></pre></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet_${lang.toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const dragStart = (e) => {
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', code);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'code-snippet', language: mapLang[lang], code }));
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/6 bg-slate-900/80 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-slate-800/60 to-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-300" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="ml-3 text-sm text-slate-300 font-semibold">index.{lang.toLowerCase()}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex gap-2">
            {Object.keys(samples).map((k) => (
              <button
                key={k}
                onClick={() => setLang(k)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${lang===k? 'bg-indigo-600/60 text-white' : 'text-slate-300 bg-white/3 hover:bg-white/6'}`}>
                {k}
              </button>
            ))}
          </div>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="px-3 py-1 rounded-md bg-white/5 text-slate-100 hover:bg-white/8 flex items-center gap-2">
            {theme === 'dark' ? <FiSun /> : <FiMoon />} <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={exportAsMarkdown} className="px-3 py-1 rounded-md bg-white/5 text-slate-100 hover:bg-white/8 flex items-center gap-2">
            <span className="text-xs">MD</span>
          </button>
          <button onClick={downloadHTML} className="px-3 py-1 rounded-md bg-white/5 text-slate-100 hover:bg-white/8 flex items-center gap-2">
            <span className="text-xs">HTML</span>
          </button>
          <button onClick={copy} className="px-3 py-1 rounded-md bg-white/5 text-slate-100 hover:bg-white/8 flex items-center gap-2">
            <FiCopy /> <span className="text-xs">Copy</span>
          </button>
        </div>
      </div>

      <div draggable onDragStart={dragStart} className="p-3 cursor-grab">
        <SyntaxHighlighter language={mapLang[lang]} style={theme === 'dark' ? okaidia : coy} customStyle={{ margin: 0, borderRadius: 8 }}>
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodePanel;
