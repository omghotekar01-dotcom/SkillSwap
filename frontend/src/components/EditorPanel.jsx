import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FiCopy, FiDownload } from 'react-icons/fi';
import api from '../services/api';

const defaultCode = "// Edit this snippet\nfunction hello(name) {\n  return 'Hello, ' + name;\n}\n";

const EditorPanel = () => {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState('javascript');
  const [expiresIn, setExpiresIn] = useState(0);
  const [customValue, setCustomValue] = useState(1);
  const [customUnit, setCustomUnit] = useState('hours');
  const [shareUrl, setShareUrl] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); } catch (e) {}
  };

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet.${language === 'javascript' ? 'js' : language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertText = (text) => {
    setCode((prev) => `${prev}${prev.trim() ? '\n\n' : ''}${text}`);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const dt = e.dataTransfer;

    if (dt.files && dt.files.length > 0) {
      for (const file of dt.files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result;
            setImagePreview(src);
            insertText(`![Dropped image](${src})`);
          };
          reader.readAsDataURL(file);
        } else {
          const text = await file.text();
          insertText(text);
        }
      }
      return;
    }

    const json = dt.getData('application/json');
    if (json) {
      try {
        const payload = JSON.parse(json);
        if (payload.type === 'note') {
          insertText(payload.content || '');
          return;
        }
        if (payload.type === 'code-snippet') {
          insertText(payload.code || '');
          return;
        }
      } catch {}
    }

    const text = dt.getData('text/plain');
    if (text) {
      insertText(text);
    }
  };

  const saveAsNote = async () => {
    const payload = { title: `Snippet ${new Date().toLocaleString()}`, description: code };
    try {
      const res = await api.post('/notes', payload);
      const id = res.data?.id || String(Date.now());
      const note = { _id: id, title: payload.title, description: code };
      window.dispatchEvent(new CustomEvent('snippet-saved', { detail: note }));
    } catch (err) {
      const id = String(Date.now());
      const note = { _id: id, title: payload.title, description: code };
      window.dispatchEvent(new CustomEvent('snippet-saved', { detail: note }));
    }
  };

  const shareSnippet = async () => {
    try {
      // compute effective expiresIn (in seconds)
      let computedExpiresIn = expiresIn;
      if (expiresIn === -1) {
        const mult = customUnit === 'minutes' ? 60 : customUnit === 'hours' ? 3600 : 86400;
        computedExpiresIn = customValue > 0 ? Math.floor(customValue * mult) : 0;
      }
      const res = await api.post('/share', { code, language, title: `Snippet ${new Date().toLocaleString()}`, expiresIn: computedExpiresIn || undefined });
      const url = res.data?.url || (window.location.origin + `/share/${res.data?.id}`);
      setShareUrl(url);
      try { await navigator.clipboard.writeText(url); } catch (e) {}
      alert('Share link copied to clipboard:\n' + url);
    } catch (err) {
      alert('Failed to share snippet');
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/6 bg-slate-900/80 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/60 to-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300 font-semibold">Editor</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-white/5 text-slate-200 text-sm px-2 py-1 rounded-md">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
          </select>
          <select value={expiresIn} onChange={e => setExpiresIn(Number(e.target.value))} className="bg-white/5 text-slate-200 text-sm px-2 py-1 rounded-md">
            <option value={0}>No expiry</option>
            <option value={3600}>1 hour</option>
            <option value={86400}>1 day</option>
            <option value={604800}>7 days</option>
            <option value={-1}>Custom...</option>
          </select>
          {expiresIn === -1 && (
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={customValue} onChange={e => setCustomValue(Number(e.target.value))} className="w-20 px-2 py-1 rounded-md bg-white/5 text-sm text-slate-100" />
              <select value={customUnit} onChange={e => setCustomUnit(e.target.value)} className="bg-white/5 text-slate-200 text-sm px-2 py-1 rounded-md">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </div>
          )}
          <button onClick={copy} className="px-3 py-1 rounded-md bg-white/5 text-slate-100 hover:bg-white/8 flex items-center gap-2"><FiCopy /> <span className="text-xs">Copy</span></button>
          <button onClick={download} className="px-3 py-1 rounded-md bg-white/5 text-slate-100 hover:bg-white/8 flex items-center gap-2"><FiDownload /> <span className="text-xs">Download</span></button>
          <button onClick={saveAsNote} className="px-3 py-1 rounded-md bg-indigo-600/60 text-white hover:bg-indigo-600/80 flex items-center gap-2"><span className="text-xs">Save as Note</span></button>
          <button onClick={shareSnippet} className="px-3 py-1 rounded-md bg-white/6 text-slate-100 hover:bg-white/8 flex items-center gap-2"><span className="text-xs">Share</span></button>
        </div>
      </div>

      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl border-2 transition pointer-events-none ${isDragActive ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-transparent'}`} />
        <div className="absolute inset-x-0 top-0 flex justify-center mt-4 pointer-events-none">
          <div className="rounded-full bg-slate-950/80 px-4 py-1 text-xs text-slate-300 ring-1 ring-white/10">Drag notes, code, or images into the editor</div>
        </div>
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="h-[320px]"
        >
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={(v) => setCode(v)}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, wordWrap: 'on', fontSize: 13 }}
          />
        </div>
      </div>
      {imagePreview && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">Dropped image preview</div>
          <img src={imagePreview} alt="Dropped" className="max-h-48 w-full object-contain rounded-lg" />
        </div>
      )}
      {shareUrl && (
        <div className="p-3 bg-slate-800/60 border-t border-white/6 flex items-center gap-2">
          <input readOnly value={shareUrl} className="flex-1 bg-transparent text-sm text-slate-200" />
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); }} className="px-3 py-1 rounded-md bg-indigo-600 text-white">Copy Link</button>
        </div>
      )}
      {/* expiration preview */}
      <div className="px-4 py-2 text-xs text-slate-400">
        {(() => {
          let seconds = expiresIn;
          if (expiresIn === -1) {
            const mult = customUnit === 'minutes' ? 60 : customUnit === 'hours' ? 3600 : 86400;
            seconds = customValue > 0 ? Math.floor(customValue * mult) : 0;
          }
          if (!seconds) return <div>No expiry selected.</div>;
          const when = new Date(Date.now() + seconds * 1000);
          return <div>Expires: {when.toLocaleString()}</div>;
        })()}
      </div>
    </div>
  );
};

export default EditorPanel;
