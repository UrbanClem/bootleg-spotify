import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Alert, Spinner } from '../../components/Feedback';
import { errorMessage } from '../../utils';
import { useI18n } from '../../i18n';

const TILES = [
  { key: 'songs', labelKey: 'admin.songs', to: '/admin/songs', icon: '♫' },
  { key: 'albums', labelKey: 'admin.albums', to: '/admin/albums', icon: '◉' },
  { key: 'artists', labelKey: 'admin.artists', to: '/admin/artists', icon: '☺' },
  { key: 'users', labelKey: 'admin.users', to: '/admin/users', icon: '⚑' }
];

/** Catalogue overview plus the most recent sign-ups. */
export default function AdminDashboard() {
  const { t, n } = useI18n();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    Promise.all([
      api.get('/songs'),
      api.get('/albums'),
      api.get('/artists'),
      api.get('/users')
    ])
      .then(([s, a, ar, u]) => {
        if (!alive) return;
        setData({
          songs: s.data.length,
          albums: a.data.length,
          artists: ar.data.length,
          withAudio: s.data.filter((x) => x.archivo_audio).length,
          totalSeconds: s.data.reduce((sum, x) => sum + (Number(x.duracion) || 0), 0)
        });
        setUsers(u.data);
      })
      .catch((err) => alive && setError(errorMessage(err, t, t('admin.loadError'))))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [t]);

  if (loading) return <Spinner center />;

  return (
    <>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="stat-grid">
        {TILES.map((tile) => (
          <Link key={tile.key} className="stat stat--link" to={tile.to}>
            <div className="stat-label">{t(tile.labelKey)}</div>
            <div className="stat-value">
              {data ? n(data[tile.key]) : t('common.unknown')}
            </div>
            <span className="stat-hint">{t('admin.manage')}</span>
          </Link>
        ))}
      </div>

      <div className="detail-grid" style={{ padding: 0, marginTop: 32 }}>
        <div className="panel">
          <h2 className="panel-title">{t('admin.withAudioTitle')}</h2>
          <p style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em' }}>
            {n(data?.withAudio ?? 0)}{' '}
            <span className="text-subdued" style={{ fontSize: 16, fontWeight: 500 }}>
              {t('admin.withAudioOf', { n: n(data?.songs ?? 0) })}
            </span>
          </p>
          <p className="text-subdued" style={{ fontSize: 14, marginTop: 8 }}>
            {t('admin.withAudioHint')}
          </p>
          <Link className="btn btn--primary btn--sm" to="/admin/songs" style={{ marginTop: 16 }}>
            {t('admin.manageSongs')}
          </Link>
        </div>

        <div className="panel">
          <h2 className="panel-title">{t('admin.recentUsers')}</h2>
          <ul className="mini-list">
            {users.slice(0, 5).map((u) => (
              <li key={u.id_usuario}>
                <span className="mini-list-name">{u.nombre}</span>
                <span className="mini-list-meta">{u.email}</span>
              </li>
            ))}
            {users.length === 0 && <li className="text-subdued">{t('admin.noData')}</li>}
          </ul>
        </div>
      </div>
    </>
  );
}
