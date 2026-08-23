import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

const langMap = { javascript: 'javascript', js: 'javascript', python: 'python', html: 'html', css: 'css' };

const ShareView = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/share/${id}`)
      .then(res => { if (!mounted) return; setItem(res.data); })
      .catch(() => setItem(null))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center text-white">Snippet not found</div>;

  const language = langMap[item.language] || 'text';

  const code = item.code || item.description || '';

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(item.title||'snippet').replace(/[^a-z0-9]/gi,'_').toLowerCase()}.${language==='javascript'?'js':'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const embedCode = `<iframe src="${window.location.origin}/share/${id}" style="width:560px;height:320px;border:0;border-radius:8px"></iframe>`;

  return (
    <div className="min-h-screen p-6" style={{ background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${theme==='dark'?'text-white':'text-slate-900'}`}>{item.title || 'Shared Snippet'}</h1>
            <p className={`text-sm ${theme==='dark'?'text-slate-400':'text-slate-600'}`}>Shared on {new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="px-3 py-1 rounded-md bg-white/6 text-slate-100">{theme==='dark'?'Light':'Dark'}</button>
            <button onClick={download} className="px-3 py-1 rounded-md bg-indigo-600 text-white">Download</button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-white/6">
          <SyntaxHighlighter language={language} style={theme === 'dark' ? okaidia : coy} customStyle={{ margin: 0, padding: 20 }}>
            {code}
          </SyntaxHighlighter>
        </div>

        <div className="mt-4">
          <label className={`text-sm font-semibold ${theme==='dark'?'text-white':'text-slate-700'}`}>Embed</label>
          <textarea readOnly value={embedCode} className="w-full mt-2 p-2 rounded-md bg-white/5 text-sm text-slate-100" rows={3} />
        </div>
      </div>
    </div>
  );
};

export default ShareView;
