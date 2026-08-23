import { useState, useEffect } from 'react';
import api from '../services/api';

const NotesPanel = () => {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/notes/mine')
      .then(res => {
        if (!mounted) return;
        setNotes(res.data || res.data || []);
        if ((res.data || []).length) {
          setActiveId((res.data[0] && res.data[0]._id) || (res.data[0] && res.data[0].id));
          setDraft((res.data[0] && (res.data[0].description || res.data[0].content)) || '');
        }
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const note = e.detail;
      setNotes(prev => [note, ...prev]);
      setActiveId(note._id || note.id);
      setDraft(note.description || note.content || '');
    };
    window.addEventListener('snippet-saved', handler);
    return () => window.removeEventListener('snippet-saved', handler);
  }, []);

  const select = (n) => {
    setActiveId(n._id || n.id);
    setDraft(n.description || n.content || '');
  };

  const dragStart = (e, note) => {
    const text = note.description || note.content || '';
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', text);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'note', title: note.title, content: text }));
  };

  const create = async () => {
    const payload = { title: 'Untitled', description: '' };
    try {
      const res = await api.post('/notes', payload);
      const id = res.data?.id || String(Date.now());
      const newNote = { _id: id, title: payload.title, description: '' };
      setNotes([newNote, ...notes]);
      setActiveId(id);
      setDraft('');
    } catch (err) {
      // fallback local
      const id = String(Date.now());
      const newNote = { _id: id, title: payload.title, description: '' };
      setNotes([newNote, ...notes]);
      setActiveId(id);
    }
  };

  const save = async () => {
    if (!activeId) return create();
    const payload = { description: draft };
    try {
      await api.put(`/notes/${activeId}`, payload);
      setNotes(notes.map(n => ( (n._id || n.id) === activeId ? { ...n, description: draft, content: draft } : n)));
    } catch (err) {
      setNotes(notes.map(n => ( (n._id || n.id) === activeId ? { ...n, description: draft, content: draft } : n)));
    }
  };

  const exportNote = (n) => {
    const title = n.title || 'note';
    const body = n.description || n.content || '';
    const md = `# ${title}\n\n${body}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Notes</h3>
        <div className="flex items-center gap-2">
          <button onClick={create} className="text-xs px-2 py-1 rounded-md bg-indigo-600/60 text-white">New</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          {loading && <div className="text-xs text-slate-400">Loading notes…</div>}
          {notes.map(n => (
            <div key={n._id || n.id} draggable onDragStart={(e) => dragStart(e, n)} className={`w-full p-3 rounded-lg border ${((n._id||n.id)===activeId)? 'border-indigo-500/60 bg-slate-800/60' : 'border-white/6 bg-slate-900/50'} cursor-grab`}>
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => select(n)} className="text-left w-full">
                  <div className="text-sm font-semibold text-white truncate">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{(n.description||n.content||'').slice(0,120)}</div>
                </button>
                <button onClick={() => exportNote(n)} className="text-xs px-2 py-1 rounded-md bg-white/6 text-slate-200">Export</button>
              </div>
            </div>
          ))}
        </div>

        <div className="">
          <input value={(notes.find(n => (n._id||n.id)===activeId) || { title: '' }).title} readOnly className="w-full mb-2 bg-transparent border-b border-white/6 text-white text-sm px-1 py-1" />
          <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write or paste code/notes..." className="w-full min-h-[120px] p-3 rounded-lg bg-slate-900/60 text-sm text-slate-100 font-mono resize-y" />
          <div className="flex gap-2 mt-2">
            <button onClick={save} className="px-3 py-1 rounded-md bg-indigo-600/60 text-white text-sm">Save</button>
            <button onClick={() => { setDraft(''); }} className="px-3 py-1 rounded-md bg-white/6 text-slate-200 text-sm">Clear</button>
            <button onClick={() => {
              const active = notes.find(n => (n._id||n.id)===activeId);
              if (active) exportNote(active);
            }} className="px-3 py-1 rounded-md bg-white/6 text-slate-200 text-sm">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
