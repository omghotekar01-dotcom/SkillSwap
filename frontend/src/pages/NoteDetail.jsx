import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiEdit2, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { PageContainer, PageShell } from '../components/ui';

const NoteDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/notes/${id}`)
      .then(r => setNote(r.data))
      .catch(err => {
        console.error('Failed to load note:', err);
        navigate('/notes');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm('Delete this note?')) return;
    setDeleting(true);
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted');
      navigate('/notes');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!note) return null;

  const isOwner = user?._id === note.seller?._id;

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-cyan-300 uppercase tracking-[0.2em]">{note.subject} - Sem {note.semester}</p>
              <h1 className="text-2xl font-semibold text-white mt-2">{note.title}</h1>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link to={`/notes/${id}/edit`} className="btn-ghost flex items-center gap-2"><FiEdit2/> Edit</Link>
                <button onClick={handleDelete} disabled={deleting} className="btn-ghost text-red-400"><FiTrash2/> {deleting ? '…' : 'Delete'}</button>
              </div>
            )}
          </div>

          <p className="text-gray-400 mb-4">{note.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>{note.college || 'Campus Notes'}</div>
            <div className="flex items-center gap-3">₹{note.price}
              {note.fileUrl && (<a href={note.fileUrl} target="_blank" rel="noreferrer" className="ml-3 text-indigo-300 flex items-center gap-1"><FiDownload/> Download</a>)}
            </div>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
};

export default NoteDetail;
