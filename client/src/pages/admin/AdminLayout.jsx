import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GridIcon, MusicIcon, AlbumIcon, ArtistIcon, UserIcon } from '../../components/icons';

const TABS = [
  { to: '/admin', end: true, label: 'Resumen', icon: GridIcon },
  { to: '/admin/songs', label: 'Canciones', icon: MusicIcon },
  { to: '/admin/albums', label: 'Álbumes', icon: AlbumIcon },
  { to: '/admin/artists', label: 'Artistas', icon: ArtistIcon },
  { to: '/admin/users', label: 'Usuarios', icon: UserIcon }
];

/** Shared chrome for every admin screen: title bar plus section tabs. */
export default function AdminLayout() {
  const { isAdmin } = useAuth();

  // The API enforces this too, but bouncing here avoids rendering a shell
  // whose every request is about to 403.
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="page">
      <div className="admin-shell">
        <div className="admin-head">
          <h1 className="admin-title">Administración</h1>
        </div>

        <nav className="admin-tabs" aria-label="Secciones de administración">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
