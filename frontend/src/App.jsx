import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ServiceDetail from './pages/ServiceDetail';
import CreateService from './pages/CreateService';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Notes from './pages/Notes';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import Messages from './pages/Messages';

const Admin = () => <div className="min-h-screen flex items-center justify-center text-white">Admin — Phase 9</div>;

const App = () => {
  const { user } = useAuth();
  return (
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
      <Route path="/notes/create" element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
      <Route path="/notes/:id/edit" element={<ProtectedRoute><EditNote /></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
