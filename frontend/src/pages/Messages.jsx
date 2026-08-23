import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { PageContainer, PageShell } from '../components/ui';

const Messages = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/messages/${userId}`)
      .then(r => {
        const msgs = Array.isArray(r.data) ? r.data : r.data?.messages || [];
        setMessages(msgs);
      })
      .catch(err => {
        console.error('Failed to load messages:', err);
        toast.error('Unable to load conversation');
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${userId}`, { content });
      if (data) {
        setMessages(p => [...p, data]);
        setText('');
      }
    } catch (err) {
      console.error('Send error:', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-5xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>
        <div className="card overflow-hidden">
          <div className="-mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-white/10 bg-white/5 p-5 sm:-mx-6 sm:-mt-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Campus Chat</h1>
              <p className="text-sm text-slate-500">Secure peer conversation</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Online</span>
          </div>
          <div className="mb-4 h-[56vh] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading conversation…</div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">No messages yet. Start the conversation!</div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map(msg => (
                  <div key={msg._id} className={`max-w-[85%] px-4 py-3 rounded-3xl shadow-sm ${msg.sender?._id === user?._id ? 'self-end bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 text-white' : 'bg-white/5 text-gray-300'}`}> 
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-[11px] mt-2 text-gray-400">{msg.sender?.name || 'You'}</p>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex gap-3">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…" className="input-field flex-1" />
            <button type="submit" disabled={sending} className="btn-primary px-4">
              {sending ? '...' : <FiSend size={18} />}
            </button>
          </form>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default Messages;
