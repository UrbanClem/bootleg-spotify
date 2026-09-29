import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Alert, Spinner } from '../../components/Feedback';
import { errorMessage } from '../../utils';

const TILES = [
  { key: 'songs', label: 'Canciones', to: '/admin/songs', icon: '♫' },
  { key: 'albums', label: 'Álbumes', to: '/admin/albums', icon: '◉' },
  { key: 'artists', label: 'Artistas', to: '/admin/artists', icon: '☺' },
  { key: 'users', label: 'Usuarios', to: '/admin/users', icon: '⚑' }
];

/** Catalogue overview plus the most recent sign-ups. */
export default function AdminDashboard() {
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
      .catch((err) => alive && setError(errorMessage(err, 'No se pudo cargar el panel.')))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Spinner center />;

  return (
    <>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="stat-grid">
        {TILES.map((t) => (
          <Link key={t.key} className="stat stat--link" to={t.to}>
            <div className="stat-label">{t.label}</div>
            <div className="stat-value">{data?.[t.key] ?? '—'}</div>
            <span className="stat-hint">Administrar →</span>
          </Link>
        ))}
      </div>

      <div className="detail-grid" style={{ padding: 0, marginTop: 32 }}>
        <div className="panel">
          <h2 className="panel-title">Canciones con audio</h2>
          <p style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em' }}>
            {data?.withAudio ?? 0}{' '}
            <span className="text-subdued" style={{ fontSize: 16, fontWeight: 500 }}>
              de {data?.songs ?? 0}
            </span>
          </p>
          <p className="text-subdued" style={{ fontSize: 14, marginTop: 8 }}>
            Las canciones sin archivo no se pueden reproducir todavía. Sube el audio
            desde la sección Canciones.
          </p>
          <Link className="btn btn--primary btn--sm" to="/admin/songs" style={{ marginTop: 16 }}>
            Gestionar canciones
          </Link>
        </div>

        <div className="panel">
          <h2 className="panel-title">Usuarios recientes</h2>
          <ul className="mini-list">
            {users.slice(0, 5).map((u) => (
              <li key={u.id_usuario}>
                <span className="mini-list-name">{u.nombre}</span>
                <span className="mini-list-meta">{u.email}</span>
              </li>
            ))}
            {users.length === 0 && <li className="text-subdued">Sin datos.</li>}
          </ul>
        </div>
      </div>
    </>
  );
}
