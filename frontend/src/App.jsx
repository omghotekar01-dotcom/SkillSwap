import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Home = lazy(() => import('./pages/Home'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const NoteDetail = lazy(() => import('./pages/NoteDetail'));
const CreateService = lazy(() => import('./pages/CreateService'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Notes = lazy(() => import('./pages/Notes'));
const CreateNote = lazy(() => import('./pages/CreateNote'));
const EditNote = lazy(() => import('./pages/EditNote'));
const Messages = lazy(() => import('./pages/Messages'));
const ShareView = lazy(() => import('./pages/ShareView'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminShares = lazy(() => import('./pages/AdminShares'));
const AI = lazy(() => import('./pages/AI'));
const VideoCall = lazy(() => import('./pages/VideoCall'));

const App = () => {
  const { user, loading } = useAuth();
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/create" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
        <Route path="/marketplace/:id" element={<ServiceDetail />} />
        <Route path="/marketplace/:id/edit" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:id" element={<NoteDetail />} />
        <Route path="/notes/create" element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
        <Route path="/notes/:id/edit" element={<ProtectedRoute><EditNote /></ProtectedRoute>} />
        <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
        <Route path="/share/:id" element={<ShareView />} />
        <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
        <Route path="/video" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        <Route path="/admin/shares" element={<ProtectedRoute adminOnly><AdminShares /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Suspense>
  );
};

export default App;
