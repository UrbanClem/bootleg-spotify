import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/Feedback';

import AppShell from './components/AppShell';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Album from './pages/Album';
import Artist from './pages/Artist';
import Playlist from './pages/Playlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSongs from './pages/admin/AdminSongs';
import AdminAlbums from './pages/admin/AdminAlbums';
import AdminArtists from './pages/admin/AdminArtists';
import AdminUsers from './pages/admin/AdminUsers';

/**
 * Renders the app shell (sidebar, top bar, player) for authenticated routes.
 * The requested path is remembered so login can return the user to it.
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <AppShell />;
}

/** Keeps signed-in users away from the login and register screens. */
function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();

  // AuthProvider already gates rendering on its own check; this covers the
  // brief window where it has finished but no route has rendered yet.
  if (loading) return <Spinner center />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route index element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/albums/:id" element={<Album />} />
        <Route path="/artists/:id" element={<Artist />} />
        <Route path="/playlists/:id" element={<Playlist />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="albums" element={<AdminAlbums />} />
          <Route path="artists" element={<AdminArtists />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
