import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { GridIcon, MusicIcon, AlbumIcon, ArtistIcon, UserIcon } from '../../components/icons';

const TABS = [
  { to: '/admin', end: true, labelKey: 'admin.overview', icon: GridIcon },
  { to: '/admin/songs', labelKey: 'admin.songs', icon: MusicIcon },
  { to: '/admin/albums', labelKey: 'admin.albums', icon: AlbumIcon },
  { to: '/admin/artists', labelKey: 'admin.artists', icon: ArtistIcon },
  { to: '/admin/users', labelKey: 'admin.users', icon: UserIcon }
];

/** Shared chrome for every admin screen: title bar plus section tabs. */
export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const { t } = useI18n();

  // The API enforces this too, but bouncing here avoids rendering a shell
  // whose every request is about to 403.
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="page">
      <div className="admin-shell">
        <div className="admin-head">
          <h1 className="admin-title">{t('admin.title')}</h1>
        </div>

        <nav className="admin-tabs" aria-label={t('admin.sections')}>
          {TABS.map((entry) => (
            <NavLink
              key={entry.to}
              to={entry.to}
              end={entry.end}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {t(entry.labelKey)}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
