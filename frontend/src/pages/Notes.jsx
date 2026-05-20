import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFileText } from 'react-icons/fi';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes')
      .then(r => setNotes(r.data.notes || []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white">Campus Notes</h1>
            <p className="text-gray-400 mt-2">Browse study notes and materials shared by students across campus.</p>
          </div>
          {user && (
            <Link to="/notes/create" className="btn-primary flex items-center gap-2 text-sm py-2">
              <FiPlus size={16} /> Upload Notes
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card h-24 animate-pulse" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <FiFileText size={36} className="mx-auto mb-4 opacity-30" />
            <p>No notes available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
              <div key={note._id} className="card hover:border-indigo-500 transition-colors">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm text-indigo-300 uppercase tracking-[0.2em]">{note.subject}</p>
                  <span className="text-xs text-gray-500">Sem {note.semester}</span>
                </div>
                <h2 className="text-lg font-semibold text-white mb-2 truncate">{note.title}</h2>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{note.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{note.college || 'Campus Notes'}</span>
                  <span>₹{note.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
